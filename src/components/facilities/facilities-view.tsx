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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PageHeader, EmptyState } from "@/components/shared/layout";
import { Building2, Plus, Calendar, Clock, Users, MapPin } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Facility = {
  id: string;
  name: string;
  description?: string;
  capacity?: number;
  location?: string;
  hourlyRate?: number;
  available: boolean;
  reservations?: { id: string; start: string; end: string; residentLabel?: string }[];
};

export function FacilitiesView() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", capacity: "", location: "" });

  const { data, isLoading } = useQuery<Facility[]>({
    queryKey: ["facilities"],
    queryFn: async () => {
      const r = await fetch("/api/facilities");
      if (!r.ok) throw new Error("Error");
      return r.json();
    },
  });

  const create = useMutation({
    mutationFn: async (body: typeof form) => {
      const r = await fetch("/api/facilities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: body.name,
          description: body.description,
          capacity: body.capacity ? Number(body.capacity) : null,
          location: body.location,
        }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Error");
      return j;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["facilities"] });
      toast.success("Área común creada");
      setOpen(false);
      setForm({ name: "", description: "", capacity: "", location: "" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const items = data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Áreas Comunes"
        subtitle="Gestión y reservas de instalaciones"
        icon={Building2}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-1.5">
                <Plus className="h-4 w-4" /> Nueva área
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nueva área común</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="n">Nombre</Label>
                  <Input id="n" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="l">Ubicación</Label>
                  <Input id="l" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="c">Capacidad</Label>
                  <Input id="c" type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="d">Descripción</Label>
                  <Textarea id="d" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button disabled={create.isPending || !form.name.trim()} onClick={() => create.mutate(form)}>
                  {create.isPending ? "Guardando..." : "Crear"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader><Skeleton className="h-5 w-2/3" /></CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState
              icon={Building2}
              title="No hay áreas comunes"
              description="Registra áreas comunes como salón social, gym, BBQ, piscina."
              actionLabel="Nueva área"
              onAction={() => setOpen(true)}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((f) => (
            <Card key={f.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{f.name}</CardTitle>
                  <Badge
                    className={cn(
                      f.available
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                        : "bg-slate-100 text-slate-700 dark:bg-slate-900/50 dark:text-slate-400"
                    )}
                  >
                    {f.available ? "Disponible" : "No disponible"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {f.description && (
                  <p className="text-muted-foreground line-clamp-2">{f.description}</p>
                )}
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  {f.capacity && (
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" /> {f.capacity} personas
                    </span>
                  )}
                  {f.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {f.location}
                    </span>
                  )}
                </div>
                {f.reservations && f.reservations.length > 0 && (
                  <div className="pt-2 border-t space-y-1">
                    {f.reservations.slice(0, 2).map((r) => (
                      <div key={r.id} className="flex items-center gap-1.5 text-xs">
                        <Calendar className="h-3 w-3 text-emerald-600" />
                        {new Date(r.start).toLocaleDateString("es-VE")}
                        {r.residentLabel && <span className="text-muted-foreground">· {r.residentLabel}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
