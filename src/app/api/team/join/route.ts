import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserContext, unauthorized } from "@/lib/api-context";

// POST /api/team/join — aceptar invitación con token
export async function POST(request: Request) {
  const { user } = await getUserContext();
  if (!user) return unauthorized();

  try {
    const body = await request.json();
    const token = body.token;
    if (!token) {
      return NextResponse.json({ error: "Token requerido" }, { status: 400 });
    }

    const invite = await db.teamInvite.findUnique({
      where: { token },
      include: { condominium: true },
    });
    if (!invite || invite.status !== "PENDING") {
      return NextResponse.json({ error: "Invitación inválida o ya utilizada" }, { status: 404 });
    }

    // Verificar que el email coincide con el usuario actual
    if (user.email && invite.email.toLowerCase() !== user.email.toLowerCase()) {
      return NextResponse.json(
        { error: "Esta invitación fue enviada a otro email" },
        { status: 403 },
      );
    }

    // Verificar que no sea ya miembro
    const existing = await db.condominiumMember.findUnique({
      where: {
        userId_condominiumId: { userId: user.id, condominiumId: invite.condominiumId },
      },
    });
    if (existing) {
      return NextResponse.json({ error: "Ya eres miembro de este condominio" }, { status: 409 });
    }

    const member = await db.condominiumMember.create({
      data: {
        userId: user.id,
        condominiumId: invite.condominiumId,
        role: invite.role,
        acceptedAt: new Date(),
      },
    });

    await db.teamInvite.update({
      where: { id: invite.id },
      data: { status: "ACCEPTED", acceptedAt: new Date() },
    });

    return NextResponse.json({ member, condominium: invite.condominium }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al aceptar invitación" },
      { status: 500 },
    );
  }
}
