import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserContext, unauthorized, noCondominium } from "@/lib/api-context";

// GET /api/facilities
export async function GET() {
  const { user, condominium } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();

  const facilities = await db.facility.findMany({
    where: { condominiumId: condominium.id },
    include: {
      _count: { select: { reservations: true } },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(facilities);
}

// POST /api/facilities (solo admin)
export async function POST(request: Request) {
  const { user, condominium, membership } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();
  if (membership?.role !== "ADMIN") {
    return NextResponse.json({ error: "Solo el administrador puede crear instalaciones" }, { status: 403 });
  }

  try {
    const body = await request.json();
    if (!body.name) {
      return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
    }

    const facility = await db.facility.create({
      data: {
        condominiumId: condominium.id,
        name: String(body.name).trim(),
        description: body.description?.trim() || null,
        capacity: body.capacity ? Number(body.capacity) : null,
        openHour: Number(body.openHour ?? 6),
        closeHour: Number(body.closeHour ?? 22),
        active: body.active !== false,
      },
    });

    return NextResponse.json({ facility }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al crear instalación" },
      { status: 500 },
    );
  }
}
