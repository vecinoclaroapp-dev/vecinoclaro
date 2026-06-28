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
import { Siren, Plus, AlertTriangle, CheckCircle2, Clock, MapPin } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Alert = {
  id: string;
  title: string;
  description?: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: "ACTIVE" | "RESOLVED";
  location?: string;
  createdAt: string;
  resolvedAt?: string;
};

const severityConfig = {
  LOW: { label: "Baja", cls: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300" },
  MEDIUM: { label: "Media", cls: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300" },
  HIGH: { label: "Alta", cls: "bg-orange-100 text-orange-800 dark:bg-orange-950/50 dark:text-orange-300" },
  CRITICAL: { label: "Crítica", cls: "bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300" },
} as const;

export function AlertsView() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", severity: "MEDIUM", location: "" });

  const { data, isLoading } = useQuery<Alert[]>({
    queryKey: ["security-alerts"],
    queryFn: async () => {
      const r = await fetch("/api/security-alerts");
      if (!r.ok) throw new Error("Error");
      return r.json();
    },
  });

  const create = useMutation({
    mutationFn: async (body: typeof form) => {
      const r = await fetch("/api/security-alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Error");
      return j;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["security-alerts"] });
      toast.success("Alerta creada");
      setOpen(false);
      setForm({ title: "", description: "", severity: "MEDIUM", location: "" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const resolve = useMutation({
    mutationFn: async (id: string) => {
      const r = await fetch(`/api/security-alerts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "RESOLVED" }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Error");
      return j;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["security-alerts"] });
      toast.success("Alerta resuelta");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const alerts = data ?? [];
  const activeCount = alerts.filter((a) => a.status === "ACTIVE").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alertas de Seguridad"
        subtitle={`${activeCount} alerta${activeCount === 1 ? "" : "s"} activa${activeCount === 1 ? "" : "s"}`}
        icon={Siren}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-1.5">
                <Plus className="h-4 w-4" /> Nueva alerta
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nueva alerta</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="t">Título</Label>
                  <Input id="t" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Severidad</Label>
                    <Select value={form.severity} onValueChange={(v) => setForm({ ...form, severity: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">Baja</SelectItem>
                        <SelectItem value="MEDIUM">Media</SelectItem>
                        <SelectItem value="HIGH">Alta</SelectItem>
                        <SelectItem value="CRITICAL">Crítica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="l">Ubicación</Label>
                    <Input id="l" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="d">Descripción</Label>
                  <Textarea id="d" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button disabled={create.isPending || !form.title.trim()} onClick={() => create.mutate(form)}>
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
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState
              icon={Siren}
              title="No hay alertas"
              description="Registra incidentes, sospechas o emergencias del condominio."
              actionLabel="Nueva alerta"
              onAction={() => setOpen(true)}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {alerts.map((a) => {
            const sev = severityConfig[a.severity] ?? severityConfig.MEDIUM;
            const isActive = a.status === "ACTIVE";
            return (
              <Card key={a.id} className={isActive ? "border-l-4 border-l-rose-400" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className={cn("h-4 w-4", isActive ? "text-rose-600" : "text-muted-foreground")} />
                      <p className="font-medium text-sm">{a.title}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge className={cn(sev.cls)}>{sev.label}</Badge>
                      <Badge
                        className={cn(
                          isActive
                            ? "bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300"
                            : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                        )}
                      >
                        {isActive ? <Clock className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                        {isActive ? "Activa" : "Resuelta"}
                      </Badge>
                    </div>
                  </div>
                  {a.description && (
                    <p className="text-sm text-muted-foreground mt-2">{a.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {a.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {a.location}
                        </span>
                      )}
                      <span>{new Date(a.createdAt).toLocaleString("es-VE")}</span>
                    </div>
                    {isActive && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={resolve.isPending}
                        onClick={() => resolve.mutate(a.id)}
                      >
                        Marcar resuelta
                      </Button>
                    )}
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
