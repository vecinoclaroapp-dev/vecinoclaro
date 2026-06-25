"use client";

import { useDashboard } from "@/hooks/use-api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/shared/stat-card";
import { BimonetaryAmount, BimonetaryPill } from "@/components/shared/bimonetary";
import { PaymentMethodBadge } from "@/components/shared/badges";
import { useAppStore } from "@/store/app-store";
import { formatUSD, formatVES, formatDate, formatNumber, formatInt } from "@/lib/money";
import { PAYMENT_METHOD_MAP } from "@/lib/constants";
import {
  Wallet,
  TrendingUp,
  AlertTriangle,
  Home,
  CreditCard,
  Zap,
  ArrowRight,
  Banknote,
  Users,
  CheckCircle2,
  Clock,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";

export function DashboardView() {
  const { data, isLoading } = useDashboard();
  const { setView } = useAppStore();

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-96 lg:col-span-2 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  const t = data.totals;
  const chartData = data.paymentsByMonth.map((m) => ({
    mes: m.label,
    USD: m.usd,
    VES: m.ves / 1000, // escalar para que se vea en mismo gráfico
  }));

  return (
    <div className="space-y-6">
      {/* Stats principales */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Por cobrar"
          value={<span className="text-rose-600 dark:text-rose-400">{formatUSD(t.totalOutstandingUSD)}</span>}
          secondary={
            <span className="text-ves tabular-nums">{formatVES(t.totalOutstandingVES)}</span>
          }
          icon={AlertTriangle}
          color="rose"
          loading={isLoading}
        />
        <StatCard
          label="Cobrado (histórico)"
          value={<span className="text-emerald-700 dark:text-emerald-400">{formatUSD(t.totalPaymentsUSD)}</span>}
          secondary={
            <span className="text-ves tabular-nums">{formatVES(t.totalPaymentsVES)}</span>
          }
          icon={Wallet}
          color="emerald"
          loading={isLoading}
        />
        <StatCard
          label="Viviendas morosas"
          value={<span>{formatInt(t.debtorsCount)}</span>}
          secondary={`de ${formatInt(t.residencesCount)} activas`}
          icon={Home}
          color="amber"
          loading={isLoading}
        />
        <StatCard
          label="Servicios pendientes"
          value={<span>{formatInt(t.pendingServicesCount)}</span>}
          secondary={
            <span className="tabular-nums">{formatUSD(t.pendingServicesTotalUSD)}</span>
          }
          icon={Zap}
          color="violet"
          loading={isLoading}
        />
      </div>

      {/* Segunda fila: gráfico + widget BCV */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Gráfico de pagos por mes */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                Pagos recibidos por mes
              </CardTitle>
              <CardDescription className="mt-1">Últimos 6 meses · valores bimonetarios</CardDescription>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-usd" /> USD
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-ves" /> VES (×1k)
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="mes" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                    <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 8,
                        border: "1px solid var(--border)",
                        fontSize: 12,
                      }}
                      formatter={(v: number, name: string) => {
                        if (name === "USD") return [formatUSD(v), "USD"];
                        return [formatVES(v * 1000), "VES"];
                      }}
                    />
                    <Bar dataKey="USD" fill="oklch(0.51 0.12 162)" radius={[4, 4, 0, 0]} maxBarSize={36} />
                    <Bar dataKey="VES" fill="oklch(0.4 0.04 250)" radius={[4, 4, 0, 0]} maxBarSize={36} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <TrendingUp className="h-8 w-8 text-muted-foreground/40 mb-2" />
                  <p className="text-sm font-medium text-muted-foreground">Sin pagos registrados aún</p>
                  <p className="text-xs text-muted-foreground/70 mt-0.5">El gráfico se completará al recibir pagos</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Acciones rápidas (no duplica la tasa BCV que ya está en el topbar) */}
        <Card className="bg-gradient-to-br from-emerald-50 to-amber-50/50 dark:from-emerald-950/20 dark:to-amber-950/10 border-emerald-100 dark:border-emerald-900/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4 text-emerald-600" />
              Acciones rápidas
            </CardTitle>
            <CardDescription>Operaciones frecuentes del condominio</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <button
              onClick={() => setView("payments")}
              className="w-full flex items-center gap-3 rounded-lg bg-background/80 hover:bg-background border border-emerald-100 dark:border-emerald-900/40 p-3 text-left transition-colors group"
            >
              <div className="h-9 w-9 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center shrink-0">
                <CreditCard className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold leading-tight">Registrar pago</p>
                <p className="text-xs text-muted-foreground leading-tight">Pago Móvil, Zelle, Transferencia</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
            </button>
            <button
              onClick={() => setView("expenses")}
              className="w-full flex items-center gap-3 rounded-lg bg-background/80 hover:bg-background border border-amber-100 dark:border-amber-900/40 p-3 text-left transition-colors group"
            >
              <div className="h-9 w-9 rounded-lg bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center shrink-0">
                <Banknote className="h-4 w-4 text-amber-700 dark:text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold leading-tight">Registrar gasto</p>
                <p className="text-xs text-muted-foreground leading-tight">Egresos y proveedores</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
            </button>
            <button
              onClick={() => setView("residences")}
              className="w-full flex items-center gap-3 rounded-lg bg-background/80 hover:bg-background border border-border p-3 text-left transition-colors group"
            >
              <div className="h-9 w-9 rounded-lg bg-sky-100 dark:bg-sky-950/50 flex items-center justify-center shrink-0">
                <Home className="h-4 w-4 text-sky-700 dark:text-sky-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold leading-tight">Gestionar viviendas</p>
                <p className="text-xs text-muted-foreground leading-tight">Propiedades y saldos</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-sky-600 group-hover:translate-x-0.5 transition-all" />
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Tercera fila: pagos recientes + top morosos + por método */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Pagos recientes */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-emerald-600" />
                Pagos recientes
              </CardTitle>
              <CardDescription className="mt-1">Últimas 8 transacciones registradas</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="gap-1" onClick={() => setView("payments")}>
              Ver todos <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto scroll-fine">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-card border-y">
                  <tr className="text-left text-xs text-muted-foreground">
                    <th className="font-medium py-2.5 px-4">Vivienda</th>
                    <th className="font-medium py-2.5 px-4">Método</th>
                    <th className="font-medium py-2.5 px-4 text-right">Monto</th>
                    <th className="font-medium py-2.5 px-4 text-right hidden sm:table-cell">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentPayments.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-2">
                        <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                          <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center mb-3 ring-1 ring-emerald-100 dark:ring-emerald-900/40">
                            <CreditCard className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <p className="text-sm font-medium">Aún no hay pagos registrados</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Los pagos que registres aparecerán aquí</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    data.recentPayments.map((p) => (
                      <tr key={p.id} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold">{p.residenceNumber}</div>
                          <div className="text-xs text-muted-foreground truncate max-w-[120px]">{p.ownerName}</div>
                        </td>
                        <td className="py-3 px-4">
                          <PaymentMethodBadge method={p.method} />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="font-semibold tabular-nums text-usd">{formatUSD(p.amountUSD)}</div>
                          <div className="text-xs text-muted-foreground tabular-nums">{formatVES(p.amountVES)}</div>
                        </td>
                        <td className="py-3 px-4 text-right text-xs text-muted-foreground hidden sm:table-cell tabular-nums">
                          {formatDate(p.date)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Top morosos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              Mayores saldos pendientes
            </CardTitle>
            <CardDescription>Top 10 viviendas con deuda</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 max-h-96 overflow-y-auto scroll-fine">
            {data.residenceBalances.filter((r) => r.status === "DEBT").length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <CheckCircle2 className="h-10 w-10 text-emerald-500 mb-2" />
                <p className="text-sm font-medium">¡Todas las viviendas al día!</p>
                <p className="text-xs text-muted-foreground">No hay saldos pendientes</p>
              </div>
            ) : (
              data.residenceBalances
                .filter((r) => r.status === "DEBT")
                .slice(0, 10)
                .map((r, i) => (
                  <div key={r.id} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={cn(
                        "h-6 w-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0",
                        i === 0 ? "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400" :
                        i === 1 ? "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400" :
                        i === 2 ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-400" :
                        "bg-muted text-muted-foreground",
                      )}>
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{r.number}</p>
                        <p className="text-xs text-muted-foreground truncate">{r.ownerName}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold tabular-nums text-rose-600 dark:text-rose-400 text-sm">{formatUSD(r.outstandingUSD)}</p>
                      <p className="text-[10px] text-muted-foreground tabular-nums">{formatVES(r.outstandingVES)}</p>
                    </div>
                  </div>
                ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cuarta fila: distribución por método de pago */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Banknote className="h-4 w-4 text-emerald-600" />
            Distribución por método de pago
          </CardTitle>
          <CardDescription>Total acumulado de pagos confirmados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            {data.paymentsByMethod.map((m) => {
              const cfg = PAYMENT_METHOD_MAP[m.method as keyof typeof PAYMENT_METHOD_MAP];
              const pct = t.totalPaymentsUSD > 0 ? (m.totalUSD / t.totalPaymentsUSD) * 100 : 0;
              return (
                <div key={m.method} className="rounded-xl border p-4 bg-gradient-to-br from-card to-muted/30">
                  <div className="flex items-center justify-between mb-2">
                    <PaymentMethodBadge method={m.method as keyof typeof PAYMENT_METHOD_MAP} />
                    <span className="text-[10px] text-muted-foreground font-medium">{cfg.short}</span>
                  </div>
                  <div className="font-bold text-lg tabular-nums text-usd">{formatUSD(m.totalUSD)}</div>
                  <div className="text-xs text-muted-foreground tabular-nums mb-2">{formatVES(m.totalVES)}</div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-usd rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex items-center justify-between mt-1.5 text-[10px] text-muted-foreground">
                    <span>{formatInt(m.count)} pagos</span>
                    <span className="font-semibold tabular-nums">{pct.toFixed(1)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Resumen estados de vivienda */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <Card className="border-emerald-200 dark:border-emerald-900/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">{formatInt(t.settledCount)}</p>
                <p className="text-xs text-muted-foreground">Viviendas al día</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-200 dark:border-amber-900/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-700 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">{formatInt(t.debtorsCount)}</p>
                <p className="text-xs text-muted-foreground">Con saldo pendiente</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-sky-200 dark:border-sky-900/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-sky-100 dark:bg-sky-950/40 flex items-center justify-center">
                <Users className="h-5 w-5 text-sky-700 dark:text-sky-400" />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">{formatInt(t.creditorsCount)}</p>
                <p className="text-xs text-muted-foreground">Con crédito a favor</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
