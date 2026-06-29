"use client";

import { Badge } from "@/components/ui/badge";
import {
  PAYMENT_METHOD_MAP,
  PAYMENT_STATUS,
  SERVICE_STATUS,
  type PaymentMethod,
} from "@/lib/constants";
import {
  Smartphone,
  Building2,
  DollarSign,
  Banknote,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";

const methodIcon: Record<PaymentMethod, React.ComponentType<{ className?: string }>> = {
  PAGO_MOVIL: Smartphone,
  TRANSFERENCIA_NAC: Building2,
  ZELLE: DollarSign,
  EFECTIVO: Banknote,
};

export function PaymentMethodBadge({ method }: { method: PaymentMethod }) {
  const m = PAYMENT_METHOD_MAP[method];
  const Icon = methodIcon[method] ?? Banknote;
  return (
    <Badge variant="outline" className="gap-1.5 font-medium">
      <Icon className="h-3 w-3 text-emerald-600" />
      {m.label}
    </Badge>
  );
}

const statusConfig = {
  PENDING: { label: "Pendiente", Icon: Clock, className: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900" },
  CONFIRMED: { label: "Confirmado", Icon: CheckCircle2, className: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900" },
  REJECTED: { label: "Rechazado", Icon: XCircle, className: "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-900" },
} as const;

export function PaymentStatusBadge({ status }: { status: keyof typeof PAYMENT_STATUS | string }) {
  const cfg = statusConfig[status as keyof typeof statusConfig];
  if (!cfg) return <Badge variant="outline">{status}</Badge>;
  const Icon = cfg.Icon;
  return (
    <Badge variant="outline" className={`gap-1.5 ${cfg.className}`}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </Badge>
  );
}

const serviceStatusConfig = {
  PENDING: { label: "Pendiente", Icon: Clock, className: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900" },
  PARTIAL: { label: "Parcial", Icon: Clock, className: "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-900" },
  PAID: { label: "Pagado", Icon: CheckCircle2, className: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900" },
  OVERDUE: { label: "Vencido", Icon: AlertTriangle, className: "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-900" },
  CANCELLED: { label: "Anulado", Icon: XCircle, className: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-900/50 dark:text-slate-400 dark:border-slate-800" },
} as const;

export function ServiceStatusBadge({ status }: { status: keyof typeof SERVICE_STATUS | string }) {
  const cfg = serviceStatusConfig[status as keyof typeof serviceStatusConfig];
  if (!cfg) return <Badge variant="outline">{status}</Badge>;
  const Icon = cfg.Icon;
  return (
    <Badge variant="outline" className={`gap-1.5 ${cfg.className}`}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </Badge>
  );
}

export function OutstandingBadge({ amount }: { amount: number }) {
  if (Math.abs(amount) < 0.01) {
    return (
      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900">
        Al día
      </Badge>
    );
  }
  if (amount > 0) {
    return (
      <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900">
        Deuda
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-900">
      Crédito a favor
    </Badge>
  );
}
