import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserContext, unauthorized, noCondominium } from "@/lib/api-context";

// GET /api/facilities/reservations
export async function GET(request: Request) {
  const { user, condominium, membership } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();

  const { searchParams } = new URL(request.url);
  const facilityId = searchParams.get("facilityId");

  const where: Record<string, unknown> = { facility: { condominiumId: condominium.id } };
  if (facilityId) where.facilityId = facilityId;
  if (membership?.role === "RESIDENT" && membership.residenceId) {
    where.OR = [{ residenceId: membership.residenceId }, { userId: user.id }];
  }

  const reservations = await db.facilityReservation.findMany({
    where,
    include: {
      facility: { select: { name: true } },
      residence: { select: { number: true } },
    },
    orderBy: { startDate: "desc" },
    take: 200,
  });

  return NextResponse.json(reservations);
}

// POST /api/facilities/reservations
export async function POST(request: Request) {
  const { user, condominium, membership } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();

  try {
    const body = await request.json();
    if (!body.facilityId || !body.startDate || !body.endDate) {
      return NextResponse.json(
        { error: "Instalación, fecha inicio y fin son obligatorias" },
        { status: 400 },
      );
    }

    const facility = await db.facility.findFirst({
      where: { id: body.facilityId, condominiumId: condominium.id },
    });
    if (!facility) {
      return NextResponse.json({ error: "Instalación no encontrada" }, { status: 404 });
    }
    if (!facility.active) {
      return NextResponse.json({ error: "Instalación no disponible" }, { status: 400 });
    }

    const startDate = new Date(body.startDate);
    const endDate = new Date(body.endDate);
    if (endDate <= startDate) {
      return NextResponse.json({ error: "Fecha fin debe ser mayor a inicio" }, { status: 400 });
    }

    // Verificar solapamiento
    const overlap = await db.facilityReservation.findFirst({
      where: {
        facilityId: body.facilityId,
        status: { in: ["PENDING", "CONFIRMED"] },
        OR: [
          { startDate: { lte: endDate }, endDate: { gte: startDate } },
        ],
      },
    });
    if (overlap) {
      return NextResponse.json({ error: "Ya existe una reserva en ese horario" }, { status: 409 });
    }

    const reservation = await db.facilityReservation.create({
      data: {
        facilityId: body.facilityId,
        residenceId: membership?.residenceId ?? body.residenceId ?? null,
        userId: user.id,
        startDate,
        endDate,
        status: "PENDING",
        notes: body.notes?.trim() || null,
      },
    });

    return NextResponse.json({ reservation }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al crear reserva" },
      { status: 500 },
    );
  }
}
