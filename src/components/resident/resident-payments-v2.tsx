"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader, EmptyState } from "@/components/shared/layout";
import { useResidentMe } from "@/hooks/use-resident";
import { CreditCard, Upload, Copy, Check, Hash, Smartphone, Building2, DollarSign, Banknote, Receipt } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatUSD, formatVES } from "@/lib/money";
import { PAYMENT_METHODS, VENEZUELAN_BANKS, type PaymentMethod } from "@/lib/constants";

type PaymentRef = {
  id: string;
  method: PaymentMethod;
  bank?: string;
  accountHolder: string;
  accountNumber: string;
  documentId?: string;
  phone?: string;
};

const methodIcon: Record<PaymentMethod, React.ComponentType<{ className?: string }>> = {
  PAGO_MOVIL: Smartphone,
  TRANSFERENCIA_NAC: Building2,
  ZELLE: DollarSign,
  EFECTIVO: Banknote,
};

export function ResidentPaymentsV2() {
  const qc = useQueryClient();
  const { data: resident } = useResidentMe();
  const [copied, setCopied] = useState<string | null>(null);
  const [method, setMethod] = useState<PaymentMethod>("PAGO_MOVIL");
  const [form, setForm] = useState({ amountUSD: "", reference: "", notes: "" });

  const refs = useQuery<PaymentRef[]>({
    queryKey: ["payment-references"],
    queryFn: async () => {
      const r = await fetch("/api/payment-references");
      if (!r.ok) return [];
      return r.json();
    },
  });

  const myPayments = useQuery({
    queryKey: ["resident", "payments"],
    queryFn: async () => {
      const r = await fetch("/api/residents/me/payments");
      if (!r.ok) return [];
      return r.json();
    },
  });

  const submit = useMutation({
    mutationFn: async (body: typeof form & { method: PaymentMethod }) => {
      const r = await fetch("/api/residents/me/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, amountUSD: Number(body.amountUSD) }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Error");
      return j;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["resident", "payments"] });
      toast.success("Pago registrado. Pendiente de verificación.");
      setForm({ amountUSD: "", reference: "", notes: "" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const copy = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      toast.success(`${label} copiado`);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.error("No se pudo copiar");
    }
  };

  const availableRefs = (refs.data ?? []).filter((r) => r.method === method);
  const bankLabel = (code?: string) => VENEZUELAN_BANKS.find((b) => b.code === code)?.name ?? code ?? "";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mis Pagos"
        subtitle="Código de pago y registro de transferencias"
        icon={CreditCard}
      />

      {/* Código de pago del residente */}
      <Card className="border-emerald-200 bg-emerald-50/40 dark:border-emerald-900 dark:bg-emerald-950/20">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Hash className="h-4 w-4 text-emerald-600" /> Tu código de pago
          </CardTitle>
          <CardDescription>Úsalo como referencia al pagar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Input
              readOnly
              value={resident?.paymentCode ?? "—"}
              className="font-mono text-lg font-bold text-center"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => resident?.paymentCode && copy("Código", resident.paymentCode)}
              title="Copiar"
            >
              {copied === "Código" ? (
                <Check className="h-4 w-4 text-emerald-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Cuentas para pagar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cuentas para pagar</CardTitle>
            <Select value={method} onValueChange={(v) => setMethod(v as PaymentMethod)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="p-0">
            {refs.isLoading ? (
              <div className="space-y-2 p-4">
                {[...Array(2)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : availableRefs.length === 0 ? (
              <EmptyState
                icon={Building2}
                title="Sin cuentas disponibles"
                description="El administrador aún no configura cuentas para este método."
              />
            ) : (
              <div className="divide-y">
                {availableRefs.map((r) => {
                  const Icon = methodIcon[r.method] ?? Banknote;
                  return (
                    <div key={r.id} className="p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-emerald-600" />
                        <span className="text-sm font-medium">{bankLabel(r.bank)}</span>
                      </div>
                      <CopyRow label="Titular" value={r.accountHolder} onCopy={() => copy("Titular", r.accountHolder)} copied={copied === "Titular"} />
                      {r.documentId && (
                        <CopyRow label="Cédula/RIF" value={r.documentId} onCopy={() => copy("Cédula", r.documentId)} copied={copied === "Cédula"} />
                      )}
                      <CopyRow
                        label={r.method === "PAGO_MOVIL" ? "Teléfono" : "Cuenta"}
                        value={r.accountNumber}
                        onCopy={() => copy("Cuenta", r.accountNumber)}
                        copied={copied === "Cuenta"}
                        mono
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Formulario de pago */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Registrar pago</CardTitle>
            <CardDescription>Sube tu comprobante y datos de la transferencia</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="am">Monto pagado (USD)</Label>
              <Input
                id="am"
                type="number"
                step="0.01"
                value={form.amountUSD}
                onChange={(e) => setForm({ ...form, amountUSD: e.target.value })}
              />
              {form.amountUSD && (
                <p className="text-xs text-muted-foreground">
                  ≈ {formatVES(Number(form.amountUSD) * 621)}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ref">Referencia</Label>
              <Input
                id="ref"
                placeholder="N° de referencia bancaria"
                value={form.reference}
                onChange={(e) => setForm({ ...form, reference: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Comprobante</Label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-emerald-400 transition cursor-pointer">
                <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
                <p className="text-xs text-muted-foreground">Subir imagen o PDF</p>
              </div>
            </div>
            <Button
              className="w-full"
              disabled={submit.isPending || !form.amountUSD || !form.reference}
              onClick={() => submit.mutate({ ...form, method })}
            >
              {submit.isPending ? "Enviando..." : "Registrar pago"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Mis pagos recientes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Receipt className="h-4 w-4 text-emerald-600" /> Mis pagos registrados
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {myPayments.isLoading ? (
            <div className="space-y-2 p-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (myPayments.data ?? []).length === 0 ? (
            <EmptyState
              icon={CreditCard}
              title="No has registrado pagos"
              description="Registra tu primer pago usando el formulario de arriba."
            />
          ) : (
            <div className="divide-y">
              {(myPayments.data ?? []).slice(0, 8).map((p: any) => (
                <div key={p.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm font-medium">{formatUSD(p.amount)}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.method} · {p.reference ?? "Sin ref"}
                    </p>
                  </div>
                  <Badge
                    className={cn(
                      p.status === "CONFIRMED" && "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
                      p.status === "PENDING" && "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300",
                      p.status === "REJECTED" && "bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300"
                    )}
                  >
                    {p.status === "CONFIRMED" ? "Confirmado" : p.status === "PENDING" ? "Pendiente" : "Rechazado"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CopyRow({
  label,
  value,
  onCopy,
  copied,
  mono,
}: {
  label: string;
  value: string;
  onCopy: () => void;
  copied?: boolean;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={cn("text-sm font-medium truncate", mono && "font-mono")}>{value}</p>
      </div>
      <Button variant="ghost" size="icon" onClick={onCopy} className="shrink-0">
        {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
      </Button>
    </div>
  );
}
