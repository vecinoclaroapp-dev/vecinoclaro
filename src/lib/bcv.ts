// =====================================================================
// Servicio de tasa de cambio BCV
// ---------------------------------------------------------------------
// Estrategia:
//  1. Intenta obtener la tasa del BCV vía endpoints públicos conocidos.
//  2. Si falla, usa la última tasa almacenada en BD del día anterior.
//  3. Si no hay historial, usa DEFAULT_FALLBACK_RATE.
// =====================================================================

import { db } from "@/lib/db";
import { DEFAULT_FALLBACK_RATE } from "@/lib/constants";

export type BcvResult = {
  rate: number;
  source: "BCV" | "MANUAL" | "API" | "FALLBACK";
  date: Date;
  message?: string;
};

// Normaliza fecha a medianoche local (solo fecha, sin hora)
export function dayOnly(d: Date = new Date()): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

// Intenta obtener la tasa del BCV desde fuentes públicas
export async function fetchBcvRate(): Promise<BcvResult> {
  const today = dayOnly();

  // Fuentes alternativas (mantenidas por la comunidad VE)
  const sources: { url: string; parser: (t: string) => number | null; source: BcvResult["source"] }[] = [
    {
      url: "https://bcv-api.vercel.app/api/v1/dollar",
      source: "API",
      parser: (text) => {
        try {
          const j = JSON.parse(text);
          const r = j?.data?.usd?.rate ?? j?.rate ?? j?.usd ?? j?.dolar ?? j?.value;
          return r ? Number(String(r).replace(",", ".")) : null;
        } catch {
          return null;
        }
      },
    },
    {
      url: "https://api.cambiovzla.com/v1/dollar",
      source: "API",
      parser: (text) => {
        try {
          const j = JSON.parse(text);
          const r = j?.bcv ?? j?.rate ?? j?.usd;
          return r ? Number(String(r).replace(",", ".")) : null;
        } catch {
          return null;
        }
      },
    },
  ];

  for (const s of sources) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(s.url, {
        signal: controller.signal,
        headers: { Accept: "application/json", "User-Agent": "CondominioDigitalVE/1.0" },
      });
      clearTimeout(timeout);
      if (!res.ok) continue;
      const text = await res.text();
      const rate = s.parser(text);
      if (rate && isFinite(rate) && rate > 0 && rate < 100000) {
        return { rate, source: s.source, date: today };
      }
    } catch {
      // intenta siguiente fuente
    }
  }

  // Fallback: última tasa conocida en BD
  const last = await db.bcvRate.findFirst({
    orderBy: { date: "desc" },
  });
  if (last) {
    return {
      rate: last.rate,
      source: "FALLBACK",
      date: today,
      message: `BCV no respondió. Usando última tasa conocida (${last.rate}).`,
    };
  }

  return {
    rate: DEFAULT_FALLBACK_RATE,
    source: "FALLBACK",
    date: today,
    message: `Sin acceso a BCV ni historial. Tasa de respaldo ${DEFAULT_FALLBACK_RATE}.`,
  };
}

// Guarda o actualiza la tasa del día (idempotente por date @unique)
export async function saveBcvRate(result: BcvResult, triggeredById?: string) {
  const date = dayOnly(result.date);

  const existing = await db.bcvRate.findUnique({ where: { date } });

  let rate;
  if (existing) {
    // Solo actualizamos rate/source si llegó del BCV/API (no sobreescribimos manual con fallback)
    if (result.source === "BCV" || result.source === "API") {
      rate = await db.bcvRate.update({
        where: { id: existing.id },
        data: { rate: result.rate, source: result.source, fetchedAt: new Date() },
      });
    } else {
      rate = existing;
    }
  } else {
    rate = await db.bcvRate.create({
      data: {
        rate: result.rate,
        date,
        source: result.source,
      },
    });
  }

  // Log de sincronización
  await db.bcvSync.create({
    data: {
      rate: result.rate,
      source: result.source,
      status: result.source === "FALLBACK" ? "FAILED" : "SUCCESS",
      message: result.message,
      triggeredById,
    },
  });

  return rate;
}

// Obtiene la tasa vigente para una fecha dada (o la más cercana anterior)
export async function getRateForDate(date: Date = new Date()) {
  const d = dayOnly(date);
  const rate = await db.bcvRate.findFirst({
    where: { date: { lte: d } },
    orderBy: { date: "desc" },
  });
  return rate;
}

// Obtiene la tasa más reciente de la BD
export async function getLatestRate() {
  return db.bcvRate.findFirst({ orderBy: { date: "desc" } });
}
