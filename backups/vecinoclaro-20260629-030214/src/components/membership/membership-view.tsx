"use client";

import { useState } from "react";
import { useMemberships, usePayMembership, useBcvRate } from "@/hooks/use-api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatUSD, formatVES, formatDate, formatNumber, formatInt } from "@/lib/money";
import {
  Crown,
  Building2,
  Users,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Sparkles,
  Heart,
  Shield,
  Zap,
  Award,
  Receipt,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  PENDING: { label: "Pendiente", color: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900", icon: Clock },
  PAID: { label: "Pagada", color: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900", icon: CheckCircle2 },
  OVERDUE: { label: "Vencida", color: "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900", icon: AlertTriangle },
  WAIVED: { label: "Exonerada", color: "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-900", icon: Shield },
};

const PAYMENT_METHODS = [
  { value: "PAGO_MOVIL", label: "Pago Móvil" },
  { value: "ZELLE", label: "Zelle" },
  { value: "TRANSFERENCIA_NAC", label: "Transferencia" },
  { value: "EFECTIVO", label: "Efectivo" },
  { value: "MANUAL", label: "Manual" },
];

export function MembershipView() {
  const { data, isLoading } = useMemberships();
  const { data: bcv } = useBcvRate();
  const payMutation = usePayMembership();

  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const [payPeriod, setPayPeriod] = useState<string | null>(null);
  const [payMethod, setPayMethod] = useState("PAGO_MOVIL");
  const [payReference, setPayReference] = useState("");

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  const current = data.current;
  const history = data.history;
  const yearly = data.yearly;
  const activeResidences = data.activeResidences;
  const ratePerApt = data.ratePerAptUSD;
  const statusCfg = STATUS_CONFIG[current.status] ?? STATUS_CONFIG.PENDING;
  const StatusIcon = statusCfg.icon;

  const openPayDialog = (period: string) => {
    setPayPeriod(period);
    setPayMethod("PAGO_MOVIL");
    setPayReference("");
    setPayDialogOpen(true);
  };

  const confirmPay = async () => {
    if (!payPeriod) return;
    try {
      await payMutation.mutateAsync({
        period: payPeriod,
        paidMethod: payMethod,
        paidReference: payReference || undefined,
      });
      toast.success("Membresía marcada como pagada");
      setPayDialogOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al procesar pago");
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero de membresía — 3B: Bueno, Bonito, Barato */}
      <Card className="relative overflow-hidden border-emerald-200 dark:border-emerald-900/50 bg-gradient-to-br from-emerald-50 via-white to-amber-50/50 dark:from-emerald-950/20 dark:via-background dark:to-amber-950/10">
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <CardContent className="relative z-10 pt-8 pb-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-amber-500 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
              <Crown className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-bold">Membresía VecinoClaro</h2>
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900">
                  <Sparkles className="h-3 w-3 mr-1" /> 3B
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Bueno · Bonito · Barato — El mejor servicio de gestión de condominios de Venezuela
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-emerald-100 dark:border-emerald-900/40 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center">
                  <Heart className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Bueno</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Plataforma completa con 30+ módulos, IA de comprobantes, hash chain SHA-256 y soporte bimonetario real.
              </p>
            </div>
            <div className="rounded-xl bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-amber-100 dark:border-amber-900/40 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center">
                  <Award className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <span className="text-sm font-bold text-amber-700 dark:text-amber-400">Bonito</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Diseño moderno con shadcn/ui, animaciones fluidas, PWA instalable y experiencia tipo app nativa.
              </p>
            </div>
            <div className="rounded-xl bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-sky-100 dark:border-sky-900/40 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-lg bg-sky-100 dark:bg-sky-950/50 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                </div>
                <span className="text-sm font-bold text-sky-700 dark:text-sky-400">Barato</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Solo $2 USD por apartamento al mes. Un condominio de 12 viviendas paga $24/mes. Accesible para todos.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats principales */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="border-emerald-200 dark:border-emerald-900/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center shrink-0">
                <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">{formatInt(activeResidences)}</p>
                <p className="text-xs text-muted-foreground">Apartamentos activos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-200 dark:border-amber-900/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center shrink-0">
                <DollarSign className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums text-amber-600 dark:text-amber-400">{formatUSD(ratePerApt)}</p>
                <p className="text-xs text-muted-foreground">Por apartamento/mes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-emerald-200 dark:border-emerald-900/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center shrink-0">
                <Crown className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">{formatUSD(current.totalUSD)}</p>
                <p className="text-xs text-muted-foreground">Total mensual</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-violet-200 dark:border-violet-900/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-violet-100 dark:bg-violet-950/40 flex items-center justify-center shrink-0">
                <TrendingUp className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <p className="text-sm font-bold tabular-nums text-ves">{formatVES(current.totalVES)}</p>
                <p className="text-xs text-muted-foreground">Equivalente en Bs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Membresía del período actual */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Receipt className="h-5 w-5 text-emerald-600" />
              Membresía del período: {current.period}
            </CardTitle>
            <CardDescription className="mt-1">
              Facturación bimonetaria · Tasa BCV: {formatNumber(current.bcvRate)} Bs/USD
            </CardDescription>
          </div>
          <Badge className={cn("border", statusCfg.color)}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {statusCfg.label}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Desglose del cálculo */}
          <div className="rounded-xl border border-border bg-card/50 p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" /> Apartamentos activos
              </span>
              <span className="font-bold tabular-nums">{formatInt(current.activeResidences)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4" /> Tarifa por apartamento
              </span>
              <span className="font-bold tabular-nums">{formatUSD(current.ratePerAptUSD)}</span>
            </div>
            <div className="border-t pt-3 flex items-center justify-between">
              <span className="font-semibold flex items-center gap-2">
                <Crown className="h-4 w-4 text-emerald-600" /> Total a pagar
              </span>
              <div className="text-right">
                <div className="font-bold tabular-nums text-emerald-600 dark:text-emerald-400">{formatUSD(current.totalUSD)}</div>
                <div className="text-xs text-muted-foreground tabular-nums text-ves">{formatVES(current.totalVES)}</div>
              </div>
            </div>
          </div>

          {/* Fechas y estado */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted/40 p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Generada</p>
              <p className="text-sm font-medium">{formatDate(current.createdAt)}</p>
            </div>
            <div className="rounded-lg bg-muted/40 p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Vencimiento</p>
              <p className="text-sm font-medium">{formatDate(current.dueDate)}</p>
            </div>
          </div>

          {/* Acción */}
          {current.status !== "PAID" && (
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={() => openPayDialog(current.period)}
                disabled={payMutation.isPending}
                className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700"
              >
                <CheckCircle2 className="h-4 w-4" />
                Marcar como pagada
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
          {current.status === "PAID" && current.paidAt && (
            <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 p-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div className="text-sm">
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">Pagada el {formatDate(current.paidAt)}</span>
                {current.paidMethod && <span className="text-muted-foreground"> · {PAYMENT_METHODS.find(m => m.value === current.paidMethod)?.label ?? current.paidMethod}</span>}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumen anual */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center shrink-0">
                <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">{formatUSD(yearly.totalUSD)}</p>
                <p className="text-xs text-muted-foreground">Pagado en {new Date().getFullYear()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xl font-bold tabular-nums">{formatInt(yearly.paidPeriods)}/{formatInt(yearly.totalPeriods)}</p>
                <p className="text-xs text-muted-foreground">Períodos pagados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-violet-100 dark:bg-violet-950/40 flex items-center justify-center shrink-0">
                <Building2 className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <p className="text-xl font-bold tabular-nums">{formatInt(activeResidences * 12)}</p>
                <p className="text-xs text-muted-foreground">Aptos-año proyectados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Historial de membresías */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-emerald-600" />
            Historial de membresías
          </CardTitle>
          <CardDescription>Últimos 12 períodos facturados</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-96 overflow-y-auto scroll-fine">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card border-y z-10">
                <tr className="text-left text-xs text-muted-foreground">
                  <th className="font-medium py-3 px-4">Período</th>
                  <th className="font-medium py-3 px-4 text-center hidden sm:table-cell">Aptos</th>
                  <th className="font-medium py-3 px-4 text-right">Total USD</th>
                  <th className="font-medium py-3 px-4 text-right hidden md:table-cell">Total VES</th>
                  <th className="font-medium py-3 px-4 text-center">Estado</th>
                  <th className="font-medium py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground text-sm">
                      No hay historial de membresías todavía
                    </td>
                  </tr>
                ) : (
                  history.map((m) => {
                    const cfg = STATUS_CONFIG[m.status] ?? STATUS_CONFIG.PENDING;
                    const MIcon = cfg.icon;
                    return (
                      <tr key={m.id} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
                        <td className="py-3 px-4 font-semibold">{m.period}</td>
                        <td className="py-3 px-4 text-center hidden sm:table-cell tabular-nums">{formatInt(m.activeResidences)}</td>
                        <td className="py-3 px-4 text-right font-bold tabular-nums text-emerald-600 dark:text-emerald-400">{formatUSD(m.totalUSD)}</td>
                        <td className="py-3 px-4 text-right hidden md:table-cell tabular-nums text-ves text-xs">{formatVES(m.totalVES)}</td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant="outline" className={cn("text-[10px]", cfg.color)}>
                            <MIcon className="h-2.5 w-2.5 mr-0.5" />
                            {cfg.label}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {m.status !== "PAID" ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 gap-1 text-emerald-700 dark:text-emerald-400"
                              onClick={() => openPayDialog(m.period)}
                            >
                              Pagar
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">{m.paidAt ? formatDate(m.paidAt) : "—"}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Sección de posicionamiento — El mejor servicio de Venezuela */}
      <Card className="bg-gradient-to-br from-emerald-950 to-emerald-900 text-white border-emerald-800 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />
        <CardContent className="relative z-10 pt-8 pb-8">
          <div className="flex items-start gap-3 mb-6">
            <div className="h-12 w-12 rounded-xl bg-amber-400 flex items-center justify-center shrink-0">
              <Crown className="h-6 w-6 text-emerald-950" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">El mejor servicio te lo da TU VecinoClaro</h3>
              <p className="text-sm text-emerald-200">Siendo el mejor de Venezuela 🇻🇪</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-amber-400" />
                <span className="font-semibold">Transparencia auditable</span>
              </div>
              <p className="text-xs text-emerald-100/80 leading-relaxed">
                Cada transacción queda registrada con hash SHA-256 inmutable. Ninguna otra plataforma en Venezuela ofrece auditoría criptográfica de nivel blockchain.
              </p>
            </div>
            <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-amber-400" />
                <span className="font-semibold">IA de comprobantes</span>
              </div>
              <p className="text-xs text-emerald-100/80 leading-relaxed">
                Groq Llama 3.2 90B Vision verifica cada comprobante con OCR + detección de fraude. Ahorra 6 horas semanales al administrador.
              </p>
            </div>
            <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-amber-400" />
                <span className="font-semibold">Bimonetario real</span>
              </div>
              <p className="text-xs text-emerald-100/80 leading-relaxed">
                USD + VES con snapshot de tasa BCV en cada transacción. No hay ambigüedad. Único en el mercado venezolano.
              </p>
            </div>
            <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="h-5 w-5 text-amber-400" />
                <span className="font-semibold">100% local venezolano</span>
              </div>
              <p className="text-xs text-emerald-100/80 leading-relaxed">
                Hecho por y para venezolanos. Entiende Pago Móvil, Zelle, Ley de Propiedad Horizontal, RIF, cédulas. No es una traducción.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="text-2xl font-bold">
                Solo <span className="text-amber-400">$2 USD</span> por apartamento al mes
              </p>
              <p className="text-xs text-emerald-200 mt-1">
                Tasa BCV aplicada automáticamente · Sin comisiones ocultas · Cancela cuando quieras
              </p>
            </div>
            {bcv?.rate && (
              <div className="text-right">
                <p className="text-xs text-emerald-200">Equivalente hoy</p>
                <p className="font-bold tabular-nums text-ves">{formatVES(2 * bcv.rate)}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog de pago */}
      <Dialog open={payDialogOpen} onOpenChange={setPayDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-emerald-600" />
              Pagar membresía {payPeriod}
            </DialogTitle>
            <DialogDescription>
              Registra el pago de la membresía mensual de VecinoClaro.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="pay-method">Método de pago</Label>
              <Select value={payMethod} onValueChange={setPayMethod}>
                <SelectTrigger id="pay-method"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pay-ref">Referencia (opcional)</Label>
              <Input
                id="pay-ref"
                placeholder="Número de referencia del pago"
                value={payReference}
                onChange={(e) => setPayReference(e.target.value)}
              />
            </div>
            {current && payPeriod === current.period && (
              <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total a pagar:</span>
                  <div className="text-right">
                    <div className="font-bold text-emerald-600 dark:text-emerald-400">{formatUSD(current.totalUSD)}</div>
                    <div className="text-xs text-ves tabular-nums">{formatVES(current.totalVES)}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayDialogOpen(false)}>Cancelar</Button>
            <Button onClick={confirmPay} disabled={payMutation.isPending} className="bg-emerald-600 hover:bg-emerald-700 gap-1.5">
              <CheckCircle2 className="h-4 w-4" />
              Confirmar pago
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
