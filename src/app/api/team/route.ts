import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserContext, unauthorized, noCondominium } from "@/lib/api-context";
import { createNotification } from "@/lib/notifications";
import { randomBytes } from "crypto";

// GET /api/team — miembros del equipo del condominio
export async function GET() {
  const { user, condominium } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();

  const members = await db.condominiumMember.findMany({
    where: { condominiumId: condominium.id },
    include: { user: { select: { id: true, name: true, email: true, image: true, phone: true } } },
    orderBy: { invitedAt: "asc" },
  });

  const invites = await db.teamInvite.findMany({
    where: { condominiumId: condominium.id, status: "PENDING" },
    orderBy: { createdAt: "desc" },
  });

  const data = members.map((m) => ({
    id: m.id,
    userId: m.user.id,
    name: m.user.name,
    email: m.user.email,
    image: m.user.image,
    phone: m.user.phone,
    role: m.role,
    status: "ACTIVE",
    lastActiveAt: m.acceptedAt,
  }));

  const pendingInvites = invites.map((i) => ({
    id: i.id,
    name: i.name || i.email,
    email: i.email,
    role: i.role,
    status: "INVITED",
    lastActiveAt: i.createdAt,
  }));

  return NextResponse.json([...data, ...pendingInvites]);
}

// POST /api/team — invitar miembro (solo admin)
export async function POST(request: Request) {
  const { user, condominium, membership } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();
  if (membership?.role !== "ADMIN") {
    return NextResponse.json({ error: "Solo el administrador puede invitar miembros" }, { status: 403 });
  }

  try {
    const body = await request.json();
    if (!body.email) {
      return NextResponse.json({ error: "Email requerido" }, { status: 400 });
    }

    const email = String(body.email).trim().toLowerCase();
    const role = ["ADMIN", "STAFF", "VIEWER"].includes(body.role) ? body.role : "STAFF";

    // Verificar que no sea ya miembro
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      const existingMember = await db.condominiumMember.findUnique({
        where: { userId_condominiumId: { userId: existingUser.id, condominiumId: condominium.id } },
      });
      if (existingMember) {
        return NextResponse.json({ error: "El usuario ya es miembro del condominio" }, { status: 409 });
      }
    }

    // Verificar invitación pendiente
    const existingInvite = await db.teamInvite.findFirst({
      where: { condominiumId: condominium.id, email, status: "PENDING" },
    });
    if (existingInvite) {
      return NextResponse.json({ error: "Ya existe una invitación pendiente para este email" }, { status: 409 });
    }

    const token = randomBytes(24).toString("hex");
    const invite = await db.teamInvite.create({
      data: {
        condominiumId: condominium.id,
        email,
        name: body.name?.trim() || null,
        role,
        token,
        invitedById: user.id,
      },
    });

    // Notificar al usuario si ya existe
    if (existingUser) {
      await createNotification({
        userId: existingUser.id,
        title: `Invitación a ${condominium.name}`,
        body: `Te invitaron como ${role} en ${condominium.name}`,
        category: "TEAM",
        link: "/equipo",
      });
    }

    return NextResponse.json({ invite, inviteUrl: `/api/team/join?token=${token}` }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al invitar miembro" },
      { status: 500 },
    );
  }
}
