import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserContext, unauthorized, noCondominium } from "@/lib/api-context";

// PATCH /api/requests/[id] — cambiar estado
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, condominium, membership } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();

  const { id } = await params;

  try {
    const body = await request.json();
    const existing = await db.residentRequest.findFirst({
      where: { id, condominiumId: condominium.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 });
    }

    const isResident = membership?.role === "RESIDENT";
    const allowedStatus = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
    const newStatus = allowedStatus.includes(body.status) ? body.status : existing.status;

    // Residentes solo pueden cerrar sus propias solicitudes ya resueltas
    if (isResident && existing.userId !== user.id) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const updated = await db.residentRequest.update({
      where: { id },
      data: {
        status: newStatus,
        response: body.response?.trim() ?? existing.response,
        priority: body.priority || existing.priority,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ request: updated });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al actualizar solicitud" },
      { status: 500 },
    );
  }
}
