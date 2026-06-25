"use client";

import { useState } from "react";
import { useInvoices, useResidences } from "@/hooks/use-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatUSD, formatVES, formatDate, formatPeriod, formatInt } from "@/lib/money";
import { useAppStore } from "@/store/app-store";
import { FileText, Calendar, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const statusConfig = {
  PENDING: { label: "Pendiente", Icon: Clock, className: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900" },
  PAID: { label: "Pagada", Icon: CheckCircle2, className: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900" },
  OVERDUE: { label: "Vencida", Icon: AlertTriangle, className: "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-900" },
  PARTIAL: { label: "Parcial", Icon: Clock, className: "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-900" },
} as const;

export function InvoicesView() {
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterResidence, setFilterResidence] = useState<string>("ALL");
  const { data, isLoading } = useInvoices(filterStatus !== "ALL" ? { status: filterStatus } : {});
  const { data: residencesData } = useResidences(true);
  const { setPrefillPayment, setView } = useAppStore();

  const invoices = data?.invoices ?? [];
  const filtered = invoices.filter((i) => filterResidence === "ALL" || i.residenceId === filterResidence);

  // Resumen
  const total = invoices.reduce((s, i) => s + i.amountUSD, 0);
  const paid = invoices.filter((i) => i.status === "PAID").reduce((s, i) => s + i.paidAmountUSD, 0);
  const pending = invoices.filter((i) => i.status === "PENDING" || i.status === "OVERDUE").reduce((s, i) => s + i.amountUSD, 0);

  const pay = (residenceId: string, concept: string) => {
    setPrefillPayment({ residenceId, concept, category: "MAINTENANCE" });
    setView("payments");
  };

  return (
    <div className="space-y-5">
      {/* Resumen */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground uppercase">Facturado total</span>
            </div>
            <p className="text-xl font-bold tabular-nums">{formatUSD(total)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-medium text-muted-foreground uppercase">Cobrado</span>
            </div>
            <p className="text-xl font-bold tabular-nums text-emerald-700 dark:text-emerald-400">{formatUSD(paid)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span className="text-xs font-medium text-muted-foreground uppercase">Por cobrar</span>
            </div>
            <p className="text-xl font-bold tabular-nums text-amber-700 dark:text-amber-400">{formatUSD(pending)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Estado" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos los estados</SelectItem>
            {Object.entries(statusConfig).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterResidence} onValueChange={setFilterResidence}>
          <SelectTrigger className="w-[220px]"><SelectValue placeholder="Vivienda" /></SelectTrigger>
          <SelectContent className="max-h-72">
            <SelectItem value="ALL">Todas las viviendas</SelectItem>
            {(residencesData?.residences ?? []).map((r) => (
              <SelectItem key={r.id} value={r.id}>{r.number} — {r.ownerName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabla */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4 text-emerald-600" />
            {formatInt(filtered.length)} facturas
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : (
            <div className="max-h-[70vh] overflow-y-auto scroll-fine">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-card border-y z-10">
                  <tr className="text-left text-xs text-muted-foreground">
                    <th className="font-medium py-3 px-4">Periodo</th>
                    <th className="font-medium py-3 px-4">Vivienda</th>
                    <th className="font-medium py-3 px-4 hidden md:table-cell">Vencimiento</th>
                    <th className="font-medium py-3 px-4 text-right">Monto</th>
                    <th className="font-medium py-3 px-4 text-center">Estado</th>
                    <th className="font-medium py-3 px-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={6} className="py-12 text-center text-muted-foreground">No hay facturas</td></tr>
                  ) : (
                    filtered.map((i) => {
                      const cfg = statusConfig[i.status as keyof typeof statusConfig] ?? statusConfig.PENDING;
                      const Icon = cfg.Icon;
                      return (
                        <tr key={i.id} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-semibold">{formatPeriod(i.period)}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold">{i.residenceNumber}</div>
                            <div className="text-xs text-muted-foreground truncate max-w-[140px]">{i.ownerName}</div>
                          </td>
                          <td className="py-3 px-4 hidden md:table-cell text-xs text-muted-foreground tabular-nums">{formatDate(i.dueDate)}</td>
                          <td className="py-3 px-4 text-right">
                            <div className="font-bold tabular-nums text-usd">{formatUSD(i.amountUSD)}</div>
                            <div className="text-xs text-muted-foreground tabular-nums">{formatVES(i.amountVES)}</div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Badge variant="outline" className={cn("gap-1", cfg.className)}>
                              <Icon className="h-3 w-3" />
                              {cfg.label}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {(i.status === "PENDING" || i.status === "OVERDUE" || i.status === "PARTIAL") && (
                              <button
                                onClick={() => pay(i.residenceId, `Pago factura ${i.period}`)}
                                className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
                              >
                                Registrar pago →
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
