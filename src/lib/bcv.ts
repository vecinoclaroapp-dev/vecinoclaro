// =====================================================================
// Servicio de tasa de cambio — DolarApi.com (BCV oficial de Venezuela)
// ---------------------------------------------------------------------
// Endpoint: https://ve.dolarapi.com/v1/cotizaciones
// Resiliencia: try/catch estricto → fallback a última tasa BD → manual.
// =====================================================================

import { db } from "@/lib/db";
import { DEFAULT_FALLBACK_RATE } from "@/lib/constants";

export type BcvResult = {
  rate: number;
  source: "DOLARAPI" | "BCV" | "MANUAL" | "FALLBACK_BD" | "FALLBACK_DEFAULT";
  date: Date;
  message?: string;
  raw?: { compra?: number | null; venta?: number | null; promedio?: number | null; fechaActualizacion?: string };
};

// Normaliza fecha a medianoche local (solo fecha, sin hora)
export function dayOnly(d: Date = new Date()): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

// Respuesta de DolarApi.com
type DolarApiCotizacion = {
  moneda: string;
  fuente: string;
  nombre: string;
  compra: number | null;
  venta: number | null;
  promedio: number | null;
  fechaActualizacion: string;
};

// =====================================================================
// FETCH PRINCIPAL — DolarApi.com
// Try/catch estricto con múltiples niveles de fallback
// =====================================================================
export async function fetchBcvRate(): Promise<BcvResult> {
  const today = dayOnly();

  // -------- NIVEL 1: DolarApi.com --------
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch("https://ve.dolarapi.com/v1/cotizaciones", {
      method: "GET",
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "VecinoClaro/2.0",
      },
      // No cache — siempre traer la fresca
      cache: "no-store",
    });
    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`DolarApi respondió ${res.status}`);
    }

    const data: DolarApiCotizacion[] = await res.json();

    // Filtrar la cotización oficial del BCV (fuente: "oficial", moneda: "USD")
    const usdOficial = data.find(
      (c) => c.moneda === "USD" && (c.fuente === "oficial" || c.fuente === "bcv"),
    );

    if (!usdOficial) {
      throw new Error("No se encontró cotización USD oficial en la respuesta");
    }

    // Priorizar venta, luego promedio, luego compra (BCV usa promedio)
    const rate = usdOficial.venta ?? usdOficial.promedio ?? usdOficial.compra;

    if (!rate || !isFinite(rate) || rate <= 0 || rate > 100000) {
      throw new Error(`Tasa inválida recibida: ${rate}`);
    }

    // Fecha de actualización del BCV
    const apiDate = usdOficial.fechaActualizacion
      ? new Date(usdOficial.fechaActualizacion)
      : today;

    return {
      rate: Math.round(rate * 100) / 100,
      source: "DOLARAPI",
      date: dayOnly(apiDate),
      raw: {
        compra: usdOficial.compra,
        venta: usdOficial.venta,
        promedio: usdOficial.promedio,
        fechaActualizacion: usdOficial.fechaActualizacion,
      },
    };
  } catch (primaryError) {
    // -------- NIVEL 2: Fallback a última tasa guardada en BD --------
    try {
      const last = await db.bcvRate.findFirst({
        orderBy: { date: "desc" },
      });

      if (last && last.rate > 0) {
        return {
          rate: last.rate,
          source: "FALLBACK_BD",
          date: today,
          message: `No se pudo conectar con DolarApi.com. Usando última tasa guardada: ${last.rate} Bs/USD. Ingrese la tasa manualmente si desea actualizar.`,
          raw: undefined,
        };
      }

      // -------- NIVEL 3: Fallback por defecto --------
      return {
        rate: DEFAULT_FALLBACK_RATE,
        source: "FALLBACK_DEFAULT",
        date: today,
        message: `No hay conexión con DolarApi.com ni historial en BD. Tasa de respaldo ${DEFAULT_FALLBACK_RATE} Bs/USD. Ingrese la tasa manualmente.`,
      };
    } catch (dbError) {
      // BD inaccesible — último recurso
      return {
        rate: DEFAULT_FALLBACK_RATE,
        source: "FALLBACK_DEFAULT",
        date: today,
        message: `Error crítico de conexión y BD. Tasa de respaldo ${DEFAULT_FALLBACK_RATE}.`,
      };
    }
  }
}

// Guarda o actualiza la tasa del día (idempotente por date @unique)
export async function saveBcvRate(result: BcvResult, triggeredById?: string) {
  const date = dayOnly(result.date);

  const existing = await db.bcvRate.findUnique({ where: { date } });

  let rate;
  if (existing) {
    // Solo sobreescribir si viene de una fuente autoritativa (DolarApi o Manual explícito)
    if (result.source === "DOLARAPI" || result.source === "MANUAL" || result.source === "BCV") {
      rate = await db.bcvRate.update({
        where: { id: existing.id },
        data: {
          rate: result.rate,
          source: result.source === "DOLARAPI" ? "BCV" : result.source,
          fetchedAt: new Date(),
        },
      });
    } else {
      rate = existing; // mantener la existente si es fallback
    }
  } else {
    rate = await db.bcvRate.create({
      data: {
        rate: result.rate,
        date,
        source: result.source === "DOLARAPI" ? "BCV" : result.source,
      },
    });
  }

  // Log de sincronización (auditable)
  await db.bcvSync.create({
    data: {
      rate: result.rate,
      source: result.source,
      status: result.source === "DOLARAPI" ? "SUCCESS" : "FAILED",
      message: result.message,
      triggeredById,
    },
  });

  return rate;
}

// Obtiene la tasa vigente para una fecha dada (o la más cercana anterior)
export async function getRateForDate(date: Date = new Date()) {
  const d = dayOnly(date);
  return db.bcvRate.findFirst({
    where: { date: { lte: d } },
    orderBy: { date: "desc" },
  });
}

// Obtiene la tasa más reciente de la BD
export async function getLatestRate() {
  return db.bcvRate.findFirst({ orderBy: { date: "desc" } });
}
