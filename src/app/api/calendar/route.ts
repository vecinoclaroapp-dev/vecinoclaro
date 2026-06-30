import { NextResponse } from "next/server";
import { requireModule } from "@/lib/module-check";
import { db } from "@/lib/db";
import { getUserContext, unauthorized, noCondominium } from "@/lib/api-context";

// GET /api/calendar
export async function GET(request: Request) {
  const { user, condominium } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();
  await requireModule(condominium.id, "calendar");

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const where: Record<string, unknown> = { condominiumId: condominium.id };
  if (from || to) {
    where.startDate = {};
    if (from) (where.startDate as Record<string, unknown>).gte = new Date(from);
    if (to) (where.startDate as Record<string, unknown>).lte = new Date(to);
  }

  const events = await db.calendarEvent.findMany({
    where,
    orderBy: { startDate: "asc" },
    take: 200,
  });

  return NextResponse.json(events);
}

// POST /api/calendar (solo admin)
export async function POST(request: Request) {
  const { user, condominium, membership } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();
  if (membership?.role !== "ADMIN") {
    return NextResponse.json({ error: "Solo el administrador puede crear eventos" }, { status: 403 });
  }

  try {
    const body = await request.json();
    if (!body.title || !body.startDate) {
      return NextResponse.json({ error: "Título y fecha de inicio son obligatorios" }, { status: 400 });
    }

    const event = await db.calendarEvent.create({
      data: {
        condominiumId: condominium.id,
        title: String(body.title).trim(),
        description: body.description?.trim() || null,
        startDate: new Date(body.startDate),
        endDate: body.endDate ? new Date(body.endDate) : null,
        type: body.type || "EVENT",
        location: body.location?.trim() || null,
      },
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al crear evento" },
      { status: 500 },
    );
  }
}
