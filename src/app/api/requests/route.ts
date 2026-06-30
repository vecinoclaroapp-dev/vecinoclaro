import { NextResponse } from "next/server";
import { requireModule } from "@/lib/module-check";
import { db } from "@/lib/db";
import { getUserContext, unauthorized, noCondominium } from "@/lib/api-context";
import { createNotificationForMembers } from "@/lib/notifications";

// GET /api/requests — solicitudes de residentes
export async function GET(request: Request) {
  const { user, condominium, membership } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const where: Record<string, unknown> = { condominiumId: condominium.id };
  if (status) where.status = status;
  // Los residentes solo ven sus propias solicitudes
  if (membership?.role === "RESIDENT") {
    where.OR = [{ userId: user.id }, { residenceId: membership.residenceId ?? undefined }];
    delete where.status;
    if (status) where.status = status;
  }

  const requests = await db.residentRequest.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json(requests);
}

// POST /api/requests
export async function POST(request: Request) {
  const { user, condominium, membership } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();

  try {
    const body = await request.json();
    if (!body.title || !body.description) {
      return NextResponse.json(
        { error: "Título y descripción son obligatorios" },
        { status: 400 },
      );
    }

    const req = await db.residentRequest.create({
      data: {
        condominiumId: condominium.id,
        userId: user.id,
        residenceId: membership?.residenceId ?? null,
        title: String(body.title).trim(),
        description: String(body.description).trim(),
        category: body.category || "GENERAL",
        priority: body.priority || "NORMAL",
        status: "OPEN",
      },
    });

    await createNotificationForMembers({
      condominiumId: condominium.id,
      title: `Nueva solicitud: ${req.title}`,
      body: req.description.slice(0, 120),
      category: "REQUEST",
      link: "/solicitudes",
      excludeUserId: user.id,
    });

    return NextResponse.json({ request: req }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al crear solicitud" },
      { status: 500 },
    );
  }
}
