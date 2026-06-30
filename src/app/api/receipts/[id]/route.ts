import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserContext, unauthorized, noCondominium } from "@/lib/api-context";
import { appendLedgerEntry } from "@/lib/ledger";
import { createNotification } from "@/lib/notifications";

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
    if (existing.status === "APPROVED") {
      return NextResponse.json({ error: "Este comprobante ya está aprobado" }, { status: 400 });
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

    // Si se aprueba, crear Payment + asiento contable
    if (status === "APPROVED" && existing.amountUSD && existing.amountUSD > 0) {
      // Obtener tasa BCV
      const bcvRate = await db.bcvRate.findFirst({ orderBy: { date: "desc" } });
      const amountVES = bcvRate ? existing.amountUSD * bcvRate.rate : 0;

      // Crear Payment
      const payment = await db.payment.create({
        data: {
          residenceId: existing.residenceId,
          userId: existing.userId,
          method: "PAGO_MOVIL", // default, el comprobante determina el método
          amountUSD: existing.amountUSD,
          amountVES,
          bcvRateId: bcvRate?.id,
          reference: existing.reference || `Receipt-${existing.id.slice(-8)}`,
          status: "CONFIRMED",
          date: existing.createdAt,
          concept: "Pago vía comprobante",
          bankOrigin: existing.bankOrigin,
        },
      });

      // Crear asiento contable en el ledger
      await appendLedgerEntry({
        residenceId: existing.residenceId,
        type: "CREDIT",
        amountUSD: existing.amountUSD,
        amountVES,
        bcvRateId: bcvRate?.id,
        description: `Pago confirmado - ${existing.reference || "comprobante"}`,
        reference: payment.id,
        category: "PAYMENT",
        userId: user.id,
      });

      // Notificar al residente
      if (existing.userId) {
        await createNotification({
          userId: existing.userId,
          title: "Pago aprobado",
          body: `Tu pago de USD ${existing.amountUSD.toFixed(2)} ha sido aprobado.`,
          type: "PAYMENT_APPROVED",
          data: JSON.stringify({ paymentId: payment.id, amount: existing.amountUSD }),
        });
      }
    }

    // Si se rechaza, notificar al residente
    if (status === "REJECTED" && existing.userId) {
      await createNotification({
        userId: existing.userId,
        title: "Pago rechazado",
        body: `Tu comprobante fue rechazado: ${rejectionReason}`,
        type: "PAYMENT_REJECTED",
        data: JSON.stringify({ receiptId: existing.id, reason: rejectionReason }),
      });
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
