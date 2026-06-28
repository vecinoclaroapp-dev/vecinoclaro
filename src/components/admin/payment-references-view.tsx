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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PageHeader, EmptyState } from "@/components/shared/layout";
import { Landmark, Plus, Building2, Hash, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PAYMENT_METHODS, VENEZUELAN_BANKS } from "@/lib/constants";
import type { PaymentMethod } from "@/lib/constants";

type PaymentRef = {
  id: string;
  method: PaymentMethod;
  bank?: string;
  accountHolder: string;
  accountNumber: string;
  documentId?: string;
  phone?: string;
  notes?: string;
};

export function PaymentReferencesView() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    method: "PAGO_MOVIL" as PaymentMethod,
    bank: "",
    accountHolder: "",
    accountNumber: "",
    documentId: "",
    phone: "",
  });

  const { data, isLoading } = useQuery<PaymentRef[]>({
    queryKey: ["payment-references"],
    queryFn: async () => {
      const r = await fetch("/api/payment-references");
      if (!r.ok) throw new Error("Error");
      return r.json();
    },
  });

  const create = useMutation({
    mutationFn: async (body: typeof form) => {
      const r = await fetch("/api/payment-references", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Error");
      return j;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payment-references"] });
      toast.success("Cuenta agregada");
      setOpen(false);
      setForm({ method: "PAGO_MOVIL", bank: "", accountHolder: "", accountNumber: "", documentId: "", phone: "" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const r = await fetch(`/api/payment-references/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error("Error");
      return r;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payment-references"] });
      toast.success("Cuenta eliminada");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const refs = data ?? [];
  const methodLabel = (m: PaymentMethod) =>
    PAYMENT_METHODS.find((p) => p.value === m)?.label ?? m;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cuentas de Pago"
        subtitle="Referencias bancarias para recibir pagos"
        icon={Landmark}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-1.5">
                <Plus className="h-4 w-4" /> Nueva cuenta
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nueva cuenta de pago</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Método</Label>
                    <Select value={form.method} onValueChange={(v) => setForm({ ...form, method: v as PaymentMethod })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {PAYMENT_METHODS.map((m) => (
                          <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Banco</Label>
                    <Select value={form.bank} onValueChange={(v) => setForm({ ...form, bank: v })}>
                      <SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger>
                      <SelectContent>
                        {VENEZUELAN_BANKS.map((b) => (
                          <SelectItem key={b.code} value={b.code}>{b.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="h">Titular</Label>
                  <Input id="h" value={form.accountHolder} onChange={(e) => setForm({ ...form, accountHolder: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="n">Cédula / RIF</Label>
                    <Input id="n" value={form.documentId} onChange={(e) => setForm({ ...form, documentId: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="acc">N° cuenta / Teléfono</Label>
                    <Input id="acc" value={form.accountNumber} onChange={(e) => setForm({ ...form, accountNumber: e.target.value })} />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button disabled={create.isPending || !form.accountHolder.trim() || !form.accountNumber.trim()} onClick={() => create.mutate(form)}>
                  {create.isPending ? "Guardando..." : "Agregar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {isLoading ? (
        <div className="grid gap-3 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : refs.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState
              icon={Landmark}
              title="No hay cuentas de pago"
              description="Agrega cuentas bancarias (Pago Móvil, Transferencia, Zelle) para recibir pagos."
              actionLabel="Nueva cuenta"
              onAction={() => setOpen(true)}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {refs.map((r) => {
            const bank = VENEZUELAN_BANKS.find((b) => b.code === r.bank);
            return (
              <Card key={r.id}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-9 w-9 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center">
                        <Building2 className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{methodLabel(r.method)}</p>
                        {bank && <p className="text-xs text-muted-foreground">{bank.name}</p>}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Eliminar"
                      disabled={remove.isPending}
                      onClick={() => remove.mutate(r.id)}
                    >
                      <Trash2 className="h-4 w-4 text-rose-600" />
                    </Button>
                  </div>
                  <div className="space-y-1.5 text-sm pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Titular</span>
                      <span className="font-medium">{r.accountHolder}</span>
                    </div>
                    {r.documentId && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Cédula/RIF</span>
                        <span className="font-medium">{r.documentId}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        {r.method === "PAGO_MOVIL" ? "Teléfono" : "Cuenta"}
                      </span>
                      <span className="font-mono font-medium flex items-center gap-1">
                        <Hash className="h-3 w-3 text-emerald-600" />
                        {r.accountNumber}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
