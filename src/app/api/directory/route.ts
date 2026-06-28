import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserContext, unauthorized, noCondominium } from "@/lib/api-context";

// GET /api/directory
export async function GET(request: Request) {
  const { user, condominium } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();

  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role");

  const where: Record<string, unknown> = { condominiumId: condominium.id, active: true };
  if (role) where.role = role;

  const entries = await db.directoryEntry.findMany({
    where,
    orderBy: [{ role: "asc" }, { name: "asc" }],
    take: 200,
  });

  return NextResponse.json(entries);
}

// POST /api/directory
export async function POST(request: Request) {
  const { user, condominium, membership } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();
  if (membership?.role === "RESIDENT") {
    return NextResponse.json({ error: "Sin permisos para agregar entradas" }, { status: 403 });
  }

  try {
    const body = await request.json();
    if (!body.name) {
      return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
    }

    const entry = await db.directoryEntry.create({
      data: {
        condominiumId: condominium.id,
        name: String(body.name).trim(),
        role: body.role || "OTHER",
        phone: body.phone?.trim() || null,
        email: body.email?.trim() || null,
        category: body.category || "OTHER",
        residenceLabel: body.residenceLabel?.trim() || null,
        notes: body.notes?.trim() || null,
        active: body.active !== false,
      },
    });

    return NextResponse.json({ entry }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al crear entrada" },
      { status: 500 },
    );
  }
}
