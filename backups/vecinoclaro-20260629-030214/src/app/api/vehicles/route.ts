import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserContext, unauthorized, noCondominium } from "@/lib/api-context";

// GET /api/vehicles
export async function GET() {
  const { user, condominium } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();

  const vehicles = await db.vehicle.findMany({
    where: { condominiumId: condominium.id, active: true },
    orderBy: [{ plate: "asc" }],
    take: 200,
  });

  return NextResponse.json(vehicles);
}

// POST /api/vehicles (solo admin)
export async function POST(request: Request) {
  const { user, condominium, membership } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();
  if (membership?.role !== "ADMIN") {
    return NextResponse.json({ error: "Solo el administrador puede registrar vehículos" }, { status: 403 });
  }

  try {
    const body = await request.json();
    if (!body.plate) {
      return NextResponse.json({ error: "Placa requerida" }, { status: 400 });
    }

    const plate = String(body.plate).trim().toUpperCase();

    const existing = await db.vehicle.findUnique({
      where: { condominiumId_plate: { condominiumId: condominium.id, plate } },
    });
    if (existing) {
      return NextResponse.json({ error: "Ya existe un vehículo con esa placa" }, { status: 409 });
    }

    const vehicle = await db.vehicle.create({
      data: {
        condominiumId: condominium.id,
        plate,
        brand: body.brand?.trim() || null,
        model: body.model?.trim() || null,
        color: body.color?.trim() || null,
        type: body.type || "CAR",
        ownerName: body.ownerName?.trim() || null,
        ownerPhone: body.ownerPhone?.trim() || null,
        residenceLabel: body.residenceLabel?.trim() || null,
        active: body.active !== false,
      },
    });

    return NextResponse.json({ vehicle }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al registrar vehículo" },
      { status: 500 },
    );
  }
}
