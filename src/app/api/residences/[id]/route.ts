import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserContext, unauthorized, noCondominium } from "@/lib/api-context";

// PATCH /api/residences/[id] — solo ADMIN
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, condominium, membership } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();
  if (membership?.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Solo el administrador puede editar viviendas" },
      { status: 403 },
    );
  }

  const { id } = await params;

  // Verificar que la vivienda pertenece al condominio del admin
  const residence = await db.residence.findUnique({ where: { id } });
  if (!residence || residence.condominiumId !== condominium.id) {
    return NextResponse.json({ error: "Vivienda no encontrada" }, { status: 404 });
  }

  const body = await request.json();

  try {
    const updated = await db.residence.update({
      where: { id },
      data: {
        number: body.number !== undefined ? String(body.number).trim().toUpperCase() : undefined,
        floor: body.floor !== undefined ? body.floor?.trim() || null : undefined,
        type: body.type,
        ownerName: body.ownerName?.trim(),
        ownerPhone: body.ownerPhone?.trim() || null,
        ownerEmail: body.ownerEmail?.trim() || null,
        residentName: body.residentName?.trim() || null,
        active: body.active,
      },
    });
    return NextResponse.json({ residence: updated });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al actualizar";
    if (msg.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Ya existe otra vivienda con ese número" },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE /api/residences/[id] — soft delete (active=false), solo ADMIN
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, condominium, membership } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();
  if (membership?.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Solo el administrador puede desactivar viviendas" },
      { status: 403 },
    );
  }

  const { id } = await params;

  // Verificar pertenencia al condominio
  const residence = await db.residence.findUnique({ where: { id } });
  if (!residence || residence.condominiumId !== condominium.id) {
    return NextResponse.json({ error: "Vivienda no encontrada" }, { status: 404 });
  }

  try {
    await db.residence.update({
      where: { id },
      data: { active: false },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al desactivar" },
      { status: 500 },
    );
  }
}
