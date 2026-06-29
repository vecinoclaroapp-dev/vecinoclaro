import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserContext, unauthorized, noCondominium } from "@/lib/api-context";
import { getLatestRate } from "@/lib/bcv";
import { usdToVes, round2 } from "@/lib/money";

// GET /api/expenses
export async function GET(request: Request) {
  const { user, condominium } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const limit = Math.min(parseInt(searchParams.get("limit") || "100", 10), 500);

  const where: Record<string, unknown> = { condominiumId: condominium.id };
  if (category) where.category = category;

  const expenses = await db.expense.findMany({
    where,
    include: {
      supplier: { select: { name: true, id: true } },
      bcvRate: { select: { rate: true, date: true } },
    },
    orderBy: { date: "desc" },
    take: limit,
  });

  return NextResponse.json({
    expenses: expenses.map((e) => ({
      id: e.id,
      concept: e.concept,
      description: e.description,
      category: e.category,
      amountUSD: e.amountUSD,
      amountVES: e.amountVES,
      bcvRate: e.bcvRate.rate,
      date: e.date,
      status: e.status,
      receiptUrl: e.receiptUrl,
      paymentMethod: e.paymentMethod,
      reference: e.reference,
      supplierId: e.supplierId,
      supplierName: e.supplier?.name ?? null,
      fundId: e.fundId,
      createdAt: e.createdAt,
    })),
  });
}

// POST /api/expenses
export async function POST(request: Request) {
  const { user, condominium } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();

  try {
    const body = await request.json();

    if (!body.concept || !body.amountUSD) {
      return NextResponse.json({ error: "Concepto y monto son obligatorios" }, { status: 400 });
    }

    const rate = body.bcvRateId
      ? await db.bcvRate.findUnique({ where: { id: body.bcvRateId } })
      : await getLatestRate();
    if (!rate) {
      return NextResponse.json({ error: "No hay tasa BCV. Sincronice primero." }, { status: 400 });
    }

    const amountUSD = round2(Number(body.amountUSD));
    const amountVES = usdToVes(amountUSD, rate.rate);

    const expense = await db.expense.create({
      data: {
        condominiumId: condominium.id,
        supplierId: body.supplierId || null,
        residenceId: body.residenceId || null,
        concept: body.concept.trim(),
        description: body.description?.trim() || null,
        category: body.category || "OTRO",
        fundId: body.fundId || null,
        amountUSD,
        amountVES,
        bcvRateId: rate.id,
        date: body.date ? new Date(body.date) : new Date(),
        status: body.status || "CONFIRMED",
        receiptUrl: body.receiptUrl || null,
        paymentMethod: body.paymentMethod || null,
        reference: body.reference || null,
        recordedById: user.id,
      },
    });

    return NextResponse.json({ ok: true, expense }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al crear gasto" },
      { status: 500 },
    );
  }
}
