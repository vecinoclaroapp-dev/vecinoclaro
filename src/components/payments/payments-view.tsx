"use client";

import { useState } from "react";
import { usePayments, useCreatePayment, useResidences, useBcvRate } from "@/hooks/use-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaymentMethodBadge, PaymentStatusBadge } from "@/components/shared/badges";
import { PAYMENT_METHODS, VENEZUELAN_BANKS, type PaymentMethod } from "@/lib/constants";
import { formatUSD, formatVES, formatDate, formatNumber, formatInt, usdToVes, round2 } from "@/lib/money";
import { useAppStore } from "@/store/app-store";
import { Plus, Search, CreditCard, Smartphone, Building2, DollarSign, Banknote, ArrowRightLeft, Calendar, Hash, Phone, User, FileText } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const methodIcon: Record<PaymentMethod, React.ComponentType<{ className?: string }>> = {
  PAGO_MOVIL: Smartphone,
  TRANSFERENCIA_NAC: Building2,
  ZELLE: DollarSign,
  EFECTIVO: Banknote,
};

type FormState = {
  residenceId: string;
  method: PaymentMethod;
  amountUSD: string;
  amountVES: string;
  // el usuario edita uno, el otro se calcula
  lastEdited: "usd" | "ves";
  reference: string;
  bankOrigin: string;
  payerPhone: string;
  payerName: string;
  payerDoc: string;
  concept: string;
  category: string;
  date: string;
  notes: string;
};

