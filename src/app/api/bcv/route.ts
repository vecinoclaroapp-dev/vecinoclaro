import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { fetchBcvRate, saveBcvRate, getLatestRate, dayOnly } from "@/lib/bcv";

// GET /api/bcv — tasa vigente
export async function GET() {
  const rate = await getLatestRate();
  const today = dayOnly();
  const isToday = rate && dayOnly(rate.date).getTime() === today.getTime();

  return NextResponse.json({
    rate: rate?.rate ?? null,
    date: rate?.date ?? null,
    source: rate?.source ?? null,
    isToday,
    needsSync: !isToday,
  });
}

// POST /api/bcv/sync — sincronizar con BCV
export async function POST() {
  try {
    const result = await fetchBcvRate();
    const saved = await saveBcvRate(result);
    return NextResponse.json({
      ok: true,
      rate: saved.rate,
      date: saved.date,
      source: saved.source,
      message: result.message,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Error desconocido" },
      { status: 500 },
    );
  }
}
