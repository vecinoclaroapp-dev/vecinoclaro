"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader, EmptyState } from "@/components/shared/layout";
import { useResidentMe } from "@/hooks/use-resident";
import { FileText, Clock, CheckCircle2, AlertTriangle, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatUSD, formatVES, formatDate } from "@/lib/money";

type ResidentInvoice = {
  id: string;
  period: string;
  amount: number;
  amountVES?: number;
  dueDate: string;
  status: "PENDING" | "PAID" | "OVERDUE";
  description?: string;
};

const statusConfig = {
  PENDING: { label: "Pendiente", Icon: Clock, cls: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300" },
  PAID: { label: "Pagada", Icon: CheckCircle2, cls: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300" },
  OVERDUE: { label: "Vencida", Icon: AlertTriangle, cls: "bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300" },
} as const;

export function ResidentInvoices() {
  const { data: resident } = useResidentMe();

  const { data, isLoading } = useQuery<ResidentInvoice[]>({
    queryKey: ["resident", "invoices"],
    queryFn: async () => {
      const r = await fetch("/api/residents/me/invoices");
      if (!r.ok) return [];
      return r.json();
    },
  });

  const invoices = data ?? [];
  const pendingTotal = invoices
    .filter((i) => i.status !== "PAID")
    .reduce((sum, i) => sum + (i.amount ?? 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mis Facturas"
        subtitle={resident?.residenceLabel ? `Vivienda: ${resident.residenceLabel}` : "Estado de cuenta"}
        icon={FileText}
      />

      {/* Resumen */}
      <Card className="border-emerald-200 bg-emerald-50/40 dark:border-emerald-900 dark:bg-emerald-950/20">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">Total pendiente</p>
          <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-400 tabular-nums mt-1">
            {formatUSD(pendingTotal)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Aprox. {formatVES(pendingTotal * 621)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Historial de facturas</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : invoices.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No tienes facturas"
              description="Las facturas mensuales generadas por el administrador aparecerán aquí."
            />
          ) : (
            <div className="divide-y">
              {invoices.map((inv) => {
                const cfg = statusConfig[inv.status] ?? statusConfig.PENDING;
                const Icon = cfg.Icon;
                return (
                  <div key={inv.id} className="p-4 flex items-center gap-3 hover:bg-muted/40">
                    <div className={cn(
                      "h-10 w-10 rounded-lg flex items-center justify-center shrink-0",
                      cfg.cls
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sm">Factura {inv.period}</p>
                        <Badge className={cn(cfg.cls)}>
                          {cfg.label}
                        </Badge>
                      </div>
                      {inv.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {inv.description}
                        </p>
                      )}
                      <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        Vence: {formatDate(inv.dueDate)}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold tabular-nums">{formatUSD(inv.amount)}</p>
                      <p className="text-xs text-muted-foreground">{formatVES(inv.amountVES ?? inv.amount * 621)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
