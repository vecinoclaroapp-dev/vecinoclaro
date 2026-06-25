import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserContext, unauthorized, noCondominium } from "@/lib/api-context";
import { outstandingFromEntries, sum } from "@/lib/money";
import { PAYMENT_METHODS, PAYMENT_METHOD_MAP } from "@/lib/constants";

// GET /api/dashboard
export async function GET() {
  const { user, condominium } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();

  const [residences, payments, services, latestRate, recentRates, funds, expenses] = await Promise.all([
    db.residence.findMany({
      where: { condominiumId: condominium.id, active: true },
      include: { ledgerEntries: { select: { type: true, amountUSD: true, amountVES: true } } },
    }),
    db.payment.findMany({
      where: { residence: { condominiumId: condominium.id }, status: "CONFIRMED" },
      select: {
        id: true,
        amountUSD: true,
        amountVES: true,
        method: true,
        date: true,
        residence: { select: { number: true, ownerName: true } },
      },
      orderBy: { date: "desc" },
      take: 200,
    }),
    db.serviceCharge.findMany({
      where: { condominiumId: condominium.id, status: { in: ["PENDING", "PARTIAL", "OVERDUE"] } },
    }),
    db.bcvRate.findFirst({ orderBy: { date: "desc" } }),
    db.bcvRate.findMany({ orderBy: { date: "asc" }, take: 30 }),
    db.fund.findMany({ where: { condominiumId: condominium.id, active: true } }),
    db.expense.findMany({
      where: { condominiumId: condominium.id, status: "CONFIRMED" },
      orderBy: { date: "desc" },
      take: 100,
    }),
  ]);

  let totalOutstandingUSD = 0;
  let totalOutstandingVES = 0;
  let totalCreditUSD = 0;
  let debtorsCount = 0;
  let creditorsCount = 0;
  let settledCount = 0;

  const residenceBalances = residences.map((r) => {
    const b = outstandingFromEntries(r.ledgerEntries);
    if (b.usd > 0.01) {
      totalOutstandingUSD += b.usd;
      totalOutstandingVES += b.ves;
      debtorsCount++;
    } else if (b.usd < -0.01) {
      totalCreditUSD += Math.abs(b.usd);
      creditorsCount++;
    } else {
      settledCount++;
    }
    return {
      id: r.id,
      number: r.number,
      ownerName: r.ownerName ?? "—",
      type: r.type,
      outstandingUSD: b.usd,
      outstandingVES: b.ves,
      status: b.usd > 0.01 ? "DEBT" : b.usd < -0.01 ? "CREDIT" : "SETTLED",
    };
  });

  const totalPaymentsUSD = sum(payments.map((p) => p.amountUSD));
  const totalPaymentsVES = sum(payments.map((p) => p.amountVES));

  const byMethod = PAYMENT_METHODS.map((m) => {
    const list = payments.filter((p) => p.method === m.value);
    return {
      method: m.value,
      label: m.label,
      count: list.length,
      totalUSD: sum(list.map((p) => p.amountUSD)),
      totalVES: sum(list.map((p) => p.amountVES)),
    };
  });

  const now = new Date();
  const monthsData: { label: string; usd: number; ves: number; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const next = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const monthPayments = payments.filter((p) => {
      const pd = new Date(p.date);
      return pd >= d && pd < next;
    });
    const labels = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    monthsData.push({
      label: `${labels[d.getMonth()]} ${d.getFullYear()}`,
      usd: sum(monthPayments.map((p) => p.amountUSD)),
      ves: sum(monthPayments.map((p) => p.amountVES)),
      count: monthPayments.length,
    });
  }

  const pendingServicesTotalUSD = sum(services.map((s) => s.amountUSD));
  const totalExpensesUSD = sum(expenses.map((e) => e.amountUSD));

  return NextResponse.json({
    condominium: {
      id: condominium.id,
      name: condominium.name,
      rif: condominium.rif,
      baseFeeUSD: condominium.baseFeeUSD,
      reserveFund: condominium.reserveFund,
      setupComplete: condominium.setupComplete,
    },
    bcv: latestRate
      ? { rate: latestRate.rate, date: latestRate.date, source: latestRate.source }
      : null,
    bcvHistory: recentRates.map((r) => ({ date: r.date, rate: r.rate })),
    totals: {
      residencesCount: residences.length,
      debtorsCount,
      creditorsCount,
      settledCount,
      totalOutstandingUSD,
      totalOutstandingVES,
      totalCreditUSD,
      totalPaymentsUSD,
      totalPaymentsVES,
      paymentsCount: payments.length,
      pendingServicesCount: services.length,
      pendingServicesTotalUSD,
      totalExpensesUSD,
      fundsCount: funds.length,
    },
    funds: funds.map((f) => ({
      id: f.id,
      name: f.name,
      type: f.type,
      balanceUSD: f.balanceUSD,
      balanceVES: f.balanceVES,
      targetUSD: f.targetUSD,
    })),
    paymentsByMethod: byMethod,
    paymentsByMonth: monthsData,
    recentPayments: payments.slice(0, 8).map((p) => ({
      id: p.id,
      residenceNumber: p.residence.number,
      ownerName: p.residence.ownerName ?? "—",
      amountUSD: p.amountUSD,
      amountVES: p.amountVES,
      method: p.method,
      date: p.date,
    })),
    residenceBalances: residenceBalances.sort((a, b) => b.outstandingUSD - a.outstandingUSD).slice(0, 10),
  });
}
