import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserContext, unauthorized, noCondominium } from "@/lib/api-context";
import { getLatestRate } from "@/lib/bcv";
import { usdToVes, round2, sum } from "@/lib/money";

// GET /api/budget
export async function GET(request: Request) {
  const { user, condominium } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();

  const { searchParams } = new URL(request.url);
  const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()), 10);

  const budgets = await db.budget.findMany({
    where: { condominiumId: condominium.id, year },
    orderBy: [{ month: "asc" }, { category: "asc" }],
  });

  // Gastos reales del año por categoría
  const expenses = await db.expense.findMany({
    where: {
      condominiumId: condominium.id,
      date: {
        gte: new Date(year, 0, 1),
        lt: new Date(year + 1, 0, 1),
      },
      status: "CONFIRMED",
    },
    select: { category: true, amountUSD: true, date: true },
  });

  // Agrupar gastos por categoría y mes
  const realByCategory: Record<string, number> = {};
  const realByMonthCategory: Record<string, Record<number, number>> = {};
  for (const e of expenses) {
    const month = new Date(e.date).getMonth() + 1;
    realByCategory[e.category] = (realByCategory[e.category] || 0) + e.amountUSD;
    if (!realByMonthCategory[e.category]) realByMonthCategory[e.category] = {};
    realByMonthCategory[e.category][month] = (realByMonthCategory[e.category][month] || 0) + e.amountUSD;
  }

  return NextResponse.json({
    year,
    budgets: budgets.map((b) => ({
      id: b.id,
      year: b.year,
      month: b.month,
      category: b.category,
      amountUSD: b.amountUSD,
      amountVES: b.amountVES,
      realUSD: b.month ? (realByMonthCategory[b.category]?.[b.month] || 0) : (realByCategory[b.category] || 0),
      variance: b.amountUSD - (b.month ? (realByMonthCategory[b.category]?.[b.month] || 0) : (realByCategory[b.category] || 0)),
    })),
    totals: {
      budgetedUSD: sum(budgets.map((b) => b.amountUSD)),
      realUSD: sum(Object.values(realByCategory)),
    },
  });
}

// POST /api/budget
export async function POST(request: Request) {
  const { user, condominium } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();

  try {
    const body = await request.json();
    if (!body.category || !body.year) {
      return NextResponse.json({ error: "Categoría y año son obligatorios" }, { status: 400 });
    }

    const rate = await getLatestRate();
    if (!rate) {
      return NextResponse.json({ error: "No hay tasa BCV" }, { status: 400 });
    }

    const amountUSD = round2(Number(body.amountUSD));
    const amountVES = usdToVes(amountUSD, rate.rate);

    const budget = await db.budget.upsert({
      where: {
        condominiumId_year_month_category: {
          condominiumId: condominium.id,
          year: Number(body.year),
          month: body.month ? Number(body.month) : 0,
          category: body.category,
        },
      },
      update: { amountUSD, amountVES },
      create: {
        condominiumId: condominium.id,
        year: Number(body.year),
        month: body.month ? Number(body.month) : null,
        category: body.category,
        amountUSD,
        amountVES,
        bcvRateId: rate.id,
      },
    });

    return NextResponse.json({ ok: true, budget }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al crear presupuesto" },
      { status: 500 },
    );
  }
}
