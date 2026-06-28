import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserContext, unauthorized, noCondominium } from "@/lib/api-context";

// GET /api/works
export async function GET() {
  const { user, condominium } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();

  const works = await db.work.findMany({
    where: { condominiumId: condominium.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json(works);
}

// POST /api/works (solo admin)
export async function POST(request: Request) {
  const { user, condominium, membership } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();
  if (membership?.role !== "ADMIN") {
    return NextResponse.json({ error: "Solo el administrador puede registrar obras" }, { status: 403 });
  }

  try {
    const body = await request.json();
    if (!body.title) {
      return NextResponse.json({ error: "Título requerido" }, { status: 400 });
    }

    const work = await db.work.create({
      data: {
        condominiumId: condominium.id,
        title: String(body.title).trim(),
        description: body.description?.trim() || null,
        type: body.type || "REPAIR",
        status: body.status || "PLANNED",
        progress: Number(body.progress ?? 0),
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        budgetUSD: body.budgetUSD != null && body.budgetUSD !== "" ? Number(body.budgetUSD) : null,
        spentUSD: Number(body.spentUSD ?? 0),
        contractor: body.contractor?.trim() || null,
        location: body.location?.trim() || null,
      },
    });

    return NextResponse.json({ work }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al crear obra" },
      { status: 500 },
    );
  }
}
