import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getLatestRate } from "@/lib/bcv";
import { appendLedgerEntry } from "@/lib/ledger";
import { usdToVes, round2 } from "@/lib/money";
import { SERVICE_TYPES, type ServiceChargeType } from "@/lib/constants";

// GET /api/services — cargos de servicios críticos
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const type = searchParams.get("type");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (type) where.type = type;

  const charges = await db.serviceCharge.findMany({
    where,
    include: {
      residence: { select: { number: true, ownerName: true } },
      bcvRate: { select: { rate: true, date: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    services: charges.map((s) => ({
      id: s.id,
      condominiumId: s.condominiumId,
      residenceId: s.residenceId,
      residenceNumber: s.residence?.number ?? null,
      ownerName: s.residence?.ownerName ?? null,
      type: s.type,
      title: s.title,
      description: s.description,
      amountUSD: s.amountUSD,
      amountVES: s.amountVES,
      bcvRate: s.bcvRate.rate,
      dueDate: s.dueDate,
      status: s.status,
      createdAt: s.createdAt,
      prorrateado: s.residenceId === null,
    })),
  });
}

// POST /api/services — crear cargo de servicio crítico
export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.title || !body.type) {
      return NextResponse.json({ error: "Título y tipo son obligatorios" }, { status: 400 });
    }
    if (!SERVICE_TYPES.some((t) => t.value === body.type)) {
      return NextResponse.json({ error: "Tipo de servicio inválido" }, { status: 400 });
    }
    const type = body.type as ServiceChargeType;

    const condo = await db.condominium.findFirst();
    if (!condo) {
      return NextResponse.json({ error: "No hay condominio" }, { status: 400 });
    }

    const rate =
      body.bcvRateId
        ? await db.bcvRate.findUnique({ where: { id: body.bcvRateId } })
        : await getLatestRate();
    if (!rate) {
      return NextResponse.json(
        { error: "No hay tasa BCV. Sincronice primero." },
        { status: 400 },
      );
    }

    let amountUSD = round2(Number(body.amountUSD));
    if (!amountUSD || amountUSD <= 0) {
      return NextResponse.json({ error: "Monto USD inválido" }, { status: 400 });
    }
    const amountVES = usdToVes(amountUSD, rate.rate);

    const charge = await db.serviceCharge.create({
      data: {
        condominiumId: condo.id,
        residenceId: body.residenceId || null, // null = prorrateado
        type,
        title: body.title.trim(),
        description: body.description?.trim() || null,
        amountUSD,
        amountVES,
        bcvRateId: rate.id,
        dueDate: body.dueDate ? new Date(body.dueDate) : new Date(Date.now() + 15 * 86400000),
        status: body.status || "PENDING",
      },
    });

    // Generar asientos DEBIT en el ledger
    if (body.residenceId) {
      // Cargo directo a una vivienda
      await appendLedgerEntry({
        residenceId: body.residenceId,
        type: "DEBIT",
        amountUSD,
        amountVES,
        bcvRateId: rate.id,
        concept: charge.title,
        category: "SERVICE_CHARGE",
        reference: charge.id,
        date: new Date(),
        serviceChargeId: charge.id,
      });
    } else {
      // Prorrateado: cargar a todas las viviendas activas
      // Locales comerciales pagan 2.5x (alícuota mayor)
      const residences = await db.residence.findMany({ where: { active: true } });
      for (const r of residences) {
        const factor = r.type === "LOCAL" ? 2.5 : 1;
        const aUSD = round2(amountUSD * factor);
        const aVES = usdToVes(aUSD, rate.rate);
        await appendLedgerEntry({
          residenceId: r.id,
          type: "DEBIT",
          amountUSD: aUSD,
          amountVES: aVES,
          bcvRateId: rate.id,
          concept: charge.title,
          category: "SERVICE_CHARGE",
          reference: charge.id,
          date: new Date(),
          serviceChargeId: charge.id,
        });
      }
    }

    return NextResponse.json({ ok: true, service: charge }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al crear cargo" },
      { status: 500 },
    );
  }
}
