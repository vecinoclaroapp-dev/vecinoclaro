import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { SERVICE_STATUS } from "@/lib/constants";

// PATCH /api/services/[id] — actualizar estado
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
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
