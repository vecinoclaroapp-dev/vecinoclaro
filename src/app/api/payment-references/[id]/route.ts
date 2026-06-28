import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserContext, unauthorized, noCondominium } from "@/lib/api-context";

// DELETE /api/payment-references/[id]
export async function DELETE({ params }: { params: Promise<{ id: string }> }) {
  const { user, condominium, membership } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();

  const { id } = await params;

  const ref = await db.paymentReference.findFirst({
    where: { id, condominiumId: condominium.id },
  });
  if (!ref) {
    return NextResponse.json({ error: "Referencia no encontrada" }, { status: 404 });
  }

  // Residentes solo pueden borrar sus propias referencias
  if (membership?.role === "RESIDENT" && ref.residenceId !== membership.residenceId) {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  await db.paymentReference.update({
    where: { id },
    data: { active: false },
  });

  return NextResponse.json({ ok: true });
}
