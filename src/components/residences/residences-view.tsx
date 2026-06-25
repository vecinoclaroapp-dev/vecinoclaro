"use client";

import { useState } from "react";
import { useResidences, useCreateResidence, useUpdateResidence, useDeleteResidence } from "@/hooks/use-api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { OutstandingBadge } from "@/components/shared/badges";
import { RESIDENCE_TYPES } from "@/lib/constants";
import { formatUSD, formatVES, formatDate, formatInt } from "@/lib/money";
import { useAppStore } from "@/store/app-store";
import { Plus, Search, Home, Pencil, Trash2, Phone, Mail, User, Building, CreditCard, ArrowRight } from "lucide-react";
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
  const create = useCreateResidence();
  const update = useUpdateResidence();
  const del = useDeleteResidence();
  const { setView, setSelectedResidence, setPrefillPayment } = useAppStore();

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const residences = data?.residences ?? [];
  const filtered = residences.filter(
    (r) =>
      r.number.toLowerCase().includes(search.toLowerCase()) ||
      r.ownerName.toLowerCase().includes(search.toLowerCase()),
  );

  const openCreate = () => {
    setForm(empty);
    setEditingId(null);
    setOpen(true);
  };

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
      if (editingId) {
        await update.mutateAsync({ id: editingId, data: form });
        toast.success("Vivienda actualizada");
      } else {
        await create.mutateAsync(form);
        toast.success("Vivienda creada");
      }
      setOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al guardar");
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await del.mutateAsync(deleteId);
      toast.success("Vivienda desactivada");
      setDeleteId(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al desactivar");
    }
  };

  const payFor = (r: typeof residences[number]) => {
    setSelectedResidence(r.id);
    setPrefillPayment({ residenceId: r.id });
    setView("payments");
  };

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por número o propietario..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate} className="gap-1.5">
              <Plus className="h-4 w-4" /> Nueva vivienda
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar vivienda" : "Nueva vivienda"}</DialogTitle>
              <DialogDescription>
                {editingId ? "Modifique los datos del propietario." : "Registre una nueva unidad del condominio."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="number">Número / Código *</Label>
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
                <Label htmlFor="owner">Propietario *</Label>
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
              <Button onClick={submit} disabled={create.isPending || update.isPending}>
                {editingId ? "Guardar cambios" : "Crear vivienda"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabla */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Home className="h-4 w-4 text-emerald-600" />
            {formatInt(filtered.length)} viviendas
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
                    <tr><td colSpan={6} className="py-12 text-center text-muted-foreground">No hay viviendas que coincidan</td></tr>
                  ) : (
                    filtered.map((r) => (
                      <tr key={r.id} className={cn("border-b last:border-0 hover:bg-muted/40 transition-colors", !r.active && "opacity-50")}>
                        <td className="py-3 px-4">
                          <div className="font-bold">{r.number}</div>
                          <div className="text-xs text-muted-foreground">
                            {typeLabels[r.type as keyof typeof typeLabels] ?? r.type}
                            {r.floor ? ` · Piso ${r.floor}` : ""}
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
                            <Button variant="ghost" size="sm" className="h-8 gap-1 text-emerald-700 dark:text-emerald-400" onClick={() => payFor(r)}>
                              <CreditCard className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">Pagar</span>
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(r)} aria-label="Editar">
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-600" onClick={() => setDeleteId(r.id)} aria-label="Desactivar">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
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

      {/* Confirmación de borrado */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Desactivar vivienda?</AlertDialogTitle>
            <AlertDialogDescription>
              La vivienda se marcará como inactiva. Se conservarán todos sus registros contables e históricos. Esta acción es reversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-rose-600 hover:bg-rose-700">
              Desactivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
