"use client";

import { useState } from "react";
import { useResidences, useUpdateResidence } from "@/hooks/use-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { OutstandingBadge } from "@/components/shared/badges";
import { RESIDENCE_TYPES } from "@/lib/constants";
import { formatUSD, formatVES, formatDate, formatInt } from "@/lib/money";
import { useAppStore } from "@/store/app-store";
import { Search, Home, Pencil, Phone, Mail, User, CreditCard, ArrowRight, Power, PowerOff, Info } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type FormState = {
  number: string;
  floor: string;
  type: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  residentName: string;
  active: boolean;
};

const empty: FormState = {
  number: "",
  floor: "",
  type: "APARTMENT",
  ownerName: "",
  ownerPhone: "",
  ownerEmail: "",
  residentName: "",
  active: true,
};

const typeLabels = Object.fromEntries(RESIDENCE_TYPES.map((t) => [t.value, t.label]));

export function ResidencesView() {
  const { data, isLoading } = useResidences(false);
  const update = useUpdateResidence();
  const { setView, setSelectedResidence, setPrefillPayment } = useAppStore();

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [search, setSearch] = useState("");
  const [showInactive, setShowInactive] = useState(false);

  const residences = data?.residences ?? [];
  const filtered = residences
    .filter((r) => showInactive || r.active)
    .filter(
      (r) =>
        r.number.toLowerCase().includes(search.toLowerCase()) ||
        r.ownerName.toLowerCase().includes(search.toLowerCase()),
    );

  const openEdit = (r: typeof residences[number]) => {
    setForm({
      number: r.number,
      floor: r.floor ?? "",
      type: r.type,
      ownerName: r.ownerName,
      ownerPhone: r.ownerPhone ?? "",
      ownerEmail: r.ownerEmail ?? "",
      residentName: r.residentName ?? "",
      active: r.active,
    });
    setEditingId(r.id);
    setOpen(true);
  };

  const submit = async () => {
    if (!form.number.trim() || !form.ownerName.trim()) {
      toast.error("Número y propietario son obligatorios");
      return;
    }
    try {
      await update.mutateAsync({ id: editingId!, data: form });
      toast.success("Vivienda actualizada");
      setOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al guardar");
    }
  };

  const toggleActive = async (r: typeof residences[number]) => {
    try {
      await update.mutateAsync({
        id: r.id,
        data: {
          number: r.number,
          floor: r.floor ?? "",
          type: r.type,
          ownerName: r.ownerName,
          ownerPhone: r.ownerPhone ?? "",
          ownerEmail: r.ownerEmail ?? "",
          residentName: r.residentName ?? "",
          active: !r.active,
        },
      });
      toast.success(r.active ? "Vivienda desactivada" : "Vivienda reactivada");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    }
  };

  const payFor = (r: typeof residences[number]) => {
    setSelectedResidence(r.id);
    setPrefillPayment({ residenceId: r.id });
    setView("payments");
  };

  const inactiveCount = residences.filter((r) => !r.active).length;

  return (
    <div className="space-y-5">
      {/* Info banner: las viviendas se crean cuando los residentes se unen */}
      <div className="flex items-start gap-3 rounded-xl border border-sky-200 dark:border-sky-900/50 bg-sky-50 dark:bg-sky-950/20 p-4">
        <div className="h-8 w-8 rounded-lg bg-sky-100 dark:bg-sky-950/50 flex items-center justify-center shrink-0">
          <Info className="h-4 w-4 text-sky-700 dark:text-sky-400" />
        </div>
        <div className="text-sm">
          <p className="font-semibold text-sky-900 dark:text-sky-300">Las viviendas se crean automáticamente</p>
          <p className="text-sky-700 dark:text-sky-400 text-xs mt-0.5">
            Cuando un residente usa tu <button onClick={() => setView("invite-code")} className="font-bold underline">código de invitación</button> y se une al condominio, su vivienda se crea sola. Aquí solo puedes editar y gestionar propiedades existentes.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div className="flex gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por número o propietario..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          {inactiveCount > 0 && (
            <Button
              variant={showInactive ? "default" : "outline"}
              size="sm"
              onClick={() => setShowInactive(!showInactive)}
              className="gap-1.5 shrink-0"
            >
              <PowerOff className="h-3.5 w-3.5" />
              {showInactive ? "Ver activas" : `Inactivas (${inactiveCount})`}
            </Button>
          )}
        </div>
      </div>

      {/* Tabla */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Home className="h-4 w-4 text-emerald-600" />
            {formatInt(filtered.length)} viviendas
            {showInactive && <span className="text-xs text-muted-foreground font-normal">(mostrando inactivas)</span>}
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
                    <th className="font-medium py-3 px-4">Vivienda</th>
                    <th className="font-medium py-3 px-4 hidden md:table-cell">Propietario</th>
                    <th className="font-medium py-3 px-4 hidden lg:table-cell">Contacto</th>
                    <th className="font-medium py-3 px-4 text-right">Saldo</th>
                    <th className="font-medium py-3 px-4 text-center hidden sm:table-cell">Estado</th>
                    <th className="font-medium py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-2">
                        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                          <div className="h-14 w-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center mb-3 ring-1 ring-emerald-100 dark:ring-emerald-900/40">
                            <Home className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <p className="text-sm font-medium">
                            {showInactive ? "No hay viviendas inactivas" : "Aún no hay viviendas registradas"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {showInactive
                              ? "Las viviendas desactivadas aparecerán aquí"
                              : "Comparte tu código de invitación para que los residentes se unan"}
                          </p>
                          {!showInactive && (
                            <Button variant="outline" size="sm" className="mt-3 gap-1.5" onClick={() => setView("invite-code")}>
                              Ver código de invitación <ArrowRight className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((r) => (
                      <tr key={r.id} className={cn("border-b last:border-0 hover:bg-muted/40 transition-colors", !r.active && "opacity-50")}>
                        <td className="py-3 px-4">
                          <div className="font-bold">{r.number}</div>
                          <div className="text-xs text-muted-foreground">
                            {typeLabels[r.type as keyof typeof typeLabels] ?? r.type}
                            {r.floor ? ` · Piso ${r.floor}` : ""}
                            {!r.active && <span className="ml-1 text-rose-600 font-medium">· Inactiva</span>}
                          </div>
                        </td>
                        <td className="py-3 px-4 hidden md:table-cell">
                          <div className="font-medium">{r.ownerName}</div>
                          {r.residentName && r.residentName !== r.ownerName && (
                            <div className="text-xs text-muted-foreground">Inq: {r.residentName}</div>
                          )}
                        </td>
                        <td className="py-3 px-4 hidden lg:table-cell">
                          {r.ownerPhone && <div className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" />{r.ownerPhone}</div>}
                          {r.ownerEmail && <div className="text-xs text-muted-foreground flex items-center gap-1 truncate max-w-[180px]"><Mail className="h-3 w-3 shrink-0" />{r.ownerEmail}</div>}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className={cn("font-bold tabular-nums", r.outstandingUSD > 0 ? "text-rose-600 dark:text-rose-400" : r.outstandingUSD < 0 ? "text-sky-600 dark:text-sky-400" : "text-emerald-600 dark:text-emerald-400")}>
                            {formatUSD(r.outstandingUSD)}
                          </div>
                          <div className="text-xs text-muted-foreground tabular-nums">{formatVES(r.outstandingVES)}</div>
                        </td>
                        <td className="py-3 px-4 text-center hidden sm:table-cell">
                          <OutstandingBadge amount={r.outstandingUSD} />
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-1">
                            {r.active ? (
                              <Button variant="ghost" size="sm" className="h-8 gap-1 text-emerald-700 dark:text-emerald-400" onClick={() => payFor(r)}>
                                <CreditCard className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Pagar</span>
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 gap-1 text-emerald-700 dark:text-emerald-400"
                                onClick={() => toggleActive(r)}
                                disabled={update.isPending}
                              >
                                <Power className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Reactivar</span>
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(r)} aria-label="Editar">
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            {r.active && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-rose-600"
                                onClick={() => toggleActive(r)}
                                disabled={update.isPending}
                                aria-label="Desactivar"
                              >
                                <PowerOff className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de edición (sin crear nueva) */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar vivienda</DialogTitle>
            <DialogDescription>
              Modifica los datos del propietario de esta vivienda.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="number">Número / Código</Label>
                <Input id="number" placeholder="12-A" value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="floor">Piso / Nivel</Label>
                <Input id="floor" placeholder="PH, 1, 2..." value={form.floor} onChange={(e) => setForm({ ...form, floor: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="type">Tipo</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger id="type"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {RESIDENCE_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="owner">Propietario</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="owner" className="pl-9" placeholder="Nombre completo" value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="phone">Teléfono</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="phone" className="pl-9" placeholder="+58 412-..." value={form.ownerPhone} onChange={(e) => setForm({ ...form, ownerPhone: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Correo</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="email" className="pl-9" placeholder="propietario@..." value={form.ownerEmail} onChange={(e) => setForm({ ...form, ownerEmail: e.target.value })} />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={submit} disabled={update.isPending}>Guardar cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
