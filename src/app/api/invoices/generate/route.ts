import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserContext, unauthorized, noCondominium } from "@/lib/api-context";
import { getRateForDate } from "@/lib/bcv";
import { usdToVes, round2 } from "@/lib/money";

// POST /api/invoices/generate — generar facturas batch para un período
export async function POST(request: Request) {
  const { user, condominium, membership } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();
  if (membership?.role !== "ADMIN") {
    return NextResponse.json({ error: "Solo el administrador puede generar facturas" }, { status: 403 });
  }

  try {
    const body = await request.json();
    // period: "2025-01" (default: mes actual)
    const now = new Date();
    const period =
      body.period ||
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    // Validar formato
    if (!/^\d{4}-\d{2}$/.test(period)) {
      return NextResponse.json({ error: "Formato de período inválido (usar AAAA-MM)" }, { status: 400 });
    }

    const [year, month] = period.split("-").map(Number);
    const periodDate = new Date(year, month - 1, 1);

    // Configuración de facturación
    const billing = await db.billingConfig.findUnique({ where: { condominiumId: condominium.id } });
    const dueDays = billing?.dueDays ?? 15;
    const baseFeeUSD = body.baseFeeUSD != null ? Number(body.baseFeeUSD) : condominium.baseFeeUSD;

    if (baseFeeUSD <= 0) {
      return NextResponse.json(
        { error: "Defina la cuota mensual base (baseFeeUSD) del condominio primero" },
        { status: 400 },
      );
    }

    // Tasa BCV para la fecha
    const rate = await getRateForDate(periodDate);
    if (!rate) {
      return NextResponse.json(
        { error: "No hay tasa BCV disponible para el período. Sincronice la tasa primero." },
        { status: 400 },
      );
    }

    const residences = await db.residence.findMany({
      where: { condominiumId: condominium.id, active: true },
    });

    const dueDate = new Date(periodDate);
    dueDate.setDate(dueDate.getDate() + dueDays);

    let created = 0;
    let skipped = 0;

    for (const r of residences) {
      const existing = await db.invoice.findUnique({
        where: { residenceId_period: { residenceId: r.id, period } },
      });
      if (existing) {
        skipped++;
        continue;
      }

      const amountUSD = round2(baseFeeUSD * (r.aliquot || 1));
      const amountVES = round2(usdToVes(amountUSD, rate.rate));

      const invoice = await db.invoice.create({
        data: {
          residenceId: r.id,
          period,
          amountUSD,
          amountVES,
          bcvRateId: rate.id,
          dueDate,
          status: "PENDING",
          paidAmountUSD: 0,
        },
      });

      // Crear asiento DEBIT en el ledger por la factura generada
      await appendLedgerEntry({
        residenceId: r.id,
        type: "DEBIT",
        amountUSD,
        amountVES,
        bcvRateId: rate.id,
        concept: `Factura ${period}`,
        category: "INVOICE",
        reference: invoice.id,
        date: new Date(),
        invoiceId: invoice.id,
      });
      created++;
    }

    return NextResponse.json({
      ok: true,
      period,
      total: residences.length,
      created,
      skipped,
      baseFeeUSD,
      dueDate,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al generar facturas" },
      { status: 500 },
    );
  }
}
