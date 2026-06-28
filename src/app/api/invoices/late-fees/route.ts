import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserContext, unauthorized, noCondominium } from "@/lib/api-context";
import { getRateForDate } from "@/lib/bcv";
import { usdToVes, round2 } from "@/lib/money";
import { appendLedgerEntry } from "@/lib/ledger";

// POST /api/invoices/late-fees — aplicar mora a facturas vencidas
export async function POST(request: Request) {
  const { user, condominium, membership } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();
  if (membership?.role !== "ADMIN") {
    return NextResponse.json({ error: "Solo el administrador puede aplicar mora" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const now = new Date();

    const billing = await db.billingConfig.findUnique({ where: { condominiumId: condominium.id } });
    const graceDays = billing?.graceDays ?? 0;
    const lateFeePercent = body.lateFeePercent != null ? Number(body.lateFeePercent) : billing?.lateFeePercent ?? 0;
    const lateFeeFixedUSD = body.lateFeeFixedUSD != null ? Number(body.lateFeeFixedUSD) : billing?.lateFeeFixedUSD ?? 0;

    if (lateFeePercent <= 0 && lateFeeFixedUSD <= 0) {
      return NextResponse.json(
        { error: "Configure un % de mora o un monto fijo en Configuración de Facturación" },
        { status: 400 },
      );
    }

    // Facturas vencidas con saldo pendiente (considerando días de gracia)
    const graceDate = new Date(now);
    graceDate.setDate(graceDate.getDate() - graceDays);

    const invoices = await db.invoice.findMany({
      where: {
        residence: { condominiumId: condominium.id },
        status: "PENDING",
        dueDate: { lt: graceDate },
      },
      include: { residence: true },
    });

    const rate = await getRateForDate(now);

    let applied = 0;
    let totalPenaltyUSD = 0;

    for (const inv of invoices) {
      const outstanding = inv.amountUSD - inv.paidAmountUSD;
      if (outstanding <= 0.01) continue;

      const penaltyUSD = round2(
        Math.max(
          (outstanding * lateFeePercent) / 100,
          lateFeeFixedUSD,
        ),
      );
      if (penaltyUSD <= 0) continue;

      const bcvRate = rate ?? (await db.bcvRate.findUnique({ where: { id: inv.bcvRateId } }));
      if (!bcvRate) continue;

      const penaltyVES = round2(usdToVes(penaltyUSD, bcvRate.rate));

      await appendLedgerEntry({
        residenceId: inv.residenceId,
        type: "DEBIT",
        amountUSD: penaltyUSD,
        amountVES: penaltyVES,
        bcvRateId: bcvRate.id,
        concept: `Mora — Factura ${inv.period}`,
        category: "PENALTY",
        reference: inv.id,
        date: now,
        invoiceId: inv.id,
      });

      totalPenaltyUSD += penaltyUSD;
      applied++;
    }

    return NextResponse.json({
      ok: true,
      applied,
      totalPenaltyUSD: round2(totalPenaltyUSD),
      lateFeePercent,
      lateFeeFixedUSD,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al aplicar mora" },
      { status: 500 },
    );
  }
}
