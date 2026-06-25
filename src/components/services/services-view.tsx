"use client";

import { useState } from "react";
import { useServices, useCreateService, useUpdateService, useResidences, useBcvRate } from "@/hooks/use-api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ServiceStatusBadge } from "@/components/shared/badges";
import { SERVICE_TYPES, SERVICE_STATUS, type ServiceChargeType } from "@/lib/constants";
import { formatUSD, formatVES, formatDate, formatNumber, formatInt, usdToVes, round2 } from "@/lib/money";
import { useAppStore } from "@/store/app-store";
import { Plus, Zap, Droplet, ShieldAlert, Hammer, Wrench, Calendar, Users, Home, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const typeIcon: Record<ServiceChargeType, React.ComponentType<{ className?: string }>> = {
  ELECTRIC_PLANT: Zap,
  WATER_WELL: Droplet,
  CONTINGENCY: ShieldAlert,
  EXTRAORDINARY: Hammer,
  REPAIR: Wrench,
};

const typeColor: Record<ServiceChargeType, string> = {
  ELECTRIC_PLANT: "text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400",
  WATER_WELL: "text-sky-600 bg-sky-50 dark:bg-sky-950/40 dark:text-sky-400",
  CONTINGENCY: "text-rose-600 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400",
  EXTRAORDINARY: "text-violet-600 bg-violet-50 dark:bg-violet-950/40 dark:text-violet-400",
  REPAIR: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400",
};

type FormState = {
  type: ServiceChargeType;
  title: string;
  description: string;
  amountUSD: string;
  dueDate: string;
  residenceId: string; // "" = prorrateado
  status: string;
};

const today = new Date();
const defaultDue = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 15).toISOString().split("T")[0];

const empty: FormState = {
  type: "ELECTRIC_PLANT",
  title: "",
  description: "",
  amountUSD: "",
  dueDate: defaultDue,
  residenceId: "",
  status: "PENDING",
};

