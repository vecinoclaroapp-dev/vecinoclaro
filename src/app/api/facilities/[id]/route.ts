import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserContext, unauthorized, noCondominium } from "@/lib/api-context";

// PATCH /api/facilities/[id] — editar (solo ADMIN para facilities/documents/works, cualquier miembro para marketplace)
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, condominium, membership } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();
  const { id } = await params;
  const body = await request.json();
  try {
    const updated = await db.facilities.update({ where: { id }, data: body });
    return NextResponse.json({ ok: true, data: updated });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 500 });
  }
}

// DELETE /api/facilities/[id] — soft delete (solo ADMIN)
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, condominium, membership } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();
  if (membership?.role !== "ADMIN") {
    return NextResponse.json({ error: "Solo el administrador" }, { status: 403 });
  }
  const { id } = await params;
  try {
    await db.facilities.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 500 });
  }
}
