import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserContext, unauthorized, noCondominium } from "@/lib/api-context";
import { getRateForDate } from "@/lib/bcv";
import { appendLedgerEntry } from "@/lib/ledger";
import { usdToVes, round2 } from "@/lib/money";
import { PAYMENT_METHODS, type PaymentMethod } from "@/lib/constants";

// GET /api/payments
export async function GET(request: Request) {
  const { user, condominium, membership } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();

  const { searchParams } = new URL(request.url);
  const residenceId = searchParams.get("residenceId");
  const method = searchParams.get("method");
  const status = searchParams.get("status");
  const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 200);

  const where: Record<string, unknown> = { residence: { condominiumId: condominium.id } };
  if (residenceId) where.residenceId = residenceId;
  if (method) where.method = method;
  if (status) where.status = status;

  const payments = await db.payment.findMany({
    where,
    include: {
      residence: { select: { number: true, ownerName: true } },
      bcvRate: { select: { rate: true, date: true } },
    },
    orderBy: { date: "desc" },
    take: limit,
  });

  return NextResponse.json({
    payments: payments.map((p) => ({
      id: p.id,
      residenceId: p.residenceId,
      residenceNumber: p.residence.number,
      ownerName: p.residence.ownerName ?? "—",
      amountUSD: p.amountUSD,
      amountVES: p.amountVES,
      bcvRate: p.bcvRate.rate,
      method: p.method,
      reference: p.reference,
      bankOrigin: p.bankOrigin,
      payerPhone: p.payerPhone,
      payerName: p.payerName,
      payerDoc: p.payerDoc,
      concept: p.concept,
      category: p.category,
      status: p.status,
      date: p.date,
      notes: p.notes,
      createdAt: p.createdAt,
    })),
  });
}

// POST /api/payments
export async function POST(request: Request) {
  const { user, condominium } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();
  if (membership?.role !== "ADMIN") {
    return NextResponse.json({ error: "Solo el administrador puede realizar esta acción" }, { status: 403 });
  }

  try {
    const body = await request.json();

    if (!body.residenceId) {
      return NextResponse.json({ error: "Seleccione la vivienda" }, { status: 400 });
    }
    if (!body.method || !PAYMENT_METHODS.some((m) => m.value === body.method)) {
      return NextResponse.json({ error: "Método de pago inválido" }, { status: 400 });
    }
    const method = body.method as PaymentMethod;

    let amountUSD: number;
    let amountVES: number;

    const rate = body.bcvRateId
      ? await db.bcvRate.findUnique({ where: { id: body.bcvRateId } })
      : await getRateForDate(body.date ? new Date(body.date) : new Date());

    if (!rate) {
      return NextResponse.json(
        { error: "No hay tasa BCV disponible. Sincronice la tasa primero." },
        { status: 400 },
      );
    }

    if (body.amountUSD != null && body.amountUSD !== "") {
      amountUSD = round2(Number(body.amountUSD));
      if (isNaN(amountUSD) || amountUSD <= 0) {
        return NextResponse.json({ error: "Monto USD inválido" }, { status: 400 });
      }
      amountVES = usdToVes(amountUSD, rate.rate);
    } else if (body.amountVES != null && body.amountVES !== "") {
      amountVES = round2(Number(body.amountVES));
      if (isNaN(amountVES) || amountVES <= 0) {
        return NextResponse.json({ error: "Monto VES inválido" }, { status: 400 });
      }
      amountUSD = round2(amountVES / rate.rate);
    } else {
      return NextResponse.json({ error: "Ingrese el monto en USD o VES" }, { status: 400 });
    }

    if (amountUSD <= 0 || isNaN(amountUSD)) {
      return NextResponse.json({ error: "El monto debe ser mayor a 0" }, { status: 400 });
    }

    if ((method === "PAGO_MOVIL" || method === "TRANSFERENCIA_NAC") && !body.reference) {
      return NextResponse.json(
        { error: `Ingrese el número de referencia para ${method === "PAGO_MOVIL" ? "Pago Móvil" : "Transferencia"}` },
        { status: 400 },
      );
    }
    if ((method === "PAGO_MOVIL" || method === "TRANSFERENCIA_NAC") && !body.bankOrigin) {
      return NextResponse.json({ error: "Seleccione el banco de origen" }, { status: 400 });
    }
    if (method === "ZELLE" && !body.reference) {
      return NextResponse.json({ error: "Ingrese la referencia de Zelle" }, { status: 400 });
    }

    // Verificar que la vivienda pertenece al condominio del usuario
    const residence = await db.residence.findFirst({
      where: { id: body.residenceId, condominiumId: condominium.id },
    });
    if (!residence) {
      return NextResponse.json({ error: "Vivienda no encontrada" }, { status: 404 });
    }

    // TRANSACCION: payment + ledger entry atomica
    const { payment, ledgerEntry } = await db.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          residenceId: body.residenceId,
          amountUSD,
          amountVES,
          bcvRateId: rate.id,
          method,
          reference: body.reference?.trim() || null,
          bankOrigin: body.bankOrigin || null,
          payerPhone: body.payerPhone?.trim() || null,
          payerName: body.payerName?.trim() || residence.ownerName || "—",
          payerDoc: body.payerDoc?.trim() || null,
          concept: body.concept?.trim() || "Pago de mantenimiento",
          category: body.category || "MAINTENANCE",
          status: "CONFIRMED",
          date: body.date ? new Date(body.date) : new Date(),
          notes: body.notes?.trim() || null,
          recordedById: user.id,
          fundId: body.fundId || null,
          destinationAccountId: body.destinationAccountId || null,
        },
      });

      // Ledger entry dentro de la misma transaccion
      const last = await tx.accountEntry.findFirst({
        orderBy: { createdAt: "desc" },
        select: { hash: true },
      });
      const prevHash = last?.hash ?? null;
      const { createHash } = await import("node:crypto");
      const ledgerData = {
        residenceId: body.residenceId,
        type: "CREDIT" as const,
        amountUSD,
        amountVES,
        bcvRateId: rate.id,
        concept: `Pago recibido — ${method}`,
        category: "PAYMENT",
        reference: payment.reference || payment.id,
        date: payment.date,
        paymentId: payment.id,
      };
      const hash = createHash("sha256").update(JSON.stringify({
        prevHash: prevHash ?? "",
        ...ledgerData,
        date: ledgerData.date.toISOString(),
      })).digest("hex");

      const ledgerEntry = await tx.accountEntry.create({
        data: {
          ...ledgerData,
          hash,
          prevHash,
        },
      });

      return { payment, ledgerEntry };
    });

    return NextResponse.json(
      { ok: true, payment, ledgerEntry: { id: ledgerEntry.id, hash: ledgerEntry.hash } },
      { status: 201 },
    );
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al registrar pago" },
      { status: 500 },
    );
  }
}
