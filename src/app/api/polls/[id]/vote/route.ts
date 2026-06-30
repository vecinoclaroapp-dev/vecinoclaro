import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserContext, unauthorized, noCondominium } from "@/lib/api-context";

// POST /api/polls/[id]/vote — votar con peso por indiviso
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, condominium, membership } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();

  const { id: pollId } = await params;

  try {
    const body = await request.json();
    const optionId = body.optionId;
    if (!optionId) {
      return NextResponse.json({ error: "Seleccione una opción" }, { status: 400 });
    }

    const poll = await db.poll.findFirst({
      where: { id: pollId, condominiumId: condominium.id },
      include: { options: true },
    });
    if (!poll) {
      return NextResponse.json({ error: "Votación no encontrada" }, { status: 404 });
    }
    if (!poll.active || poll.closesAt <= new Date()) {
      return NextResponse.json({ error: "La votación está cerrada" }, { status: 400 });
    }
    const option = poll.options.find((o) => o.id === optionId);
    if (!option) {
      return NextResponse.json({ error: "Opción inválida" }, { status: 400 });
    }

    // Voto existente (único voto por usuario)
    const existing = await db.pollVote.findUnique({
      where: { pollId_userId: { pollId, userId: user.id } },
    });
    if (existing) {
      return NextResponse.json({ error: "Ya votaste en esta votación" }, { status: 409 });
    }

    // Peso por indiviso: alícuota de la vivienda del residente (si la tiene)
    let weight = 1;
    let residenceId: string | null = membership?.residenceId ?? null;
    if (residenceId) {
      const residence = await db.residence.findUnique({
        where: { id: residenceId },
        select: { aliquot: true },
      });
      if (residence) weight = residence.aliquot || 1;
    }

    await db.$transaction([
      db.pollVote.create({
        data: {
          pollId,
          optionId,
          userId: user.id,
          residenceId,
          weight,
        },
      }),
      // Ya NO incrementamos PollOption.votes manualmente
      // El conteo se hace con PollVote.length en GET /api/polls
    ]);

    return NextResponse.json({ ok: true, weight });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al registrar voto" },
      { status: 500 },
    );
  }
}