export function PaymentsView() {
  const { data, isLoading, refetch } = usePayments({ limit: 100 });
  const { data: residencesData } = useResidences(true);
  const { data: bcv } = useBcvRate();
  const create = useCreatePayment();
  const { prefillPayment, setPrefillPayment } = useAppStore();

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filterMethod, setFilterMethod] = useState<string>("ALL");

  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState<FormState>({
    residenceId: "",
    method: "PAGO_MOVIL",
    amountUSD: "",
    amountVES: "",
    lastEdited: "usd",
    reference: "",
    bankOrigin: "",
    payerPhone: "",
    payerName: "",
    payerDoc: "",
    concept: "Pago de mantenimiento",
    category: "MAINTENANCE",
    date: today,
    notes: "",
  });

  // Aplicar prefill desde otra vista (en handle de apertura, no en effect)
  const rate = bcv?.rate ?? 0;

  // Monto opuesto derivado (no en estado, se calcula al vuelo)
  const computedVES = form.lastEdited === "usd" && form.amountUSD !== ""
    ? (rate > 0 ? String(round2(usdToVes(parseFloat(form.amountUSD) || 0, rate))) : form.amountVES)
    : form.amountVES;
  const computedUSD = form.lastEdited === "ves" && form.amountVES !== ""
    ? (rate > 0 ? String(round2((parseFloat(form.amountVES) || 0) / rate)) : form.amountUSD)
    : form.amountUSD;

  const methodConfig = PAYMENT_METHODS.find((m) => m.value === form.method)!;
  const needsBank = form.method === "PAGO_MOVIL" || form.method === "TRANSFERENCIA_NAC";
  const needsReference = form.method !== "EFECTIVO";

  const submit = async () => {
    if (!form.residenceId) { toast.error("Seleccione la vivienda"); return; }
    if (form.amountUSD === "" && form.amountVES === "") { toast.error("Ingrese un monto"); return; }
    if (needsReference && !form.reference.trim()) {
      toast.error(`Ingrese el número de referencia (${methodConfig.label})`); return;
    }
    if (needsBank && !form.bankOrigin) { toast.error("Seleccione el banco de origen"); return; }

    try {
      await create.mutateAsync({
        residenceId: form.residenceId,
        method: form.method,
        amountUSD: computedUSD,
        amountVES: computedVES,
        reference: form.reference || undefined,
        bankOrigin: form.bankOrigin || undefined,
        payerPhone: form.payerPhone || undefined,
        payerName: form.payerName || undefined,
        payerDoc: form.payerDoc || undefined,
        concept: form.concept,
        category: form.category,
        date: form.date,
        notes: form.notes || undefined,
      });
      toast.success("Pago registrado y asentado en el libro contable");
      setOpen(false);
      setForm({
        residenceId: "",
        method: "PAGO_MOVIL",
        amountUSD: "",
        amountVES: "",
        lastEdited: "usd",
        reference: "",
        bankOrigin: "",
        payerPhone: "",
        payerName: "",
        payerDoc: "",
        concept: "Pago de mantenimiento",
        category: "MAINTENANCE",
        date: today,
        notes: "",
      });
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al registrar pago");
    }
  };

  const payments = data?.payments ?? [];
  const filtered = payments.filter((p) => {
    const matchSearch =
      p.residenceNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      p.reference?.toLowerCase().includes(search.toLowerCase()) ||
      p.payerName.toLowerCase().includes(search.toLowerCase());
    const matchMethod = filterMethod === "ALL" || p.method === filterMethod;
    return matchSearch && matchMethod;
  });

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div className="flex flex-1 gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por vivienda, referencia o pagador..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterMethod} onValueChange={setFilterMethod}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Todos los métodos" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos los métodos</SelectItem>
              {PAYMENT_METHODS.map((m) => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Dialog open={open} onOpenChange={(o) => {
          setOpen(o);
          if (!o) setPrefillPayment(null);
        }}>
          <DialogTrigger asChild>
            <Button className="gap-1.5" onClick={() => {
              // Aplicar prefill al abrir si viene de otra vista
              if (prefillPayment?.residenceId) {
                setForm((f) => ({
                  ...f,
                  residenceId: prefillPayment.residenceId!,
                  concept: prefillPayment.concept ?? f.concept,
                  category: prefillPayment.category ?? f.category,
                }));
              }
            }}>
              <Plus className="h-4 w-4" /> Registrar pago
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto scroll-fine">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-emerald-600" /> Registrar pago bimonetario
              </DialogTitle>
              <DialogDescription>
                Tasa BCV vigente: <span className="font-semibold text-emerald-700 dark:text-emerald-400">{formatNumber(rate)} Bs/USD</span>
                . El sistema calcula automáticamente el monto en la otra moneda y crea el asiento contable inmutable.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 py-2">
              {/* Método de pago — selector visual */}
              <div className="space-y-2">
                <Label>Método de pago</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PAYMENT_METHODS.map((m) => {
                    const Icon = methodIcon[m.value];
                    const active = form.method === m.value;
                    return (
                      <button
                        key={m.value}
                        type="button"
                        onClick={() => setForm({ ...form, method: m.value })}
                        className={cn(
                          "flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all",
                          active
                            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 shadow-sm"
                            : "border-border hover:border-emerald-300 hover:bg-muted/40",
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="text-xs font-semibold text-center leading-tight">{m.label}</span>
                        <Badge variant="outline" className="text-[9px] h-4 px-1">{m.currency}</Badge>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Vivienda + fecha */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="residence">Vivienda *</Label>
                  <Select value={form.residenceId} onValueChange={(v) => setForm({ ...form, residenceId: v })}>
                    <SelectTrigger id="residence"><SelectValue placeholder="Seleccione..." /></SelectTrigger>
                    <SelectContent className="max-h-72">
                      {(residencesData?.residences ?? []).map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.number} — {r.ownerName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="date">Fecha *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="date" type="date" className="pl-9" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                  </div>
                </div>
              </div>

              {/* Montos bimonetarios */}
              <div className="rounded-xl border-2 border-emerald-100 dark:border-emerald-900/40 bg-gradient-to-br from-emerald-50/50 to-amber-50/30 dark:from-emerald-950/20 dark:to-amber-950/10 p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  <ArrowRightLeft className="h-3.5 w-3.5" />
                  Conversión automática · {formatNumber(rate)} Bs/USD
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="usd" className="text-usd font-semibold">Monto USD</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-600" />
                      <Input
                        id="usd"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="pl-9 font-bold tabular-nums"
                        value={computedUSD}
                        onChange={(e) => setForm({ ...form, amountUSD: e.target.value, lastEdited: "usd" })}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ves" className="text-ves font-semibold">Monto VES (Bolívares)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ves font-bold text-sm flex items-center justify-center">Bs</span>
                      <Input
                        id="ves"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="pl-9 font-bold tabular-nums"
                        value={computedVES}
                        onChange={(e) => setForm({ ...form, amountVES: e.target.value, lastEdited: "ves" })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Campos según método */}
              {needsReference && (
                <div className="space-y-1.5">
                  <Label htmlFor="ref">
                    {form.method === "ZELLE" ? "Referencia Zelle" : "Número de referencia / operación"} *
                  </Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="ref" className="pl-9" placeholder={form.method === "ZELLE" ? "Zelle confirmation #" : "00000000000"} value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} />
                  </div>
                </div>
              )}

              {needsBank && (
                <div className="space-y-1.5">
                  <Label htmlFor="bank">Banco de origen *</Label>
                  <Select value={form.bankOrigin} onValueChange={(v) => setForm({ ...form, bankOrigin: v })}>
                    <SelectTrigger id="bank"><SelectValue placeholder="Seleccione el banco emisor..." /></SelectTrigger>
                    <SelectContent className="max-h-72">
                      {VENEZUELAN_BANKS.map((b) => (
                        <SelectItem key={b} value={b}>{b}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Datos del pagador */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="payer">Pagador</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="payer" className="pl-9" placeholder="Nombre del pagador" value={form.payerName} onChange={(e) => setForm({ ...form, payerName: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="doc">Cédula / RIF</Label>
                  <Input id="doc" placeholder="V-12.345.678" value={form.payerDoc} onChange={(e) => setForm({ ...form, payerDoc: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Teléfono</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="phone" className="pl-9" placeholder="+58 412-..." value={form.payerPhone} onChange={(e) => setForm({ ...form, payerPhone: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cat">Categoría</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger id="cat"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MAINTENANCE">Mantenimiento</SelectItem>
                      <SelectItem value="SERVICE_CHARGE">Servicio crítico</SelectItem>
                      <SelectItem value="RESERVE">Fondo de reserva</SelectItem>
                      <SelectItem value="OTHER">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="concept">Concepto</Label>
                <Input id="concept" value={form.concept} onChange={(e) => setForm({ ...form, concept: e.target.value })} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notes">Notas (opcional)</Label>
                <Textarea id="notes" rows={2} placeholder="Observaciones internas..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={submit} disabled={create.isPending} className="gap-1.5">
                <FileText className="h-4 w-4" />
                Registrar y asentar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabla */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-emerald-600" />
            {formatInt(filtered.length)} pagos registrados
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
                    <th className="font-medium py-3 px-4">Fecha</th>
                    <th className="font-medium py-3 px-4">Vivienda</th>
                    <th className="font-medium py-3 px-4 hidden md:table-cell">Método</th>
                    <th className="font-medium py-3 px-4 hidden lg:table-cell">Referencia</th>
                    <th className="font-medium py-3 px-4 text-right">Monto</th>
                    <th className="font-medium py-3 px-4 text-center hidden sm:table-cell">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={6} className="py-12 text-center text-muted-foreground">No hay pagos que coincidan</td></tr>
                  ) : (
                    filtered.map((p) => (
                      <tr key={p.id} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
                        <td className="py-3 px-4 text-xs text-muted-foreground tabular-nums whitespace-nowrap">{formatDate(p.date)}</td>
                        <td className="py-3 px-4">
                          <div className="font-semibold">{p.residenceNumber}</div>
                          <div className="text-xs text-muted-foreground truncate max-w-[140px]">{p.payerName || p.ownerName}</div>
                        </td>
                        <td className="py-3 px-4 hidden md:table-cell"><PaymentMethodBadge method={p.method} /></td>
                        <td className="py-3 px-4 hidden lg:table-cell">
                          {p.reference ? (
                            <div>
                              <div className="text-xs font-mono tabular-nums">{p.reference}</div>
                              {p.bankOrigin && <div className="text-[10px] text-muted-foreground truncate max-w-[160px]">{p.bankOrigin}</div>}
                            </div>
                          ) : <span className="text-xs text-muted-foreground">—</span>}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="font-bold tabular-nums text-usd">{formatUSD(p.amountUSD)}</div>
                          <div className="text-xs text-muted-foreground tabular-nums">{formatVES(p.amountVES)}</div>
                        </td>
                        <td className="py-3 px-4 text-center hidden sm:table-cell"><PaymentStatusBadge status={p.status} /></td>
                      </tr>
                    ))
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
