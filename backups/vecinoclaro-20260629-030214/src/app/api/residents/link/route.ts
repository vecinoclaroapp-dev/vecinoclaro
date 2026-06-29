import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserContext, unauthorized, noCondominium } from "@/lib/api-context";

// POST /api/residents/link — vincular usuario existente a una vivienda (admin)
export async function POST(request: Request) {
  const { user, condominium, membership } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();
  if (membership?.role !== "ADMIN") {
    return NextResponse.json({ error: "Solo el administrador puede vincular residentes" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const email = body.email?.trim().toLowerCase();
    const residenceId = body.residenceId;

    if (!email || !residenceId) {
      return NextResponse.json({ error: "Email y vivienda son obligatorios" }, { status: 400 });
    }

    const targetUser = await db.user.findUnique({ where: { email } });
    if (!targetUser) {
      return NextResponse.json({ error: "Usuario no encontrado. Pídale que se registre primero." }, { status: 404 });
    }

    const residence = await db.residence.findFirst({
      where: { id: residenceId, condominiumId: condominium.id },
    });
    if (!residence) {
      return NextResponse.json({ error: "Vivienda no encontrada" }, { status: 404 });
    }

    // Verificar si ya es miembro
    const existing = await db.condominiumMember.findUnique({
      where: {
        userId_condominiumId: { userId: targetUser.id, condominiumId: condominium.id },
      },
    });
    if (existing) {
      // Actualizar vivienda
      const updated = await db.condominiumMember.update({
        where: { id: existing.id },
        data: { residenceId, role: "RESIDENT", acceptedAt: existing.acceptedAt ?? new Date() },
      });
      return NextResponse.json({ member: updated });
    }

    const member = await db.condominiumMember.create({
      data: {
        userId: targetUser.id,
        condominiumId: condominium.id,
        role: "RESIDENT",
        residenceId,
        acceptedAt: new Date(),
      },
    });

    return NextResponse.json({ member }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al vincular residente" },
      { status: 500 },
    );
  }
}
