"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader, EmptyState } from "@/components/shared/layout";
import { useResidentMe } from "@/hooks/use-resident";
import { Wallet, FileText, TrendingDown, Clock, CreditCard, Home, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatUSD, formatVES, formatDate } from "@/lib/money";

type ResidentInvoice = {
  id: string;
  period: string;
  amount: number;
  amountVES?: number;
  dueDate: string;
  status: "PENDING" | "PAID" | "OVERDUE";
};

type ResidentPayment = {
  id: string;
  amount: number;
  method: string;
  reference?: string;
  date: string;
  status: "PENDING" | "CONFIRMED" | "REJECTED";
};

export function ResidentDashboard() {
  const { data: resident, isLoading: rLoading } = useResidentMe();

  const invoices = useQuery<ResidentInvoice[]>({
    queryKey: ["resident", "invoices"],
    queryFn: async () => {
      const r = await fetch("/api/residents/me/invoices");
      if (!r.ok) return [];
      return r.json();
    },
  });

  const payments = useQuery<ResidentPayment[]>({
    queryKey: ["resident", "payments"],
    queryFn: async () => {
      const r = await fetch("/api/residents/me/payments");
      if (!r.ok) return [];
      return r.json();
    },
  });

  const outstanding = resident?.outstanding ?? 0;
  const pendingInvoices = (invoices.data ?? []).filter((i) => i.status !== "PAID");
  const recentPayments = (payments.data ?? []).slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Hola, ${resident?.name?.split(" ")[0] ?? "vecino"}`}
        subtitle={resident?.residenceLabel ? `Vivienda: ${resident.residenceLabel}` : undefined}
        icon={Home}
      />

      {/* Saldo destacado */}
      <Card className={cn(
        "border-2",
        outstanding > 0
          ? "border-rose-200 bg-rose-50/50 dark:border-rose-900 dark:bg-rose-950/20"
          : "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20"
      )}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Wallet className="h-4 w-4" /> Saldo pendiente
              </p>
              <p className={cn(
                "text-3xl font-bold mt-1 tabular-nums",
                outstanding > 0 ? "text-rose-700 dark:text-rose-400" : "text-emerald-700 dark:text-emerald-400"
              )}>
                {formatUSD(outstanding)}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Aprox. {formatVES(outstanding * 621)}
              </p>
            </div>
            <Badge
              className={cn(
                outstanding > 0
                  ? "bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300"
                  : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
              )}
            >
              {outstanding > 0 ? "Por pagar" : "Al día"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        {/* Facturas pendientes */}
        <Card>
          <CardContent className="p-4">
            {rLoading || invoices.isLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                  <FileText className="h-3.5 w-3.5" /> Facturas pendientes
                </div>
                <p className="text-2xl font-bold tabular-nums">{pendingInvoices.length}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {pendingInvoices.length > 0 ? "Revisa tu estado de cuenta" : "Sin facturas pendientes"}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Pagos recientes */}
        <Card>
          <CardContent className="p-4">
            {rLoading || payments.isLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                  <CreditCard className="h-3.5 w-3.5" /> Pagos realizados
                </div>
                <p className="text-2xl font-bold tabular-nums">{payments.data?.length ?? 0}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {resident?.lastPaymentDate
                    ? `Último: ${formatDate(resident.lastPaymentDate)}`
                    : "Aún no has registrado pagos"}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Estado */}
        <Card>
          <CardContent className="p-4">
            {rLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                  <TrendingDown className="h-3.5 w-3.5" /> Estado de cuenta
                </div>
                <p className="text-2xl font-bold capitalize">
                  {outstanding > 0 ? "Moroso" : "Al día"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {outstanding > 0 ? "Regulariza tu deuda" : "¡Gracias por tu pago!"}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pagos recientes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-emerald-600" /> Pagos recientes
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {payments.isLoading ? (
            <div className="space-y-2 p-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : recentPayments.length === 0 ? (
            <EmptyState
              icon={CreditCard}
              title="No tienes pagos registrados"
              description="Cuando registres un pago, aparecerá aquí."
            />
          ) : (
            <div className="divide-y">
              {recentPayments.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center">
                      <CreditCard className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{p.method}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(p.date)}
                        {p.reference && ` · Ref: ${p.reference}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold tabular-nums flex items-center gap-1">
                      <ArrowUpRight className="h-3 w-3 text-emerald-600" />
                      {formatUSD(p.amount)}
                    </p>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs mt-0.5",
                        p.status === "CONFIRMED" && "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300",
                        p.status === "PENDING" && "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300",
                        p.status === "REJECTED" && "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300"
                      )}
                    >
                      {p.status === "CONFIRMED" ? "Confirmado" : p.status === "PENDING" ? "Pendiente" : "Rechazado"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
