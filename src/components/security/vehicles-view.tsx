"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Car, Plus, User, Home, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Vehicle = {
  id: string;
  plate: string;
  brand?: string;
  model?: string;
  color?: string;
  ownerName?: string;
  residenceLabel?: string;
  type?: "RESIDENT" | "VISITOR";
  status?: "ACTIVE" | "INACTIVE";
  createdAt: string;
};

export function VehiclesView() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ plate: "", brand: "", model: "", color: "", ownerName: "", residenceLabel: "" });

  const { data, isLoading } = useQuery<Vehicle[]>({
    queryKey: ["vehicles"],
    queryFn: async () => {
      const r = await fetch("/api/vehicles");
      if (!r.ok) throw new Error("Error");
      return r.json();
    },
  });

  const create = useMutation({
    mutationFn: async (body: typeof form) => {
      const r = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, type: "RESIDENT" }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Error");
      return j;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success("Vehículo registrado");
      setOpen(false);
      setForm({ plate: "", brand: "", model: "", color: "", ownerName: "", residenceLabel: "" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const vehicles = data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vehículos"
        subtitle="Registro de vehículos de residentes"
        icon={Car}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-1.5">
                <Plus className="h-4 w-4" /> Registrar vehículo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar vehículo</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="pl">Placa</Label>
                    <Input id="pl" placeholder="ABC123" value={form.plate} onChange={(e) => setForm({ ...form, plate: e.target.value.toUpperCase() })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="c">Color</Label>
                    <Input id="c" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="b">Marca</Label>
                    <Input id="b" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="m">Modelo</Label>
                    <Input id="m" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="o">Propietario</Label>
                    <Input id="o" value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="r">Vivienda</Label>
                    <Input id="r" value={form.residenceLabel} onChange={(e) => setForm({ ...form, residenceLabel: e.target.value })} />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button disabled={create.isPending || !form.plate.trim()} onClick={() => create.mutate(form)}>
                  {create.isPending ? "Guardando..." : "Registrar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : vehicles.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState
              icon={Car}
              title="No hay vehículos registrados"
              description="Registra los vehículos de los residentes para control de acceso."
              actionLabel="Registrar vehículo"
              onAction={() => setOpen(true)}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((v) => (
            <Card key={v.id}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center">
                      <Car className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-mono font-bold text-sm tracking-wider">{v.plate}</p>
                      <p className="text-xs text-muted-foreground">
                        {[v.brand, v.model].filter(Boolean).join(" ") || "Vehículo"}
                      </p>
                    </div>
                  </div>
                  <Badge
                    className={cn(
                      v.status === "INACTIVE"
                        ? "bg-slate-100 text-slate-700 dark:bg-slate-900/50 dark:text-slate-400"
                        : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                    )}
                  >
                    {v.status === "INACTIVE" ? <Clock className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                    {v.status === "INACTIVE" ? "Inactivo" : "Activo"}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground pt-2 border-t">
                  {v.color && <span>Color: {v.color}</span>}
                  {v.ownerName && (
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" /> {v.ownerName}
                    </span>
                  )}
                  {v.residenceLabel && (
                    <span className="flex items-center gap-1">
                      <Home className="h-3 w-3" /> {v.residenceLabel}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
