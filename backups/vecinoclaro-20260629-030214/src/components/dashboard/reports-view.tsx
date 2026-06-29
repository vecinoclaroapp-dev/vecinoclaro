"use client";

import { useDashboard, useBcvHistory } from "@/hooks/use-api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatUSD, formatVES, formatNumber, formatInt, formatDate } from "@/lib/money";
import { PAYMENT_METHOD_MAP } from "@/lib/constants";
import { PaymentMethodBadge } from "@/components/shared/badges";
import { BarChart3, TrendingUp, Download, FileSpreadsheet, PieChart, Activity, Banknote } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart as RechartsPie,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const PIE_COLORS = ["oklch(0.51 0.12 162)", "oklch(0.7 0.15 75)", "oklch(0.6 0.13 230)", "oklch(0.65 0.2 350)"];

export function ReportsView() {
  const { data, isLoading } = useDashboard();
  const { data: hist } = useBcvHistory(90);

  if (isLoading || !data) {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-80 rounded-xl" />)}
      </div>
    );
  }

  const t = data.totals;

  // Datos para gráficos
  const methodPie = data.paymentsByMethod
    .filter((m) => m.totalUSD > 0)
    .map((m) => ({ name: PAYMENT_METHOD_MAP[m.method as keyof typeof PAYMENT_METHOD_MAP]?.label ?? m.method, value: m.totalUSD, method: m.method }));

  const monthlyBar = data.paymentsByMonth.map((m) => ({
    mes: m.label,
    pagos: m.count,
    usd: m.usd,
  }));

  const bcvArea = (hist?.rates ?? []).map((r: { date: string; rate: number }) => ({
    fecha: formatDate(r.date),
    tasa: r.rate,
  }));

  // Estado de cuenta consolidado
  const outstandingByType = data.residenceBalances.reduce(
    (acc, r) => {
      if (r.status === "DEBT") acc.debt += r.outstandingUSD;
      else if (r.status === "CREDIT") acc.credit += Math.abs(r.outstandingUSD);
      return acc;
    },
    { debt: 0, credit: 0 },
  );

  const handleExport = () => {
    // Genera CSV de pagos
    const headers = ["Fecha", "Vivienda", "Propietario", "Método", "Referencia", "Banco", "USD", "VES", "Tasa", "Estado"];
    const rows = data.recentPayments.map((p) => [
      formatDate(p.date),
      p.residenceNumber,
      p.ownerName,
      PAYMENT_METHOD_MAP[p.method as keyof typeof PAYMENT_METHOD_MAP]?.label ?? p.method,
      p.method,
      "",
      p.amountUSD,
      p.amountVES,
      data.bcv?.rate ?? "",
      "CONFIRMED",
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reporte-pagos-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header con export */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-emerald-600" />
            Reportes y estadísticas
          </h2>
          <p className="text-xs text-muted-foreground">Análisis bimonetario del condominio</p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExport}>
          <Download className="h-3.5 w-3.5" /> Exportar CSV
        </Button>
      </div>

      {/* KPIs principales */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground uppercase font-medium">Ingresos históricos</p>
            <p className="text-2xl font-bold tabular-nums text-emerald-700 dark:text-emerald-400 mt-1">{formatUSD(t.totalPaymentsUSD)}</p>
            <p className="text-xs text-muted-foreground tabular-nums">{formatVES(t.totalPaymentsVES)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground uppercase font-medium">Cartera por cobrar</p>
            <p className="text-2xl font-bold tabular-nums text-rose-600 dark:text-rose-400 mt-1">{formatUSD(t.totalOutstandingUSD)}</p>
            <p className="text-xs text-muted-foreground tabular-nums">{formatVES(t.totalOutstandingVES)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground uppercase font-medium">Créditos a favor</p>
            <p className="text-2xl font-bold tabular-nums text-sky-600 dark:text-sky-400 mt-1">{formatUSD(t.totalCreditUSD)}</p>
            <p className="text-xs text-muted-foreground">Pagos anticipados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground uppercase font-medium">Morosidad</p>
            <p className="text-2xl font-bold tabular-nums text-amber-600 mt-1">
              {t.residencesCount > 0 ? ((t.debtorsCount / t.residencesCount) * 100).toFixed(1) : "0"}%
            </p>
            <p className="text-xs text-muted-foreground">{formatInt(t.debtorsCount)} de {formatInt(t.residencesCount)} viviendas</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Tendencia BCV 90 días */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              Evolución tasa BCV (90 días)
            </CardTitle>
            <CardDescription>Variación del bolívar frente al dólar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {bcvArea.length > 1 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={bcvArea} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="bcvRep" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="oklch(0.51 0.12 162)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="oklch(0.51 0.12 162)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="fecha" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" interval={Math.floor(bcvArea.length / 6)} />
                    <YAxis tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                    <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", fontSize: 12 }} formatter={(v: number) => [formatNumber(v), "Bs/USD"]} />
                    <Area type="monotone" dataKey="tasa" stroke="oklch(0.51 0.12 162)" strokeWidth={2} fill="url(#bcvRep)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-muted-foreground">Sin datos suficientes</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Distribución por método */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <PieChart className="h-4 w-4 text-emerald-600" />
              Distribución por método de pago
            </CardTitle>
            <CardDescription>Proporción de ingresos por canal</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {methodPie.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie data={methodPie} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={2}>
                      {methodPie.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", fontSize: 12 }} formatter={(v: number) => [formatUSD(v), "USD"]} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </RechartsPie>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-muted-foreground">Sin pagos registrados</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pagos por mes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-600" />
              Volumen mensual de pagos
            </CardTitle>
            <CardDescription>Cantidad de pagos por mes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {monthlyBar.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyBar} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="mes" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                    <YAxis tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                    <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", fontSize: 12 }} />
                    <Bar dataKey="pagos" fill="oklch(0.7 0.15 75)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-muted-foreground">Sin datos</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabla resumen por método */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Banknote className="h-4 w-4 text-emerald-600" />
              Detalle por método
            </CardTitle>
            <CardDescription>Totales absolutos por canal de pago</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="border-y">
                <tr className="text-left text-xs text-muted-foreground">
                  <th className="font-medium py-2.5 px-4">Método</th>
                  <th className="font-medium py-2.5 px-4 text-right">Pagos</th>
                  <th className="font-medium py-2.5 px-4 text-right">USD</th>
                  <th className="font-medium py-2.5 px-4 text-right">VES</th>
                </tr>
              </thead>
              <tbody>
                {data.paymentsByMethod.map((m) => (
                  <tr key={m.method} className="border-b last:border-0">
                    <td className="py-3 px-4"><PaymentMethodBadge method={m.method as keyof typeof PAYMENT_METHOD_MAP} /></td>
                    <td className="py-3 px-4 text-right tabular-nums">{formatInt(m.count)}</td>
                    <td className="py-3 px-4 text-right font-semibold tabular-nums text-usd">{formatUSD(m.totalUSD)}</td>
                    <td className="py-3 px-4 text-right tabular-nums text-ves text-xs">{formatVES(m.totalVES)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* Estado de cartera */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Estado de cartera consolidado</CardTitle>
          <CardDescription>Resumen de saldos de todas las viviendas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            <div className="rounded-xl border p-4">
              <p className="text-xs text-muted-foreground uppercase">Deuda total</p>
              <p className="text-xl font-bold tabular-nums text-rose-600 dark:text-rose-400 mt-1">{formatUSD(outstandingByType.debt)}</p>
              <p className="text-xs text-muted-foreground tabular-nums">{formatVES(outstandingByType.debt * (data.bcv?.rate ?? 0))}</p>
            </div>
            <div className="rounded-xl border p-4">
              <p className="text-xs text-muted-foreground uppercase">Crédito a favor</p>
              <p className="text-xl font-bold tabular-nums text-sky-600 dark:text-sky-400 mt-1">{formatUSD(outstandingByType.credit)}</p>
              <p className="text-xs text-muted-foreground">Adelantos de propietarios</p>
            </div>
            <div className="rounded-xl border p-4">
              <p className="text-xs text-muted-foreground uppercase">Neto por cobrar</p>
              <p className="text-xl font-bold tabular-nums text-amber-600 dark:text-amber-400 mt-1">{formatUSD(outstandingByType.debt - outstandingByType.credit)}</p>
              <Badge variant="outline" className="mt-1">Saldo consolidado</Badge>
            </div>
            <div className="rounded-xl border p-4 bg-gradient-to-br from-emerald-50 to-amber-50 dark:from-emerald-950/30 dark:to-amber-950/20">
              <p className="text-xs text-muted-foreground uppercase">Tasa BCV actual</p>
              <p className="text-xl font-bold tabular-nums text-emerald-700 dark:text-emerald-400 mt-1">{formatNumber(data.bcv?.rate ?? 0)}</p>
              <p className="text-xs text-muted-foreground">Bs/USD · {formatDate(data.bcv?.date ?? new Date())}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
