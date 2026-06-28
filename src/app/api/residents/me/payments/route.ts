import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserContext, unauthorized } from "@/lib/api-context";
import { getRateForDate } from "@/lib/bcv";
import { usdToVes, round2 } from "@/lib/money";
import { PAYMENT_METHODS, type PaymentMethod } from "@/lib/constants";

// GET /api/residents/me/payments — historial de pagos del residente
export async function GET() {
  const { user, membership } = await getUserContext();
  if (!user) return unauthorized();
  if (!membership?.residenceId) {
    return NextResponse.json({ payments: [] });
  }

  const payments = await db.payment.findMany({
    where: { residenceId: membership.residenceId },
    include: { bcvRate: { select: { rate: true } } },
    orderBy: { date: "desc" },
    take: 100,
  });

  return NextResponse.json(payments);
}

// POST /api/residents/me/payments — residente registra un pago (queda pendiente)
export async function POST(request: Request) {
  const { user, condominium, membership } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) {
    return NextResponse.json({ error: "Sin condominio" }, { status: 404 });
  }
  if (!membership?.residenceId) {
    return NextResponse.json({ error: "No tienes vivienda vinculada" }, { status: 400 });
  }

  try {
    const body = await request.json();
    if (!body.method || !PAYMENT_METHODS.some((m) => m.value === body.method)) {
      return NextResponse.json({ error: "Método de pago inválido" }, { status: 400 });
    }
    const method = body.method as PaymentMethod;
    const amountUSD = Number(body.amountUSD);
    if (!amountUSD || amountUSD <= 0) {
      return NextResponse.json({ error: "Monto inválido" }, { status: 400 });
    }

    const rate = await getRateForDate(body.date ? new Date(body.date) : new Date());
    if (!rate) {
      return NextResponse.json({ error: "No hay tasa BCV disponible" }, { status: 400 });
    }

    const amountVES = round2(usdToVes(amountUSD, rate.rate));

    const payment = await db.payment.create({
      data: {
        residenceId: membership.residenceId,
        amountUSD: round2(amountUSD),
        amountVES,
        bcvRateId: rate.id,
        method,
        reference: body.reference?.trim() || null,
        bankOrigin: body.bankOrigin || null,
        payerPhone: body.payerPhone?.trim() || null,
        payerName: body.payerName?.trim() || user.name,
        concept: body.concept?.trim() || "Pago de mantenimiento",
        category: "MAINTENANCE",
        status: "PENDING", // residente → siempre pendiente de verificación
        date: body.date ? new Date(body.date) : new Date(),
        notes: body.notes?.trim() || null,
        recordedById: user.id,
      },
    });

    return NextResponse.json({ payment }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al registrar pago" },
      { status: 500 },
    );
  }
}
