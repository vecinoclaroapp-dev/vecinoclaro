"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useBcvRate, useBcvHistory, useSyncBcv } from "@/hooks/use-api";
import { formatRate, formatDate, formatNumber } from "@/lib/money";
import { RefreshCw, TrendingUp, TrendingDown, Calendar, ExternalLink, ShieldCheck } from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

export function BcvRateCard() {
  const { data: bcv, isLoading } = useBcvRate();
  const { data: hist } = useBcvHistory(30);
  const sync = useSyncBcv();

  const rates = hist?.rates ?? [];
  const chartData = rates.map((r: { date: string; rate: number }) => ({
    date: formatDate(r.date),
    rate: r.rate,
    raw: r.rate,
  }));

  // variación 30 días
  let variation: number | null = null;
  if (rates.length >= 2) {
    const first = rates[0].rate;
    const last = rates[rates.length - 1].rate;
    variation = ((last - first) / first) * 100;
  }

  const handleSync = () => {
    toast.promise(sync.mutateAsync(), {
      loading: "Consultando BCV...",
      success: (res: { rate?: number; source?: string; message?: string }) =>
        res.message ? `${res.message}` : `Tasa: ${res.rate} Bs/USD`,
      error: (e: Error) => `Error: ${e.message}`,
    });
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="h-7 w-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center">
                <ShieldCheck className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
              </span>
              Tasa Oficial BCV
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">Banco Central de Venezuela · USD → VES</p>
          </div>
          <Button size="sm" variant="outline" onClick={handleSync} disabled={sync.isPending} className="gap-1.5 shrink-0">
            <RefreshCw className={`h-3.5 w-3.5 ${sync.isPending ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Sincronizar</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-4 w-32" />
          </div>
        ) : (
          <>
            <div className="flex items-end justify-between gap-2">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl md:text-4xl font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
                    {formatNumber(bcv?.rate ?? 0)}
                  </span>
                  <span className="text-sm font-medium text-muted-foreground">Bs/USD</span>
                </div>
                <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {bcv?.date ? formatDate(bcv.date) : "—"}
                  {bcv?.isToday ? (
                    <Badge variant="outline" className="h-4 px-1 text-[10px] gap-0.5 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900">
                      Vigente hoy
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="h-4 px-1 text-[10px] bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900">
                      Desactualizado
                    </Badge>
                  )}
                </div>
              </div>
              {variation !== null && (
                <div className={`flex items-center gap-1 text-sm font-semibold tabular-nums ${variation >= 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                  {variation >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  {variation >= 0 ? "+" : ""}{variation.toFixed(2)}%
                  <span className="text-[10px] font-normal text-muted-foreground">30d</span>
                </div>
              )}
            </div>

            {/* Mini gráfico */}
            <div className="h-24 -mx-2">
              {chartData.length > 1 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
                    <defs>
                      <linearGradient id="bcvGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="oklch(0.51 0.12 162)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="oklch(0.51 0.12 162)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" hide />
                    <YAxis hide domain={["dataMin - 1", "dataMax + 1"]} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 8,
                        border: "1px solid var(--border)",
                        fontSize: 12,
                        padding: "6px 10px",
                      }}
                      formatter={(v: number) => [formatRate(v), "Tasa"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="rate"
                      stroke="oklch(0.51 0.12 162)"
                      strokeWidth={2}
                      fill="url(#bcvGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                  Sin historial suficiente
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t">
              <span>Fuente: {bcv?.source ?? "—"}</span>
              <a
                href="https://www.bcv.org.ve"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:text-emerald-700 dark:hover:text-emerald-400"
              >
                bcv.org.ve <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
