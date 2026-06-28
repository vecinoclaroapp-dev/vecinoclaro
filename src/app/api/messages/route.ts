import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserContext, unauthorized, noCondominium } from "@/lib/api-context";

// GET /api/messages — mensajes donde el usuario es sender O recipient
export async function GET(request: Request) {
  const { user, condominium } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();

  const { searchParams } = new URL(request.url);
  const contactId = searchParams.get("contactId");

  const where: Record<string, unknown> = {
    OR: [{ senderId: user.id }, { recipientId: user.id }],
  };
  if (contactId) {
    where.AND = [
      {
        OR: [{ senderId: contactId }, { recipientId: contactId }],
      },
    ];
  }

  const messages = await db.message.findMany({
    where,
    orderBy: { createdAt: "asc" },
    take: 500,
  });

  // Lista de contactos del condominio (miembros)
  const members = await db.condominiumMember.findMany({
    where: { condominiumId: condominium.id, userId: { not: user.id } },
    include: { user: { select: { id: true, name: true, email: true, image: true } } },
  });

  const contacts = members.map((m) => ({
    id: m.user.id,
    name: m.user.name,
    email: m.user.email,
    image: m.user.image,
    role: m.role,
  }));

  return NextResponse.json({ messages, contacts });
}

// POST /api/messages
export async function POST(request: Request) {
  const { user, condominium } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();

  try {
    const body = await request.json();
    if (!body.recipientId || !body.body?.trim()) {
      return NextResponse.json({ error: "Destinatario y mensaje son obligatorios" }, { status: 400 });
    }

    // Validar que el destinatario pertenece al mismo condominio
    const recipient = await db.condominiumMember.findFirst({
      where: { condominiumId: condominium.id, userId: body.recipientId },
    });
    if (!recipient) {
      return NextResponse.json({ error: "Destinatario no encontrado en el condominio" }, { status: 404 });
    }

    const message = await db.message.create({
      data: {
        senderId: user.id,
        recipientId: body.recipientId,
        body: String(body.body).trim(),
      },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al enviar mensaje" },
      { status: 500 },
    );
  }
}
