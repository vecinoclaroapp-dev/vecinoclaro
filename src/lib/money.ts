// =====================================================================
// Utilidades bimonetarias — formato y cálculo
// =====================================================================

const usdFmt = new Intl.NumberFormat("es-VE", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const vesFmt = new Intl.NumberFormat("es-VE", {
  style: "currency",
  currency: "VES",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const numFmt = new Intl.NumberFormat("es-VE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const intFmt = new Intl.NumberFormat("es-VE");

export function formatUSD(value: number): string {
  if (!isFinite(value)) value = 0;
  return usdFmt.format(value);
}

export function formatVES(value: number): string {
  if (!isFinite(value)) value = 0;
  return vesFmt.format(value);
}

export function formatNumber(value: number): string {
  if (!isFinite(value)) value = 0;
  return numFmt.format(value);
}

export function formatInt(value: number): string {
  if (!isFinite(value)) value = 0;
  return intFmt.format(value);
}

export function formatRate(value: number): string {
  return `${formatNumber(value)} Bs/USD`;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("es-VE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateLong(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("es-VE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("es-VE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatPeriod(period: string): string {
  // "2025-01" -> "Ene 2025"
  const [y, m] = period.split("-");
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  return `${months[parseInt(m, 10) - 1] ?? m} ${y}`;
}

// Convierte USD -> VES usando una tasa dada
export function usdToVes(usd: number, rate: number): number {
  return round2(usd * rate);
}

// Convierte VES -> USD usando una tasa dada
export function vesToUsd(ves: number, rate: number): number {
  if (rate <= 0) return 0;
  return round2(ves / rate);
}

export function round2(n: number): number {
  if (!isFinite(n)) return 0;
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

// Suma segura de arrays de números (evita errores de coma flotante)
export function sum(values: number[]): number {
  return round2(values.reduce((acc, v) => acc + (v || 0), 0));
}

// Calcula saldo a partir de asientos contables (CREDIT positivo, DEBIT negativo)
export function balanceFromEntries(entries: { type: string; amountUSD: number; amountVES: number }[]): {
  usd: number;
  ves: number;
} {
  let usd = 0;
  let ves = 0;
  for (const e of entries) {
    const sign = e.type === "CREDIT" ? 1 : -1;
    usd += sign * (e.amountUSD || 0);
    ves += sign * (e.amountVES || 0);
  }
  return { usd: round2(usd), ves: round2(ves) };
}

// Interpreta el saldo desde la perspectiva del condominio:
// - CREDIT (pago recibido) = a favor de la vivienda (reduce lo que debe)
// - DEBIT (cargo/factura) = a favor del condominio (lo que la vivienda debe)
// Saldo positivo = la vivienda debe al condominio
// Saldo negativo = la vivienda tiene crédito a favor
export function outstandingFromEntries(entries: { type: string; amountUSD: number; amountVES: number }[]): {
  usd: number;
  ves: number;
} {
  let usd = 0;
  let ves = 0;
  for (const e of entries) {
    const sign = e.type === "DEBIT" ? 1 : -1; // cargo suma deuda, pago resta
    usd += sign * (e.amountUSD || 0);
    ves += sign * (e.amountVES || 0);
  }
  return { usd: round2(usd), ves: round2(ves) };
}

export function truncateHash(hash: string, len = 12): string {
  if (!hash) return "—";
  return hash.length <= len ? hash : `${hash.slice(0, len)}…`;
}