export function ServicesView() {
  const { data, isLoading } = useServices();
  const { data: residencesData } = useResidences(true);
  const { data: bcv } = useBcvRate();
  const create = useCreateService();
  const update = useUpdateService();
  const { setView, setPrefillPayment } = useAppStore();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(empty);

  const rate = bcv?.rate ?? 0;
  const services = data?.services ?? [];

  // Agrupar por tipo
  const byType = SERVICE_TYPES.map((st) => ({
    type: st,
    items: services.filter((s) => s.type === st.value),
  }));

  const submit = async () => {
    if (!form.title.trim()) { toast.error("Ingrese el título del cargo"); return; }
    if (!form.amountUSD || parseFloat(form.amountUSD) <= 0) { toast.error("Ingrese un monto válido"); return; }
    try {
      await create.mutateAsync({
        type: form.type,
        title: form.title,
        description: form.description || undefined,
        amountUSD: parseFloat(form.amountUSD),
        dueDate: form.dueDate,
        residenceId: form.residenceId || null,
        status: form.status,
      });
      toast.success(form.residenceId ? "Cargo directo creado y asentado" : "Cargo prorrateado creado y asentado en todas las viviendas");
      setOpen(false);
      setForm(empty);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al crear cargo");
    }
  };

  const markPaid = async (id: string) => {
    try {
      await update.mutateAsync({ id, data: { status: "PAID" } });
      toast.success("Cargo marcado como pagado");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    }
  };

  const cancel = async (id: string) => {
    try {
      await update.mutateAsync({ id, data: { status: "CANCELLED" } });
      toast.success("Cargo anulado");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    }
  };

  const payNow = (s: typeof services[number]) => {
    setPrefillPayment({
      residenceId: s.residenceId ?? undefined,
      concept: s.title,
      category: "SERVICE_CHARGE",
      serviceChargeId: s.id,
    });
    setView("payments");
  };

  const totalPending = services.filter((s) => s.status === "PENDING" || s.status === "OVERDUE").reduce((sum, s) => sum + s.amountUSD, 0);

  return (
    <div className="space-y-5">
      {/* Resumen */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <span className="text-xs font-medium text-muted-foreground uppercase">Pendientes</span>
            </div>
            <p className="text-xl font-bold tabular-nums">{formatInt(services.filter((s) => s.status === "PENDING").length)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-medium text-muted-foreground uppercase">Pagados</span>
            </div>
            <p className="text-xl font-bold tabular-nums">{formatInt(services.filter((s) => s.status === "PAID").length)}</p>
          </CardContent>
        </Card>
        <Card className="col-span-2">
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-4 w-4 text-violet-600" />
              <span className="text-xs font-medium text-muted-foreground uppercase">Total pendiente</span>
            </div>
            <p className="text-xl font-bold tabular-nums text-violet-700 dark:text-violet-400">{formatUSD(totalPending)}</p>
            <p className="text-xs text-muted-foreground tabular-nums">{formatVES(totalPending * rate)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1.5">
              <Plus className="h-4 w-4" /> Nuevo cargo de servicio
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto scroll-fine">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-violet-600" /> Cargo de servicio crítico
              </DialogTitle>
              <DialogDescription>
                Genera un cobro extraordinario y crea automáticamente los asientos contables correspondientes. Si no selecciona vivienda, se prorratea entre todas (locales pagan 2.5×).
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Tipo de servicio — selector visual */}
              <div className="space-y-2">
                <Label>Tipo de servicio</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SERVICE_TYPES.map((st) => {
                    const Icon = typeIcon[st.value];
                    const active = form.type === st.value;
                    return (
                      <button
                        key={st.value}
                        type="button"
                        onClick={() => setForm({ ...form, type: st.value })}
                        className={cn(
                          "flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all text-center",
                          active ? "border-violet-500 bg-violet-50 dark:bg-violet-950/30 shadow-sm" : "border-border hover:border-violet-300 hover:bg-muted/40",
                        )}
                      >
                        <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", typeColor[st.value])}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="text-xs font-semibold leading-tight">{st.label}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground">{SERVICE_TYPES.find((s) => s.value === form.type)?.description}</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="title">Título *</Label>
                <Input id="title" placeholder="Ej: Combustible planta eléctrica — Junio" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="desc">Descripción</Label>
                <Textarea id="desc" rows={2} placeholder="Detalle del cargo, justificación..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="amount">Monto USD *</Label>
                  <Input id="amount" type="number" step="0.01" placeholder="0.00" value={form.amountUSD} onChange={(e) => setForm({ ...form, amountUSD: e.target.value })} />
                  {rate > 0 && form.amountUSD && (
                    <p className="text-xs text-muted-foreground tabular-nums">≈ {formatVES(round2(usdToVes(parseFloat(form.amountUSD) || 0, rate)))} ({formatNumber(rate)} Bs/USD)</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="due">Vencimiento</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="due" type="date" className="pl-9" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="res">Aplicación</Label>
                <Select value={form.residenceId} onValueChange={(v) => setForm({ ...form, residenceId: v === "PRORRATEADO" ? "" : v })}>
                  <SelectTrigger id="res"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PRORRATEADO">
                      <span className="flex items-center gap-2"><Users className="h-4 w-4" /> Prorrateado a todas las viviendas</span>
                    </SelectItem>
                    {(residencesData?.residences ?? []).map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        <span className="flex items-center gap-2"><Home className="h-3.5 w-3.5" /> {r.number} — {r.ownerName}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {form.residenceId ? "Cargo directo a una vivienda específica." : "Prorrateado: cada vivienda recibe un cargo. Locales comerciales pagan 2.5×."}
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={submit} disabled={create.isPending} className="gap-1.5">
                <Zap className="h-4 w-4" /> Crear cargo y asentar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Listado por tipo */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      ) : services.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Zap className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm font-medium">No hay cargos de servicios críticos</p>
            <p className="text-xs text-muted-foreground mt-1">Cree el primero para registrar gastos de planta, pozo, contingencias, etc.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-5">
          {byType.filter((g) => g.items.length > 0).map((group) => {
            const Icon = typeIcon[group.type.value];
            return (
              <div key={group.type.value} className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", typeColor[group.type.value])}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{group.type.label}</h3>
                    <p className="text-xs text-muted-foreground">{group.type.description}</p>
                  </div>
                  <Badge variant="outline" className="ml-auto">{formatInt(group.items.length)}</Badge>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  {group.items.map((s) => (
                    <Card key={s.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-sm leading-tight">{s.title}</h4>
                            {s.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{s.description}</p>}
                          </div>
                          <ServiceStatusBadge status={s.status} />
                        </div>

                        <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t">
                          <div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-0.5">
                              {s.prorrateado ? <Users className="h-3 w-3" /> : <Home className="h-3 w-3" />}
                              {s.prorrateado ? "Prorrateado" : s.residenceNumber}
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                              <Calendar className="h-3 w-3" />
                              Vence: {formatDate(s.dueDate)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold tabular-nums text-usd">{formatUSD(s.amountUSD)}</div>
                            <div className="text-xs text-muted-foreground tabular-nums">{formatVES(s.amountVES)}</div>
                          </div>
                        </div>

                        {s.status === "PENDING" && (
                          <div className="flex gap-2 mt-3">
                            {!s.prorrateado && (
                              <Button size="sm" variant="outline" className="gap-1 flex-1 text-emerald-700 dark:text-emerald-400" onClick={() => payNow(s)}>
                                Registrar pago
                              </Button>
                            )}
                            <Button size="sm" variant="ghost" className="gap-1" onClick={() => markPaid(s.id)}>Marcar pagado</Button>
                            <Button size="sm" variant="ghost" className="text-rose-600" onClick={() => cancel(s.id)}>Anular</Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
