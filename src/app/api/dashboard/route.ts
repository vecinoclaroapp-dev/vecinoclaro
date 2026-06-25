import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { outstandingFromEntries, sum } from "@/lib/money";
import { PAYMENT_METHODS, PAYMENT_METHOD_MAP } from "@/lib/constants";

// GET /api/dashboard — métricas consolidadas para el dashboard
export async function GET() {
  const [condo, residences, payments, services, latestRate, recentRates] = await Promise.all([
    db.condominium.findFirst(),
    db.residence.findMany({
      where: { active: true },
      include: { ledgerEntries: { select: { type: true, amountUSD: true, amountVES: true } } },
    }),
    db.payment.findMany({
      where: { status: "CONFIRMED" },
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
    db.serviceCharge.findMany({ where: { status: { in: ["PENDING", "PARTIAL", "OVERDUE"] } } }),
    db.bcvRate.findFirst({ orderBy: { date: "desc" } }),
    db.bcvRate.findMany({ orderBy: { date: "asc" }, take: 30 }),
  ]);

  // --- saldos consolidados del condominio ---
  let totalOutstandingUSD = 0;
  let totalOutstandingVES = 0;
  let totalCreditUSD = 0; // viviendas con saldo a favor
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
      ownerName: r.ownerName,
      type: r.type,
      outstandingUSD: b.usd,
      outstandingVES: b.ves,
      status: b.usd > 0.01 ? "DEBT" : b.usd < -0.01 ? "CREDIT" : "SETTLED",
    };
  });

  // --- totales de pagos recibidos ---
  const totalPaymentsUSD = sum(payments.map((p) => p.amountUSD));
  const totalPaymentsVES = sum(payments.map((p) => p.amountVES));

  // --- pagos por método ---
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

  // --- pagos por mes (últimos 6 meses) ---
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

  // --- servicios críticos pendientes ---
  const pendingServicesTotalUSD = sum(services.map((s) => s.amountUSD));

  return NextResponse.json({
    condominium: condo
      ? {
          name: condo.name,
          rif: condo.rif,
          baseFeeUSD: condo.baseFeeUSD,
          reserveFund: condo.reserveFund,
        }
      : null,
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
    },
    paymentsByMethod: byMethod,
    paymentsByMonth: monthsData,
    recentPayments: payments.slice(0, 8).map((p) => ({
      id: p.id,
      residenceNumber: p.residence.number,
      ownerName: p.residence.ownerName,
      amountUSD: p.amountUSD,
      amountVES: p.amountVES,
      method: p.method,
      date: p.date,
    })),
    residenceBalances: residenceBalances
      .sort((a, b) => b.outstandingUSD - a.outstandingUSD)
      .slice(0, 10),
  });
}
