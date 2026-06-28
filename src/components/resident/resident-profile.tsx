"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/layout";
import { useResidentMe, useLogout } from "@/hooks/use-resident";
import { User, Home, Mail, LogOut, Save } from "lucide-react";
import { toast } from "sonner";

export function ResidentProfile() {
  const { data: resident, isLoading } = useResidentMe();
  const logout = useLogout();

  const initials = (name?: string) =>
    (name ?? "?").split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mi Perfil"
        subtitle="Datos personales y de vivienda"
        icon={User}
      />

      <div className="grid gap-4 md:grid-cols-3">
        {/* Tarjeta de identificación */}
        <Card className="md:col-span-1">
          <CardContent className="p-6 flex flex-col items-center text-center">
            {isLoading ? (
              <Skeleton className="h-20 w-20 rounded-full" />
            ) : (
              <div className="h-20 w-20 mb-3 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-xl font-bold text-emerald-800 dark:text-emerald-300">
                {initials(resident?.name)}
              </div>
            )}
            <p className="font-semibold">{resident?.name ?? "—"}</p>
            <p className="text-sm text-muted-foreground">{resident?.email}</p>
            <div className="w-full space-y-2 text-sm mt-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Home className="h-3.5 w-3.5" /> Vivienda
                </span>
                <span className="font-medium">{resident?.residenceLabel ?? "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Código de pago</span>
                <span className="font-mono font-medium">{resident?.paymentCode ?? "—"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Editar datos */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Datos personales</CardTitle>
            <CardDescription>Actualiza tu nombre y teléfono</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <ProfileForm
                key={resident?.id ?? "new"}
                initialName={resident?.name ?? ""}
                initialPhone={resident?.phone ?? ""}
                email={resident?.email ?? ""}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Condominio info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Mi condominio</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-12 w-full" />
          ) : (
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center">
                <Home className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
              </div>
              <div>
                <p className="font-medium">{resident?.condominiumName ?? "—"}</p>
                <p className="text-xs text-muted-foreground">
                  {resident?.residenceLabel && `Vivienda ${resident.residenceLabel}`}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cerrar sesión */}
      <Card className="border-rose-200 dark:border-rose-900">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="font-medium text-sm">Cerrar sesión</p>
            <p className="text-xs text-muted-foreground">Salir de tu cuenta de residente</p>
          </div>
          <Button
            variant="outline"
            className="gap-1.5 text-rose-700 border-rose-200 hover:bg-rose-50 dark:text-rose-300 dark:border-rose-900 dark:hover:bg-rose-950/30"
            disabled={logout.isPending}
            onClick={() => logout.mutate()}
          >
            <LogOut className="h-4 w-4" />
            Salir
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function ProfileForm({
  initialName,
  initialPhone,
  email,
}: {
  initialName: string;
  initialPhone: string;
  email: string;
}) {
  const qc = useQueryClient();
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);

  const save = useMutation({
    mutationFn: async () => {
      const r = await fetch("/api/residents/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Error");
      return j;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["residents", "me"] });
      toast.success("Perfil actualizado");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="n">Nombre completo</Label>
        <Input id="n" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="p">Teléfono</Label>
        <Input
          id="p"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="0412-XXX-XXXX"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="e">Email</Label>
        <Input id="e" value={email} disabled />
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Mail className="h-3 w-3" /> El email no se puede cambiar
        </p>
      </div>
      <Button
        disabled={save.isPending || !name.trim()}
        onClick={() => save.mutate()}
        className="gap-1.5"
      >
        <Save className="h-4 w-4" />
        {save.isPending ? "Guardando..." : "Guardar cambios"}
      </Button>
    </div>
  );
}
