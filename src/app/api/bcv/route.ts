import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { fetchBcvRate, saveBcvRate, getLatestRate, dayOnly } from "@/lib/bcv";
import { getUserContext } from "@/lib/api-context";

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
    endpoint: "https://ve.dolarapi.com/v1/cotizaciones",
  });
}

// POST /api/bcv/sync — sincronizar con DolarApi.com (o guardar tasa manual)
export async function POST(request: Request) {
  const { user, membership } = await getUserContext();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (membership?.role !== "ADMIN") {
    return NextResponse.json({ error: "Solo el administrador puede sincronizar la tasa BCV" }, { status: 403 });
  }
  try {
    const body = await request.json().catch(() => ({}));

    // Si viene manualRate, guardar directo (el admin ingresa la tasa)
    if (body.manualRate && Number(body.manualRate) > 0) {
      const rate = Number(body.manualRate);
      const result = {
        rate,
        source: "MANUAL" as const,
        date: new Date(),
        message: `Tasa ingresada manualmente: ${rate} Bs/USD`,
      };
      const saved = await saveBcvRate(result, user?.id);
      return NextResponse.json({
        ok: true,
        rate: saved.rate,
        date: saved.date,
        source: saved.source,
        message: result.message,
      });
    }

    // Sincronización automática con DolarApi.com
    const result = await fetchBcvRate();
    const saved = await saveBcvRate(result, user?.id);

    return NextResponse.json({
      ok: result.source === "DOLARAPI",
      rate: saved.rate,
      date: saved.date,
      source: result.source,
      message: result.message,
      isFallback: result.source !== "DOLARAPI",
    });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        error: e instanceof Error ? e.message : "Error al sincronizar",
        isFallback: true,
      },
      { status: 500 },
    );
  }
}
