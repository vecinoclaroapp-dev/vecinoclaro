"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { LifeBuoy, Plus, MessageSquare, Clock, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type RequestItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  priority?: "LOW" | "MEDIUM" | "HIGH";
  createdAt: string;
  residenceLabel?: string;
};

const statusConfig = {
  OPEN: { label: "Abierta", Icon: Clock, cls: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300" },
  IN_PROGRESS: { label: "En proceso", Icon: Loader2, cls: "bg-sky-100 text-sky-800 dark:bg-sky-950/50 dark:text-sky-300" },
  RESOLVED: { label: "Resuelta", Icon: CheckCircle2, cls: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300" },
  CLOSED: { label: "Cerrada", Icon: CheckCircle2, cls: "bg-slate-100 text-slate-700 dark:bg-slate-900/50 dark:text-slate-400" },
} as const;

const CATEGORIES = ["Mantenimiento", "Plomería", "Eléctrico", "Seguridad", "Limpieza", "Otro"];

export function RequestsView() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "Mantenimiento" });

  const { data, isLoading } = useQuery<RequestItem[]>({
    queryKey: ["requests"],
    queryFn: async () => {
      const r = await fetch("/api/requests");
      if (!r.ok) throw new Error("Error");
      return r.json();
    },
  });

  const create = useMutation({
    mutationFn: async (body: typeof form) => {
      const r = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Error");
      return j;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["requests"] });
      toast.success("Solicitud creada");
      setOpen(false);
      setForm({ title: "", description: "", category: "Mantenimiento" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const items = data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Solicitudes (Help Desk)"
        subtitle="Gestión de tickets de residentes"
        icon={LifeBuoy}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-1.5">
                <Plus className="h-4 w-4" /> Nueva solicitud
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nueva solicitud</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="t">Título</Label>
                  <Input
                    id="t"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Categoría</Label>
                  <Select
                    value={form.category}
                    onValueChange={(v) => setForm({ ...form, category: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="d">Descripción</Label>
                  <Textarea
                    id="d"
                    rows={4}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  disabled={create.isPending || !form.title.trim()}
                  onClick={() => create.mutate(form)}
                >
                  {create.isPending ? "Guardando..." : "Crear"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState
              icon={LifeBuoy}
              title="No hay solicitudes"
              description="Las solicitudes de los residentes aparecerán aquí."
              actionLabel="Crear solicitud"
              onAction={() => setOpen(true)}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((r) => {
            const cfg = statusConfig[r.status] ?? statusConfig.OPEN;
            const Icon = cfg.Icon;
            return (
              <Card key={r.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-emerald-600" />
                      {r.title}
                    </CardTitle>
                    <Badge className={cn("gap-1", cfg.cls)}>
                      <Icon className="h-3 w-3" />
                      {cfg.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">{r.description}</p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                    <span>{r.category}</span>
                    {r.residenceLabel && <span>· {r.residenceLabel}</span>}
                    <span>· {new Date(r.createdAt).toLocaleDateString("es-VE")}</span>
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
