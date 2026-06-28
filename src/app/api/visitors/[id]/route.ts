import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserContext, unauthorized, noCondominium } from "@/lib/api-context";

// PATCH /api/visitors/[id] — autorizar / denegar / check-in / check-out
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, condominium } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();

  const { id } = await params;

  try {
    const body = await request.json();
    const action = body.action;

    const visitor = await db.visitor.findFirst({
      where: { id, condominiumId: condominium.id },
    });
    if (!visitor) {
      return NextResponse.json({ error: "Visitante no encontrado" }, { status: 404 });
    }

    const now = new Date();
    let newStatus = visitor.status;
    let direction: "IN" | "OUT" | null = null;

    if (action === "authorize" || action === "checkin") {
      newStatus = "INSIDE";
      direction = "IN";
    } else if (action === "checkout") {
      newStatus = "CHECKED_OUT";
      direction = "OUT";
    } else if (action === "deny") {
      newStatus = "DENIED";
    } else if (body.status) {
      newStatus = body.status;
    } else {
      return NextResponse.json({ error: "Acción inválida" }, { status: 400 });
    }

    const updated = await db.visitor.update({
      where: { id },
      data: {
        status: newStatus,
        checkInAt:
          newStatus === "INSIDE" && !visitor.checkInAt ? now : visitor.checkInAt,
        checkOutAt: newStatus === "CHECKED_OUT" ? now : visitor.checkOutAt,
        notes: body.notes?.trim() ?? visitor.notes,
      },
    });

    if (direction) {
      await db.accessLogEntry.create({
        data: {
          condominiumId: condominium.id,
          direction,
          entityName: visitor.name,
          entityType: "VISITOR",
          plate: visitor.plate,
          notes: visitor.residentLabel ? `Visita a ${visitor.residentLabel}` : null,
          recordedBy: user.id,
        },
      });
    }

    return NextResponse.json({ visitor: updated });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al actualizar visitante" },
      { status: 500 },
    );
  }
}
