import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserContext, unauthorized } from "@/lib/api-context";

// POST /api/residents/join — vincular residente autenticado con código de vivienda
export async function POST(request: Request) {
  const { user } = await getUserContext();
  if (!user) return unauthorized();

  try {
    const body = await request.json();
    const code = body.code?.trim().toUpperCase();
    if (!code) {
      return NextResponse.json({ error: "Código requerido" }, { status: 400 });
    }

    const residence = await db.residence.findFirst({
      where: { joinCode: code, active: true },
      include: { condominium: true },
    });
    if (!residence) {
      return NextResponse.json({ error: "Código inválido o vivienda no encontrada" }, { status: 404 });
    }

    // Verificar que no esté ya vinculado
    const existing = await db.condominiumMember.findUnique({
      where: {
        userId_condominiumId: { userId: user.id, condominiumId: residence.condominiumId },
      },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Ya eres miembro de este condominio" },
        { status: 409 },
      );
    }

    const member = await db.condominiumMember.create({
      data: {
        userId: user.id,
        condominiumId: residence.condominiumId,
        role: "RESIDENT",
        residenceId: residence.id,
        acceptedAt: new Date(),
      },
    });

    return NextResponse.json({
      member,
      residence: {
        id: residence.id,
        number: residence.number,
        type: residence.type,
      },
      condominium: {
        id: residence.condominium.id,
        name: residence.condominium.name,
      },
    }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al vincular residente" },
      { status: 500 },
    );
  }
}
