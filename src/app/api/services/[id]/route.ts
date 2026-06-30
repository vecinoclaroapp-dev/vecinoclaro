import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserContext, unauthorized, noCondominium } from "@/lib/api-context";
import { SERVICE_STATUS } from "@/lib/constants";

// PATCH /api/services/[id] — actualizar estado (solo ADMIN)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, condominium, membership } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();
  if (membership?.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Solo el administrador puede actualizar cargos" },
      { status: 403 },
    );
  }

  const { id } = await params;

  // Verificar pertenencia al condominio
  const service = await db.serviceCharge.findUnique({ where: { id } });
  if (!service || service.condominiumId !== condominium.id) {
    return NextResponse.json({ error: "Cargo no encontrado" }, { status: 404 });
  }

  const body = await request.json();

  if (body.status && !Object.keys(SERVICE_STATUS).includes(body.status)) {
    return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
  }

  try {
    const updated = await db.serviceCharge.update({
      where: { id },
      data: {
        status: body.status,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      },
    });
    return NextResponse.json({ service: updated });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al actualizar" },
      { status: 500 },
    );
  }
}
