import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserContext, unauthorized, noCondominium } from "@/lib/api-context";
import { PAYMENT_METHODS } from "@/lib/constants";

// GET /api/payment-references — referencias bancarias del condominio
export async function GET() {
  const { user, condominium, membership } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();

  const where: Record<string, unknown> = {
    condominiumId: condominium.id,
    active: true,
  };
  // Residentes solo ven referencias generales + las de su vivienda
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

// POST /api/payment-references — crear referencia
export async function POST(request: Request) {
  const { user, condominium, membership } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();

  try {
    const body = await request.json();
    if (!body.method || !PAYMENT_METHODS.some((m) => m.value === body.method)) {
      return NextResponse.json({ error: "Método de pago inválido" }, { status: 400 });
    }
    if (!body.accountHolder || !body.accountNumber) {
      return NextResponse.json(
        { error: "Titular y número de cuenta son obligatorios" },
        { status: 400 },
      );
    }

    const ref = await db.paymentReference.create({
      data: {
        condominiumId: condominium.id,
        residenceId: membership?.residenceId ?? body.residenceId ?? null,
        method: body.method,
        bank: body.bank?.trim() || null,
        accountHolder: String(body.accountHolder).trim(),
        accountNumber: String(body.accountNumber).trim(),
        documentId: body.documentId?.trim() || null,
        phone: body.phone?.trim() || null,
        notes: body.notes?.trim() || null,
        active: true,
      },
    });

    return NextResponse.json({ reference: ref }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al crear referencia" },
      { status: 500 },
    );
  }
}
