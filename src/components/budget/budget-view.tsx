"use client";

import { useState } from "react";
import { useBudget, useCreateBudget, useBcvRate } from "@/hooks/use-api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formatUSD, formatVES, formatNumber, sum } from "@/lib/money";
import { Plus, Target, TrendingUp, TrendingDown, Calendar, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const BUDGET_CATEGORIES = [
  "ELECTRICIDAD", "AGUA", "SEGURIDAD", "LIMPIEZA", "MANTENIMIENTO", "NOMINA", "IMPUESTOS", "OTRO",
];

const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export function BudgetView() {
  const [year, setYear] = useState(new Date().getFullYear());
  const { data, isLoading } = useBudget(year);
  const { data: bcv } = useBcvRate();
  const create = useCreateBudget();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    category: "MANTENIMIENTO",
    month: "anual",
    amountUSD: "",
  });

  const rate = bcv?.rate ?? 0;
  const budgets = data?.budgets ?? [];
  const totals = data?.totals ?? { budgetedUSD: 0, realUSD: 0 };

  const submit = async () => {
    if (!form.amountUSD || parseFloat(form.amountUSD) <= 0) {
      toast.error("Monto inválido");
      return;
    }
    try {
      await create.mutateAsync({
        category: form.category,
        year,
        month: form.month === "anual" ? null : Number(form.month),
        amountUSD: parseFloat(form.amountUSD),
      });
      toast.success("Presupuesto guardado");
      setOpen(false);
      setForm({ category: "MANTENIMIENTO", month: "anual", amountUSD: "" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    }
  };

  const variance = totals.budgetedUSD - totals.realUSD;
  const executionPct = totals.budgetedUSD > 0 ? (totals.realUSD / totals.budgetedUSD) * 100 : 0;

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-medium text-muted-foreground uppercase">Presupuestado</span>
            </div>
            <p className="text-xl font-bold tabular-nums">{formatUSD(totals.budgetedUSD)}</p>
            <p className="text-xs text-muted-foreground tabular-nums">{formatVES(totals.budgetedUSD * rate)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="h-4 w-4 text-rose-600" />
              <span className="text-xs font-medium text-muted-foreground uppercase">Ejecutado</span>
            </div>
            <p className="text-xl font-bold tabular-nums text-rose-600 dark:text-rose-400">{formatUSD(totals.realUSD)}</p>
            <p className="text-xs text-muted-foreground tabular-nums">{formatVES(totals.realUSD * rate)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-1">
              {variance >= 0 ? <TrendingUp className="h-4 w-4 text-emerald-600" /> : <TrendingDown className="h-4 w-4 text-rose-600" />}
              <span className="text-xs font-medium text-muted-foreground uppercase">Varianza</span>
            </div>
            <p className={cn("text-xl font-bold tabular-nums", variance >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
              {variance >= 0 ? "+" : ""}{formatUSD(variance)}
            </p>
            <p className="text-xs text-muted-foreground">{variance >= 0 ? "Bajo presupuesto" : "Sobre presupuesto"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="h-4 w-4 text-amber-600" />
              <span className="text-xs font-medium text-muted-foreground uppercase">Ejecución</span>
            </div>
            <p className="text-xl font-bold tabular-nums">{executionPct.toFixed(1)}%</p>
            <Progress value={executionPct} className="h-1.5 mt-1" />
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
            <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[year - 1, year, year + 1].map((y) => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1.5"><Plus className="h-4 w-4" /> Asignar presupuesto</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Target className="h-5 w-5 text-emerald-600" /> Presupuesto {year}</DialogTitle>
              <DialogDescription>Establece cuánto planeas gastar por categoría</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="bcat">Categoría</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger id="bcat"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {BUDGET_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bmonth">Periodo</Label>
                <Select value={form.month} onValueChange={(v) => setForm({ ...form, month: v })}>
                  <SelectTrigger id="bmonth"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="anual">Anual (todo el año)</SelectItem>
                    {MONTHS.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m} {year}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bamount">Monto USD</Label>
                <Input id="bamount" type="number" step="0.01" placeholder="0.00" value={form.amountUSD} onChange={(e) => setForm({ ...form, amountUSD: e.target.value })} />
                {rate > 0 && form.amountUSD && (
                  <p className="text-xs text-muted-foreground tabular-nums">≈ {formatVES(parseFloat(form.amountUSD) * rate)}</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={submit} disabled={create.isPending}>Guardar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabla presupuestos */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4 text-emerald-600" />
            Presupuestos {year}
          </CardTitle>
          <CardDescription>Comparación presupuestado vs. ejecutado</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : budgets.length === 0 ? (
            <div className="py-12 text-center">
              <Target className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm font-medium">No hay presupuestos para {year}</p>
              <p className="text-xs text-muted-foreground mt-1">Asigna montos por categoría para comparar con los gastos reales.</p>
            </div>
          ) : (
            <div className="max-h-[60vh] overflow-y-auto scroll-fine">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-card border-y z-10">
                  <tr className="text-left text-xs text-muted-foreground">
                    <th className="font-medium py-3 px-4">Categoría</th>
                    <th className="font-medium py-3 px-4 hidden md:table-cell">Periodo</th>
                    <th className="font-medium py-3 px-4 text-right">Presupuestado</th>
                    <th className="font-medium py-3 px-4 text-right">Ejecutado</th>
                    <th className="font-medium py-3 px-4 text-right">Varianza</th>
                    <th className="font-medium py-3 px-4 hidden lg:table-cell">Ejecución</th>
                  </tr>
                </thead>
                <tbody>
                  {budgets.map((b) => {
                    const pct = b.amountUSD > 0 ? (b.realUSD / b.amountUSD) * 100 : 0;
                    const over = b.realUSD > b.amountUSD;
                    return (
                      <tr key={b.id} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
                        <td className="py-3 px-4 font-medium">{b.category}</td>
                        <td className="py-3 px-4 hidden md:table-cell text-xs text-muted-foreground">
                          {b.month ? `${MONTHS[b.month - 1]} ${b.year}` : `Anual ${b.year}`}
                        </td>
                        <td className="py-3 px-4 text-right tabular-nums">{formatUSD(b.amountUSD)}</td>
                        <td className="py-3 px-4 text-right tabular-nums text-rose-600 dark:text-rose-400">{formatUSD(b.realUSD)}</td>
                        <td className="py-3 px-4 text-right">
                          <span className={cn("font-semibold tabular-nums", b.variance >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
                            {b.variance >= 0 ? "+" : ""}{formatUSD(b.variance)}
                          </span>
                        </td>
                        <td className="py-3 px-4 hidden lg:table-cell">
                          <div className="flex items-center gap-2">
                            <Progress value={Math.min(pct, 100)} className="h-1.5 w-20" />
                            <span className={cn("text-xs tabular-nums font-medium", over ? "text-rose-600" : "text-muted-foreground")}>
                              {pct.toFixed(0)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
