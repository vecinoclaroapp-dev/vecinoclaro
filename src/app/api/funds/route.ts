import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserContext, unauthorized, noCondominium } from "@/lib/api-context";

// GET /api/funds
export async function GET() {
  const { user, condominium, membership } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();

  const funds = await db.fund.findMany({
    where: { condominiumId: condominium.id },
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });

  return NextResponse.json({
    funds: funds.map((f) => ({
      id: f.id,
      name: f.name,
      type: f.type,
      balanceUSD: f.balanceUSD,
      balanceVES: f.balanceVES,
      targetUSD: f.targetUSD,
      active: f.active,
      createdAt: f.createdAt,
    })),
  });
}

// POST /api/funds
export async function POST(request: Request) {
  const { user, condominium } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();
  if (membership?.role !== "ADMIN") {
    return NextResponse.json({ error: "Solo el administrador puede realizar esta acción" }, { status: 403 });
  }

  try {
    const body = await request.json();
    if (!body.name) {
      return NextResponse.json({ error: "Nombre es obligatorio" }, { status: 400 });
    }

    const fund = await db.fund.create({
      data: {
        condominiumId: condominium.id,
        name: body.name.trim(),
        type: body.type || "ORDINARY",
        balanceUSD: Number(body.balanceUSD) || 0,
        balanceVES: Number(body.balanceVES) || 0,
        targetUSD: body.targetUSD ? Number(body.targetUSD) : null,
        active: true,
      },
    });

    return NextResponse.json({ ok: true, fund }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al crear fondo" },
      { status: 500 },
    );
  }
}
