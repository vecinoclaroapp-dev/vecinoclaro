import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { outstandingFromEntries } from "@/lib/money";

// GET /api/residences — listado con saldos calculados desde ledger inmutable
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const activeOnly = searchParams.get("active") !== "false";
  const withBalances = searchParams.get("balances") !== "false";

  const residences = await db.residence.findMany({
    where: activeOnly ? { active: true } : undefined,
    include: {
      condominium: { select: { name: true, baseFeeUSD: true } },
      ledgerEntries: withBalances
        ? { select: { type: true, amountUSD: true, amountVES: true } }
        : false,
      _count: { select: { payments: true, invoices: true } },
    },
    orderBy: [{ type: "asc" }, { number: "asc" }],
  });

  const data = residences.map((r) => {
    const balances = outstandingFromEntries(r.ledgerEntries ?? []);
    return {
      id: r.id,
      number: r.number,
      floor: r.floor,
      type: r.type,
      ownerName: r.ownerName,
      ownerPhone: r.ownerPhone,
      ownerEmail: r.ownerEmail,
      residentName: r.residentName,
      active: r.active,
      createdAt: r.createdAt,
      condominiumName: r.condominium.name,
      baseFeeUSD: r.condominium.baseFeeUSD,
      paymentsCount: r._count.payments,
      invoicesCount: r._count.invoices,
      outstandingUSD: balances.usd,
      outstandingVES: balances.ves,
      // positivo = debe; negativo = crédito a favor
      status: balances.usd > 0.01 ? "DEBT" : balances.usd < -0.01 ? "CREDIT" : "SETTLED",
    };
  });

  return NextResponse.json({ residences: data });
}

// POST /api/residences — crear vivienda
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // validar
    if (!body.number || !body.ownerName) {
      return NextResponse.json(
        { error: "Número y propietario son obligatorios" },
        { status: 400 },
      );
    }

    const condo = await db.condominium.findFirst();
    if (!condo) {
      return NextResponse.json({ error: "No hay condominio configurado" }, { status: 400 });
    }

    const residence = await db.residence.create({
      data: {
        condominiumId: condo.id,
        number: String(body.number).trim().toUpperCase(),
        floor: body.floor?.trim() || null,
        type: body.type || "APARTMENT",
        ownerName: body.ownerName.trim(),
        ownerPhone: body.ownerPhone?.trim() || null,
        ownerEmail: body.ownerEmail?.trim() || null,
        residentName: body.residentName?.trim() || null,
        active: body.active !== false,
      },
    });

    return NextResponse.json({ residence }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al crear vivienda";
    if (msg.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Ya existe una vivienda con ese número en este condominio" },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
