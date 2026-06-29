import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserContext, unauthorized, noCondominium } from "@/lib/api-context";
import { createNotificationForMembers } from "@/lib/notifications";

// GET /api/security-alerts
export async function GET(request: Request) {
  const { user, condominium } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const where: Record<string, unknown> = { condominiumId: condominium.id };
  if (status) where.status = status;

  const alerts = await db.securityAlert.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json(alerts);
}

// POST /api/security-alerts
export async function POST(request: Request) {
  const { user, condominium } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();

  try {
    const body = await request.json();
    if (!body.title) {
      return NextResponse.json({ error: "Título requerido" }, { status: 400 });
    }

    const alert = await db.securityAlert.create({
      data: {
        condominiumId: condominium.id,
        title: String(body.title).trim(),
        description: body.description?.trim() || null,
        severity: body.severity || "INFO",
        category: body.category || "GENERAL",
        status: "OPEN",
        location: body.location?.trim() || null,
        reportedBy: user.id,
      },
    });

    await createNotificationForMembers({
      condominiumId: condominium.id,
      title: `Alerta de seguridad: ${alert.title}`,
      body: alert.description?.slice(0, 120),
      category: "SECURITY",
      link: "/seguridad",
    });

    return NextResponse.json({ alert }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al crear alerta" },
      { status: 500 },
    );
  }
}
