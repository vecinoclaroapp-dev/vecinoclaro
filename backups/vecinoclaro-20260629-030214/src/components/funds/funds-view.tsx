"use client";

import { useState } from "react";
import { useFunds, useCreateFund, useBcvRate } from "@/hooks/use-api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatUSD, formatVES, formatNumber, formatInt, sum, usdToVes, round2 } from "@/lib/money";
import { Plus, Wallet, Target, PiggyBank, ShieldCheck, Building2, Zap } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const FUND_TYPES = [
  { value: "ORDINARY", label: "Ordinario", desc: "Operaciones diarias", icon: Wallet, color: "emerald" },
  { value: "RESERVE", label: "Reserva", desc: "Emergencias e imprevistos", icon: ShieldCheck, color: "amber" },
  { value: "EXTRAORDINARY", label: "Extraordinario", desc: "Cuotas especiales aprobadas", icon: Zap, color: "violet" },
  { value: "REMODELING", label: "Remodelaciones", desc: "Mejoras y obras", icon: Building2, color: "sky" },
];

const colorMap: Record<string, { bg: string; text: string; ring: string }> = {
  emerald: { bg: "bg-emerald-100 dark:bg-emerald-950/40", text: "text-emerald-700 dark:text-emerald-400", ring: "ring-emerald-200 dark:ring-emerald-900" },
  amber: { bg: "bg-amber-100 dark:bg-amber-950/40", text: "text-amber-700 dark:text-amber-400", ring: "ring-amber-200 dark:ring-amber-900" },
  violet: { bg: "bg-violet-100 dark:bg-violet-950/40", text: "text-violet-700 dark:text-violet-400", ring: "ring-violet-200 dark:ring-violet-900" },
  sky: { bg: "bg-sky-100 dark:bg-sky-950/40", text: "text-sky-700 dark:text-sky-400", ring: "ring-sky-200 dark:ring-sky-900" },
};

export function FundsView() {
  const { data, isLoading } = useFunds();
  const { data: bcv } = useBcvRate();
  const create = useCreateFund();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: "ORDINARY",
    balanceUSD: "",
    targetUSD: "",
  });

  const rate = bcv?.rate ?? 0;
  const funds = data?.funds ?? [];
  const totalBalance = sum(funds.map((f) => f.balanceUSD));

  const submit = async () => {
    if (!form.name.trim()) { toast.error("Nombre obligatorio"); return; }
    try {
      await create.mutateAsync({
        name: form.name,
        type: form.type,
        balanceUSD: Number(form.balanceUSD) || 0,
        balanceVES: rate > 0 ? usdToVes(Number(form.balanceUSD) || 0, rate) : 0,
        targetUSD: form.targetUSD ? Number(form.targetUSD) : null,
      });
      toast.success("Fondo creado");
      setOpen(false);
      setForm({ name: "", type: "ORDINARY", balanceUSD: "", targetUSD: "" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    }
  };

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-1">
              <PiggyBank className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-medium text-muted-foreground uppercase">Total fondos</span>
            </div>
            <p className="text-xl font-bold tabular-nums text-emerald-700 dark:text-emerald-400">{formatUSD(totalBalance)}</p>
            <p className="text-xs text-muted-foreground tabular-nums">{formatVES(totalBalance * rate)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="h-4 w-4 text-amber-600" />
              <span className="text-xs font-medium text-muted-foreground uppercase">Fondos activos</span>
            </div>
            <p className="text-xl font-bold tabular-nums mt-1">{formatInt(funds.length)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-4 w-4 text-violet-600" />
              <span className="text-xs font-medium text-muted-foreground uppercase">Tasa BCV</span>
            </div>
            <p className="text-xl font-bold tabular-nums text-emerald-700 dark:text-emerald-400">{formatNumber(rate)}</p>
            <p className="text-xs text-muted-foreground">Bs/USD</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1.5"><Plus className="h-4 w-4" /> Crear fondo</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Wallet className="h-5 w-5 text-emerald-600" /> Nuevo fondo</DialogTitle>
              <DialogDescription>Organiza el dinero por propósito</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="fname">Nombre *</Label>
                <Input id="fname" placeholder="Fondo de reserva 2025" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Tipo</Label>
                <div className="grid grid-cols-2 gap-2">
                  {FUND_TYPES.map((t) => {
                    const Icon = t.icon;
                    const c = colorMap[t.color];
                    const active = form.type === t.value;
                    return (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setForm({ ...form, type: t.value })}
                        className={cn(
                          "flex items-start gap-2 rounded-xl border-2 p-2.5 text-left transition-all",
                          active ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30" : "border-border hover:border-emerald-300",
                        )}
                      >
                        <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center shrink-0", c.bg, c.text)}>
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold">{t.label}</p>
                          <p className="text-[10px] text-muted-foreground leading-tight">{t.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="fbal">Saldo inicial USD</Label>
                  <Input id="fbal" type="number" step="0.01" placeholder="0.00" value={form.balanceUSD} onChange={(e) => setForm({ ...form, balanceUSD: e.target.value })} />
                  {rate > 0 && form.balanceUSD && (
                    <p className="text-xs text-muted-foreground tabular-nums">≈ {formatVES(round2(usdToVes(parseFloat(form.balanceUSD) || 0, rate)))}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ftarget">Meta USD (opcional)</Label>
                  <Input id="ftarget" type="number" step="0.01" placeholder="5000.00" value={form.targetUSD} onChange={(e) => setForm({ ...form, targetUSD: e.target.value })} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={submit} disabled={create.isPending}>Crear fondo</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Grid de fondos */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-44 rounded-xl" />)}
        </div>
      ) : funds.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Wallet className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm font-medium">No hay fondos creados</p>
            <p className="text-xs text-muted-foreground mt-1">Crea fondos para separar el dinero por propósito: ordinario, reserva, extraordinario.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {funds.map((f) => {
            const typeConfig = FUND_TYPES.find((t) => t.value === f.type) ?? FUND_TYPES[0];
            const Icon = typeConfig.icon;
            const c = colorMap[typeConfig.color];
            const pct = f.targetUSD && f.targetUSD > 0 ? Math.min((f.balanceUSD / f.targetUSD) * 100, 100) : 0;
            return (
              <Card key={f.id} className="overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center", c.bg, c.text)}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm leading-tight">{f.name}</h4>
                        <p className="text-[10px] text-muted-foreground">{typeConfig.label}</p>
                      </div>
                    </div>
                    {f.targetUSD && f.targetUSD > 0 && (
                      <Badge variant="outline" className="text-[10px]">{pct.toFixed(0)}%</Badge>
                    )}
                  </div>
                  <div className="mb-3">
                    <p className="text-2xl font-bold tabular-nums text-usd">{formatUSD(f.balanceUSD)}</p>
                    <p className="text-xs text-muted-foreground tabular-nums">{formatVES(f.balanceVES)}</p>
                  </div>
                  {f.targetUSD && f.targetUSD > 0 && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>Meta: {formatUSD(f.targetUSD)}</span>
                        <span className="tabular-nums">{formatUSD(f.balanceUSD)} / {formatUSD(f.targetUSD)}</span>
                      </div>
                      <Progress value={pct} className="h-1.5" />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
