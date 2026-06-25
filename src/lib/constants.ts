// =====================================================================
// Constantes de dominio — CondominioDigital VE
// =====================================================================

export type PaymentMethod =
  | "PAGO_MOVIL"
  | "TRANSFERENCIA_NAC"
  | "ZELLE"
  | "EFECTIVO";

export const PAYMENT_METHODS: {
  value: PaymentMethod;
  label: string;
  short: string;
  icon: string;
  currency: "USD" | "VES" | "BOTH";
}[] = [
  { value: "PAGO_MOVIL", label: "Pago Móvil", short: "PM", icon: "smartphone", currency: "VES" },
  { value: "TRANSFERENCIA_NAC", label: "Transferencia Nacional", short: "TRF", icon: "building", currency: "VES" },
  { value: "ZELLE", label: "Zelle", short: "ZEL", icon: "dollar-sign", currency: "USD" },
  { value: "EFECTIVO", label: "Efectivo", short: "EF", icon: "banknote", currency: "BOTH" },
];

export const PAYMENT_METHOD_MAP = Object.fromEntries(
  PAYMENT_METHODS.map((m) => [m.value, m]),
) as Record<PaymentMethod, (typeof PAYMENT_METHODS)[number]>;

// Bancos venezolanos más comunes
export const VENEZUELAN_BANKS = [
  "Banco de Venezuela (BDV)",
  "Banco Nacional de Crédito (BNC)",
  "Banesco",
  "Mercantil",
  "Provincial (BBVA)",
  "Banco del Tesoro",
  "Bancaribe",
  "Banco Exterior",
  "Banco Bicentenario",
  "Banco Plaza",
  "Banco Activo",
  "Bancamiga",
  "Banco Caroní",
  "Banco de la Fuerza Armada (BANFANB)",
  "100% Banco",
  "Del Sur",
  "Bancrecer",
  "Citibank",
  "Banco Venezolano de Crédito",
  "Otro",
];

export type EntryType = "CREDIT" | "DEBIT";

export type EntryCategory =
  | "MAINTENANCE"
  | "SERVICE_CHARGE"
  | "RESERVE"
  | "PENALTY"
  | "PAYMENT"
  | "ADJUSTMENT";

export const ENTRY_CATEGORIES: Record<EntryCategory, { label: string; color: string }> = {
  MAINTENANCE: { label: "Mantenimiento", color: "emerald" },
  SERVICE_CHARGE: { label: "Servicio Crítico", color: "amber" },
  RESERVE: { label: "Reserva", color: "sky" },
  PENALTY: { label: "Mora/Penalización", color: "rose" },
  PAYMENT: { label: "Pago recibido", color: "teal" },
  ADJUSTMENT: { label: "Ajuste", color: "slate" },
};

export type ServiceChargeType =
  | "ELECTRIC_PLANT"
  | "WATER_WELL"
  | "CONTINGENCY"
  | "EXTRAORDINARY"
  | "REPAIR";

export const SERVICE_TYPES: {
  value: ServiceChargeType;
  label: string;
  description: string;
  icon: string;
}[] = [
  { value: "ELECTRIC_PLANT", label: "Planta Eléctrica", description: "Combustible, mantenimiento y reparación de planta", icon: "zap" },
  { value: "WATER_WELL", label: "Pozo de Agua", description: "Bombeo, cloración y mantenimiento de pozo", icon: "droplet" },
  { value: "CONTINGENCY", label: "Contingencia", description: "Emergencias, imprevistos, seguridad extraordinaria", icon: "shield-alert" },
  { value: "EXTRAORDINARY", label: "Extraordinaria", description: "Mejoras, obras, inversiones aprobadas en asamblea", icon: "hammer" },
  { value: "REPAIR", label: "Reparación", description: "Reparaciones de áreas comunes e infraestructura", icon: "wrench" },
];

export const SERVICE_TYPE_MAP = Object.fromEntries(
  SERVICE_TYPES.map((s) => [s.value, s]),
) as Record<ServiceChargeType, (typeof SERVICE_TYPES)[number]>;

export const PAYMENT_STATUS = {
  PENDING: { label: "Pendiente", color: "amber" },
  CONFIRMED: { label: "Confirmado", color: "emerald" },
  REJECTED: { label: "Rechazado", color: "rose" },
} as const;

export const SERVICE_STATUS = {
  PENDING: { label: "Pendiente", color: "amber" },
  PARTIAL: { label: "Parcial", color: "sky" },
  PAID: { label: "Pagado", color: "emerald" },
  OVERDUE: { label: "Vencido", color: "rose" },
  CANCELLED: { label: "Anulado", color: "slate" },
} as const;

export const RESIDENCE_TYPES = [
  { value: "APARTMENT", label: "Apartamento" },
  { value: "HOUSE", label: "Casa" },
  { value: "LOCAL", label: "Local comercial" },
  { value: "PARKING", label: "Estacionamiento" },
];

// BCV: endpoints y defaults
export const BCV_SOURCES = {
  DOLARAPI: "DolarApi.com (BCV oficial)",
  BCV: "BCV (almacenado)",
  MANUAL: "Manual",
  FALLBACK_BD: "Última tasa guardada",
  FALLBACK_DEFAULT: "Tasa de respaldo",
} as const;

export const DOLARAPI_ENDPOINT = "https://ve.dolarapi.com/v1/cotizaciones";
export const DEFAULT_FALLBACK_RATE = 621.5; // tasa de respaldo si DolarApi no responde
