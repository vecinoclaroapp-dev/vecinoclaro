import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserContext, unauthorized, noCondominium } from "@/lib/api-context";

// GET /api/receipts/[id]
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, condominium, membership } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();

  const { id } = await params;
  const receipt = await db.receipt.findFirst({
    where: { id, condominiumId: condominium.id },
  });
  if (!receipt) {
    return NextResponse.json({ error: "Comprobante no encontrado" }, { status: 404 });
  }
  if (membership?.role === "RESIDENT" && receipt.userId !== user.id && receipt.residenceId !== membership.residenceId) {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  return NextResponse.json(receipt);
}

// PATCH /api/receipts/[id] — approve / reject
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, condominium, membership } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();
  if (membership?.role === "RESIDENT") {
    return NextResponse.json({ error: "Sin permisos para revisar comprobantes" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const action = body.action || body.status;

    const existing = await db.receipt.findFirst({
      where: { id, condominiumId: condominium.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Comprobante no encontrado" }, { status: 404 });
    }

    let status = existing.status;
    let rejectionReason = existing.rejectionReason;

    if (action === "approve" || action === "APPROVED") {
      status = "APPROVED";
      rejectionReason = null;
    } else if (action === "reject" || action === "REJECTED") {
      status = "REJECTED";
      rejectionReason = body.reason?.trim() || body.rejectionReason?.trim() || "Rechazado por administración";
    } else {
      return NextResponse.json({ error: "Acción inválida (approve/reject)" }, { status: 400 });
    }

    const updated = await db.receipt.update({
      where: { id },
      data: {
        status,
        rejectionReason,
        reviewedById: user.id,
        reviewedAt: new Date(),
      },
    });

    return NextResponse.json({ receipt: updated });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al actualizar comprobante" },
      { status: 500 },
    );
  }
}
