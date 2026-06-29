// =====================================================================
// Helper para crear notificaciones in-app
// =====================================================================

import { db } from "@/lib/db";

export type NotificationInput = {
  userId: string;
  title: string;
  body?: string;
  category?: string;
  link?: string;
};

export async function createNotification(input: NotificationInput) {
  try {
    return await db.notification.create({
      data: {
        userId: input.userId,
        title: input.title,
        body: input.body ?? null,
        category: input.category ?? "GENERAL",
        link: input.link ?? null,
      },
    });
  } catch (e) {
    // No propagamos el error para no romper flujos principales
    console.error("[notifications] error al crear notificación:", e);
    return null;
  }
}

export async function createNotificationForMembers(params: {
  condominiumId: string;
  title: string;
  body?: string;
  category?: string;
  link?: string;
  excludeUserId?: string;
}) {
  try {
    const members = await db.condominiumMember.findMany({
      where: {
        condominiumId: params.condominiumId,
        ...(params.excludeUserId ? { userId: { not: params.excludeUserId } } : {}),
      },
      select: { userId: true },
    });
    if (members.length === 0) return [];
    return await db.notification.createMany({
      data: members.map((m) => ({
        userId: m.userId,
        title: params.title,
        body: params.body ?? null,
        category: params.category ?? "GENERAL",
        link: params.link ?? null,
      })),
    });
  } catch (e) {
    console.error("[notifications] error al notificar a miembros:", e);
    return [];
  }
}
