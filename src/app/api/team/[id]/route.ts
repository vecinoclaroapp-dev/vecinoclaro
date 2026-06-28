import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserContext, unauthorized, noCondominium } from "@/lib/api-context";

// PATCH /api/team/[id] — cambiar rol (solo admin)
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, condominium, membership } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();
  if (membership?.role !== "ADMIN") {
    return NextResponse.json({ error: "Solo el administrador puede cambiar roles" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const target = await db.condominiumMember.findFirst({
      where: { id, condominiumId: condominium.id },
    });
    if (!target) {
      return NextResponse.json({ error: "Miembro no encontrado" }, { status: 404 });
    }

    const role = ["ADMIN", "STAFF", "VIEWER"].includes(body.role) ? body.role : target.role;

    const updated = await db.condominiumMember.update({
      where: { id },
      data: { role },
    });

    return NextResponse.json({ member: updated });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al actualizar miembro" },
      { status: 500 },
    );
  }
}

// DELETE /api/team/[id] — eliminar miembro (solo admin)
export async function DELETE({ params }: { params: Promise<{ id: string }> }) {
  const { user, condominium, membership } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();
  if (membership?.role !== "ADMIN") {
    return NextResponse.json({ error: "Solo el administrador puede eliminar miembros" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const target = await db.condominiumMember.findFirst({
      where: { id, condominiumId: condominium.id },
    });
    if (!target) {
      return NextResponse.json({ error: "Miembro no encontrado" }, { status: 404 });
    }
    if (target.userId === user.id) {
      return NextResponse.json({ error: "No puedes eliminarte a ti mismo" }, { status: 400 });
    }

    await db.condominiumMember.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al eliminar miembro" },
      { status: 500 },
    );
  }
}
