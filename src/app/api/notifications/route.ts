import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserContext, unauthorized } from "@/lib/api-context";

// GET /api/notifications — lista del usuario actual
export async function GET() {
  const { user } = await getUserContext();
  if (!user) return unauthorized();

  const notifications = await db.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const unreadCount = await db.notification.count({
    where: { userId: user.id, read: false },
  });

  return NextResponse.json({ notifications, unreadCount });
}

// PATCH /api/notifications — marcar como leídas (todas o por ids)
export async function PATCH(request: Request) {
  const { user } = await getUserContext();
  if (!user) return unauthorized();

  try {
    const body = await request.json();
    const ids: string[] | undefined = body.ids;

    await db.notification.updateMany({
      where: {
        userId: user.id,
        ...(ids && Array.isArray(ids) ? { id: { in: ids } } : {}),
      },
      data: { read: true },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al actualizar notificaciones" },
      { status: 500 },
    );
  }
}
