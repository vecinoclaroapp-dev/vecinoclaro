import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserContext, unauthorized, noCondominium } from "@/lib/api-context";
import { createNotificationForMembers } from "@/lib/notifications";

// GET /api/announcements
export async function GET() {
  const { user, condominium, membership } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();

  const announcements = await db.announcement.findMany({
    where: { condominiumId: condominium.id },
    orderBy: [{ pinned: "desc" }, { publishedAt: "desc" }],
    take: 100,
  });

  return NextResponse.json(announcements);
}

// POST /api/announcements
export async function POST(request: Request) {
  const { user, condominium } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();
  if (membership?.role !== "ADMIN") {
    return NextResponse.json({ error: "Solo el administrador puede realizar esta acción" }, { status: 403 });
  }

  try {
    const body = await request.json();
    if (!body.title || !body.body) {
      return NextResponse.json({ error: "Título y cuerpo son obligatorios" }, { status: 400 });
    }

    const ann = await db.announcement.create({
      data: {
        condominiumId: condominium.id,
        title: String(body.title).trim(),
        body: String(body.body).trim(),
        category: body.category || "GENERAL",
        pinned: !!body.pinned,
        publishedById: user.id,
      },
    });

    await createNotificationForMembers({
      condominiumId: condominium.id,
      title: `Nuevo aviso: ${ann.title}`,
      body: ann.body.slice(0, 120),
      category: "ANNOUNCEMENT",
      link: "/avisos",
      excludeUserId: user.id,
    });

    return NextResponse.json({ announcement: ann }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al crear aviso" },
      { status: 500 },
    );
  }
}
