// Cache simple en memoria para tasa BCV y otros datos frecuentes
// En producción usar Redis

type CacheEntry<T> = { data: T; expiresAt: number };
const cache = new Map<string, CacheEntry<unknown>>();

// Limpiar cache expirado cada 10 minutos
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of cache.entries()) {
    if (entry.expiresAt < now) cache.delete(key);
  }
}, 10 * 60 * 1000);

export function cacheGet<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

export function cacheSet<T>(key: string, data: T, ttlMs: number): void {
  cache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

export function cacheDelete(key: string): void {
  cache.delete(key);
}

export function cacheClear(): void {
  cache.clear();
}

// TTLs predefinidos
export const CACHE_TTL = {
  BCV_RATE: 5 * 60 * 1000,        // 5 minutos para tasa BCV
  MODULES: 30 * 1000,              // 30 segundos para módulos
  DASHBOARD: 60 * 1000,            // 1 minuto para dashboard
  CONDOMINIUM: 5 * 60 * 1000,      // 5 minutos para datos del condominio
  DIRECTORY: 2 * 60 * 1000,        // 2 minutos para directorio
  ANNOUNCEMENTS: 60 * 1000,        // 1 minuto para avisos
};
