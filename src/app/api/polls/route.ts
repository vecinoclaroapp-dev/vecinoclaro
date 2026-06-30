import { NextResponse } from "next/server";
import { requireModule } from "@/lib/module-check";
import { db } from "@/lib/db";
import { getUserContext, unauthorized, noCondominium } from "@/lib/api-context";

// GET /api/polls — lista de votaciones
export async function GET() {
  const { user, condominium } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();

  const polls = await db.poll.findMany({
    where: { condominiumId: condominium.id },
    include: {
      options: { include: { voteRecords: { select: { weight: true, userId: true } } } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const userId = user.id;
  const data = polls.map((p) => {
    const totalVotes = p.options.reduce((acc, o) => acc + o.voteRecords.length, 0);
    const totalWeight = p.options.reduce(
      (acc, o) => acc + o.voteRecords.reduce((a, v) => a + (v.weight || 0), 0),
      0,
    );
    const userVoted = p.options.some((o) => o.voteRecords.some((v) => v.userId === userId));
    return {
      id: p.id,
      title: p.title,
      description: p.description,
      type: p.type,
      status: p.active && p.closesAt > new Date() ? "OPEN" : "CLOSED",
      endDate: p.closesAt,
      options: p.options.map((o) => ({
        id: o.id,
        text: o.text,
        votes: o.voteRecords.length,
        weight: o.voteRecords.reduce((a, v) => a + (v.weight || 0), 0),
      })),
      totalVotes,
      totalWeight,
      userVoted,
    };
  });

  return NextResponse.json(data);
}

// POST /api/polls — crear votación (solo admin)
export async function POST(request: Request) {
  const { user, condominium, membership } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();
  if (membership?.role !== "ADMIN") {
    return NextResponse.json({ error: "Solo el administrador puede crear votaciones" }, { status: 403 });
  }

  try {
    const body = await request.json();
    if (!body.title || !body.options || !Array.isArray(body.options) || body.options.length < 2) {
      return NextResponse.json(
        { error: "Título y al menos 2 opciones son obligatorios" },
        { status: 400 },
      );
    }
    if (!body.closesAt) {
      return NextResponse.json({ error: "Fecha de cierre requerida" }, { status: 400 });
    }

    const poll = await db.poll.create({
      data: {
        condominiumId: condominium.id,
        title: String(body.title).trim(),
        description: body.description?.trim() || null,
        type: body.type === "VOTATION" ? "VOTATION" : "POLL",
        multipleChoice: !!body.multipleChoice,
        closesAt: new Date(body.closesAt),
        active: true,
        options: {
          create: body.options.map((o: string) => ({ text: String(o).trim() })),
        },
      },
      include: { options: true },
    });

    return NextResponse.json({ poll }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al crear votación" },
      { status: 500 },
    );
  }
}
