import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserContext, unauthorized, noCondominium } from "@/lib/api-context";

// GET /api/payment-references/me — mi referencia de pago (residente)
export async function GET() {
  const { user, condominium, membership } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();

  // Referencias generales del condominio + las de la vivienda del residente
  const where: Record<string, unknown> = {
    condominiumId: condominium.id,
    active: true,
  };
  if (membership?.role === "RESIDENT") {
    where.OR = [
      { residenceId: null },
      { residenceId: membership.residenceId ?? undefined },
    ];
  }

  const refs = await db.paymentReference.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(refs);
}
