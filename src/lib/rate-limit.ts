import { NextResponse } from "next/server";

// Rate limiter simple en memoria (para producción usar Redis)
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuto
const RATE_LIMIT_MAX = {
  "/api/auth/register": 5,    // 5 registros por minuto por IP
  "/api/auth/callback": 10,   // 10 logins por minuto por IP
  "/api/bcv": 30,             // 30 requests por minuto
  "/api/payments": 60,        // 60 pagos por minuto
  "default": 100,             // 100 requests por minuto por defecto
};

type RateEntry = { count: number; resetAt: number };
const store = new Map<string, RateEntry>();

// Limpiar entradas expiradas cada 5 minutos
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) store.delete(key);
  }
}, 5 * 60 * 1000);

export function rateLimit(identifier: string, path: string): { allowed: boolean; remaining: number; resetAt: number } {
  const key = `${identifier}:${path}`;
  const now = Date.now();
  const max = RATE_LIMIT_MAX[path as keyof typeof RATE_LIMIT_MAX] ?? RATE_LIMIT_MAX.default;

  const entry = store.get(key);
  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: max - 1, resetAt: now + RATE_LIMIT_WINDOW };
  }

  entry.count++;
  if (entry.count > max) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  return { allowed: true, remaining: max - entry.count, resetAt: entry.resetAt };
}

export function rateLimitResponse() {
  return NextResponse.json(
    { error: "Demasiadas solicitudes. Intenta de nuevo en un minuto." },
    { status: 429, headers: { "Retry-After": "60" } }
  );
}

// Helper para obtener IP del request
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIP = request.headers.get("x-real-ip");
  if (realIP) return realIP;
  return "unknown";
}
