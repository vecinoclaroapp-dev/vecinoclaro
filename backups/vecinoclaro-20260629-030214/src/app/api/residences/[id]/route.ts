import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// PATCH /api/residences/[id]
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
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

// DELETE /api/residences/[id] — soft delete (active=false)
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
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
