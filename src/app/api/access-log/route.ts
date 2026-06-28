import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserContext, unauthorized, noCondominium } from "@/lib/api-context";

// GET /api/access-log (solo admin)
export async function GET(request: Request) {
  const { user, condominium, membership } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();
  if (membership?.role !== "ADMIN") {
    return NextResponse.json({ error: "Solo el administrador puede ver el log de acceso" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const direction = searchParams.get("direction");
  const limit = Math.min(parseInt(searchParams.get("limit") || "200", 10), 500);

  const where: Record<string, unknown> = { condominiumId: condominium.id };
  if (direction) where.direction = direction;

  const logs = await db.accessLogEntry.findMany({
    where,
    orderBy: { occurredAt: "desc" },
    take: limit,
  });

  return NextResponse.json(logs);
}
