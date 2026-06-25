import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/bcv/history — historial de tasas (para gráfico)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const days = Math.min(Math.max(parseInt(searchParams.get("days") || "30", 10), 1), 365);

  const rates = await db.bcvRate.findMany({
    orderBy: { date: "asc" },
    take: days,
    skip: 0,
  });

  // tomar últimos N
  const sliced = rates.slice(-days);

  return NextResponse.json({
    rates: sliced.map((r) => ({
      date: r.date,
      rate: r.rate,
      source: r.source,
    })),
  });
}
