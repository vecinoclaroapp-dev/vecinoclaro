"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PageHeader, EmptyState } from "@/components/shared/layout";
import { UserCheck, Plus, Clock, DoorOpen, User, Phone, Building2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Visitor = {
  id: string;
  name: string;
  residentLabel?: string;
  documentId?: string;
  plate?: string;
  phone?: string;
  company?: string;
  checkInAt?: string;
  checkOutAt?: string;
  status: "PENDING" | "INSIDE" | "CHECKED_OUT";
};

const statusConfig = {
  PENDING: { label: "Por llegar", cls: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300" },
  INSIDE: { label: "Dentro", cls: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300" },
  CHECKED_OUT: { label: "Salió", cls: "bg-slate-100 text-slate-700 dark:bg-slate-900/50 dark:text-slate-400" },
} as const;

export function VisitorsView() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", residentLabel: "", documentId: "", phone: "", company: "", plate: "" });

  const { data, isLoading } = useQuery<Visitor[]>({
    queryKey: ["visitors"],
    queryFn: async () => {
      const r = await fetch("/api/visitors");
      if (!r.ok) throw new Error("Error");
      return r.json();
    },
  });

  const create = useMutation({
    mutationFn: async (body: typeof form) => {
      const r = await fetch("/api/visitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Error");
      return j;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["visitors"] });
      toast.success("Visitante registrado");
      setOpen(false);
      setForm({ name: "", residentLabel: "", documentId: "", phone: "", company: "", plate: "" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const checkout = useMutation({
    mutationFn: async (id: string) => {
      const r = await fetch(`/api/visitors/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "checkout" }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Error");
      return j;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["visitors"] });
      toast.success("Salida registrada");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const visitors = data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Visitantes"
        subtitle="Control de acceso de personas"
        icon={UserCheck}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-1.5">
                <Plus className="h-4 w-4" /> Registrar visita
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar visita</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="n">Nombre</Label>
                    <Input id="n" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="d">Cédula</Label>
                    <Input id="d" value={form.documentId} onChange={(e) => setForm({ ...form, documentId: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="r">Visita a</Label>
                    <Input id="r" placeholder="Vivienda" value={form.residentLabel} onChange={(e) => setForm({ ...form, residentLabel: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="p">Teléfono</Label>
                    <Input id="p" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="c">Empresa</Label>
                    <Input id="c" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="pl">Placa</Label>
                    <Input id="pl" value={form.plate} onChange={(e) => setForm({ ...form, plate: e.target.value })} />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button disabled={create.isPending || !form.name.trim()} onClick={() => create.mutate(form)}>
                  {create.isPending ? "Guardando..." : "Registrar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : visitors.length === 0 ? (
            <EmptyState
              icon={UserCheck}
              title="No hay visitantes"
              description="Registra entradas y salidas de visitantes del condominio."
              actionLabel="Registrar visita"
              onAction={() => setOpen(true)}
            />
          ) : (
            <ScrollArea className="max-h-[65vh]">
              <div className="divide-y">
                {visitors.map((v) => {
                  const cfg = statusConfig[v.status] ?? statusConfig.PENDING;
                  return (
                    <div key={v.id} className="p-4 flex items-center gap-3 hover:bg-muted/40">
                      <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center shrink-0">
                        <User className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-sm truncate">{v.name}</p>
                          <Badge className={cn(cfg.cls)}>{cfg.label}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                          {v.residentLabel && (
                            <span className="flex items-center gap-1">
                              <DoorOpen className="h-3 w-3" /> {v.residentLabel}
                            </span>
                          )}
                          {v.documentId && <span>C.I.: {v.documentId}</span>}
                          {v.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" /> {v.phone}
                            </span>
                          )}
                          {v.company && (
                            <span className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" /> {v.company}
                            </span>
                          )}
                          {v.checkInAt && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {new Date(v.checkInAt).toLocaleTimeString("es-VE", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          )}
                        </div>
                      </div>
                      {v.status === "INSIDE" && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={checkout.isPending}
                          onClick={() => checkout.mutate(v.id)}
                        >
                          Marcar salida
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
