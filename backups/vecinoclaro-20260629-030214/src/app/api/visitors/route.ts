import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserContext, unauthorized, noCondominium } from "@/lib/api-context";

// GET /api/visitors
export async function GET(request: Request) {
  const { user, condominium } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const where: Record<string, unknown> = { condominiumId: condominium.id };
  if (status) where.status = status;

  const visitors = await db.visitor.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json(visitors);
}

// POST /api/visitors
export async function POST(request: Request) {
  const { user, condominium } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();

  try {
    const body = await request.json();
    if (!body.name) {
      return NextResponse.json({ error: "Nombre del visitante requerido" }, { status: 400 });
    }

    const visitor = await db.visitor.create({
      data: {
        condominiumId: condominium.id,
        name: String(body.name).trim(),
        documentId: body.documentId?.trim() || null,
        phone: body.phone?.trim() || null,
        company: body.company?.trim() || null,
        plate: body.plate?.trim() || null,
        residentLabel: body.residentLabel?.trim() || null,
        expectedAt: body.expectedAt ? new Date(body.expectedAt) : null,
        status: body.checkIn ? "INSIDE" : "PENDING",
        checkInAt: body.checkIn ? new Date() : null,
        notes: body.notes?.trim() || null,
        createdBy: user.id,
      },
    });

    if (visitor.status === "INSIDE") {
      await db.accessLogEntry.create({
        data: {
          condominiumId: condominium.id,
          direction: "IN",
          entityName: visitor.name,
          entityType: "VISITOR",
          plate: visitor.plate,
          notes: visitor.residentLabel ? `Visita a ${visitor.residentLabel}` : null,
          recordedBy: user.id,
        },
      });
    }

    return NextResponse.json({ visitor }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al registrar visitante" },
      { status: 500 },
    );
  }
}
