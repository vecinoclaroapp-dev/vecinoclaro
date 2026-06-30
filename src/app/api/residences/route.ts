import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserContext, unauthorized, noCondominium } from "@/lib/api-context";
import { outstandingFromEntries } from "@/lib/money";

// GET /api/residences
export async function GET(request: Request) {
  const { user, condominium } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();

  const { searchParams } = new URL(request.url);
  const activeOnly = searchParams.get("active") !== "false";
  const withBalances = searchParams.get("balances") !== "false";

  const residences = await db.residence.findMany({
    where: {
      condominiumId: condominium.id,
      ...(activeOnly ? { active: true } : {}),
    },
    include: {
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
      aliquot: r.aliquot,
      ownerName: r.ownerName,
      ownerPhone: r.ownerPhone,
      ownerEmail: r.ownerEmail,
      residentName: r.residentName,
      residentPhone: r.residentPhone,
      active: r.active,
      createdAt: r.createdAt,
      condominiumName: condominium.name,
      baseFeeUSD: condominium.baseFeeUSD,
      paymentsCount: r._count.payments,
      invoicesCount: r._count.invoices,
      outstandingUSD: balances.usd,
      outstandingVES: balances.ves,
      status: balances.usd > 0.01 ? "DEBT" : balances.usd < -0.01 ? "CREDIT" : "SETTLED",
    };
  });

  return NextResponse.json({ residences: data });
}

// POST /api/residences
export async function POST(request: Request) {
  const { user, condominium } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();

  try {
    const body = await request.json();
    if (!body.number || !body.ownerName) {
      return NextResponse.json(
        { error: "Número y propietario son obligatorios" },
        { status: 400 },
      );
    }

    const residence = await db.residence.create({
      data: {
        condominiumId: condominium.id,
        number: String(body.number).trim().toUpperCase(),
        floor: body.floor?.trim() || null,
        type: body.type || "APARTMENT",
        aliquot: Number(body.aliquot) || 1,
        ownerName: body.ownerName.trim(),
        ownerPhone: body.ownerPhone?.trim() || null,
        ownerEmail: body.ownerEmail?.trim() || null,
        residentName: body.residentName?.trim() || null,
        residentPhone: body.residentPhone?.trim() || null,
        joinCode: crypto.randomBytes(4).toString("hex").toUpperCase(),
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
