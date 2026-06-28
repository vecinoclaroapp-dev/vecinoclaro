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
import { Progress } from "@/components/ui/progress";
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
import { HardHat, Plus, Calendar, DollarSign, Loader2, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatUSD } from "@/lib/money";

type Work = {
  id: string;
  title: string;
  description?: string;
  status: "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  budget?: number;
  spent?: number;
  contractor?: string;
  startDate?: string;
  endDate?: string;
  progress?: number;
};

const statusConfig = {
  PLANNED: { label: "Planificada", Icon: Clock, cls: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300" },
  IN_PROGRESS: { label: "En obra", Icon: Loader2, cls: "bg-sky-100 text-sky-800 dark:bg-sky-950/50 dark:text-sky-300" },
  COMPLETED: { label: "Completada", Icon: CheckCircle2, cls: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300" },
  CANCELLED: { label: "Cancelada", Icon: Clock, cls: "bg-slate-100 text-slate-700 dark:bg-slate-900/50 dark:text-slate-400" },
} as const;

export function WorksView() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    budget: "",
    contractor: "",
    status: "PLANNED",
  });

  const { data, isLoading } = useQuery<Work[]>({
    queryKey: ["works"],
    queryFn: async () => {
      const r = await fetch("/api/works");
      if (!r.ok) throw new Error("Error");
      return r.json();
    },
  });

  const create = useMutation({
    mutationFn: async (body: typeof form) => {
      const r = await fetch("/api/works", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...body,
          budget: body.budget ? Number(body.budget) : null,
        }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Error");
      return j;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["works"] });
      toast.success("Obra creada");
      setOpen(false);
      setForm({ title: "", description: "", budget: "", contractor: "", status: "PLANNED" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const works = data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Obras"
        subtitle="Gestión de obras y mejoras del condominio"
        icon={HardHat}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-1.5">
                <Plus className="h-4 w-4" /> Nueva obra
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nueva obra</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="t">Título</Label>
                  <Input id="t" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="b">Presupuesto (USD)</Label>
                    <Input id="b" type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Estado</Label>
                    <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PLANNED">Planificada</SelectItem>
                        <SelectItem value="IN_PROGRESS">En obra</SelectItem>
                        <SelectItem value="COMPLETED">Completada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="c">Contratista</Label>
                  <Input id="c" value={form.contractor} onChange={(e) => setForm({ ...form, contractor: e.target.value })} />
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
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader><Skeleton className="h-5 w-2/3" /></CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-2 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : works.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState
              icon={HardHat}
              title="No hay obras registradas"
              description="Registra obras de mejora, mantenimiento mayor o remodelaciones."
              actionLabel="Nueva obra"
              onAction={() => setOpen(true)}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {works.map((w) => {
            const cfg = statusConfig[w.status] ?? statusConfig.PLANNED;
            const Icon = cfg.Icon;
            const pct = w.progress ?? (w.status === "COMPLETED" ? 100 : 0);
            return (
              <Card key={w.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <HardHat className="h-4 w-4 text-amber-600" />
                      {w.title}
                    </CardTitle>
                    <Badge className={cn("gap-1", cfg.cls)}>
                      <Icon className="h-3 w-3" /> {cfg.label}
                    </Badge>
                  </div>
                  {w.contractor && (
                    <p className="text-xs text-muted-foreground">Contratista: {w.contractor}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  {w.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{w.description}</p>
                  )}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Progreso</span>
                      <span className="font-medium tabular-nums">{pct}%</span>
                    </div>
                    <Progress value={pct} className="h-2" />
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t text-sm">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <DollarSign className="h-3.5 w-3.5" />
                      {w.spent ? formatUSD(w.spent) : "USD 0,00"}
                      {w.budget && <span className="text-xs"> / {formatUSD(w.budget)}</span>}
                    </div>
                    {w.startDate && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(w.startDate).toLocaleDateString("es-VE")}
                      </span>
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
