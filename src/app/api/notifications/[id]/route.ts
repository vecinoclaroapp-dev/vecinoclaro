import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserContext, unauthorized } from "@/lib/api-context";

// PATCH /api/notifications/[id]
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user } = await getUserContext();
  if (!user) return unauthorized();

  const { id } = await params;

  try {
    const body = await request.json();
    const existing = await db.notification.findUnique({ where: { id } });
    if (!existing || existing.userId !== user.id) {
      return NextResponse.json({ error: "Notificación no encontrada" }, { status: 404 });
    }

    const updated = await db.notification.update({
      where: { id },
      data: { read: body.read ?? true },
    });

    return NextResponse.json({ notification: updated });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al actualizar notificación" },
      { status: 500 },
    );
  }
}

// DELETE /api/notifications/[id]
export async function DELETE({ params }: { params: Promise<{ id: string }> }) {
  const { user } = await getUserContext();
  if (!user) return unauthorized();

  const { id } = await params;

  try {
    const existing = await db.notification.findUnique({ where: { id } });
    if (!existing || existing.userId !== user.id) {
      return NextResponse.json({ error: "Notificación no encontrada" }, { status: 404 });
    }

    await db.notification.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al eliminar notificación" },
      { status: 500 },
    );
  }
}
