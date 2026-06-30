"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { Users, Plus, Mail, Shield, User, Crown, Wrench } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "STAFF" | "VIEWER";
  status?: "ACTIVE" | "INVITED" | "DISABLED";
  lastActiveAt?: string;
};

const roleConfig = {
  ADMIN: { label: "Administrador", Icon: Crown, cls: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300" },
  STAFF: { label: "Personal", Icon: Wrench, cls: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300" },
  VIEWER: { label: "Solo lectura", Icon: User, cls: "bg-sky-100 text-sky-800 dark:bg-sky-950/50 dark:text-sky-300" },
} as const;

const statusConfig = {
  ACTIVE: { label: "Activo", cls: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300" },
  INVITED: { label: "Invitado", cls: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300" },
  DISABLED: { label: "Deshabilitado", cls: "bg-slate-100 text-slate-700 dark:bg-slate-900/50 dark:text-slate-400" },
} as const;

export function TeamView() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "STAFF" });

  const { data, isLoading } = useQuery<TeamMember[]>({
    queryKey: ["team"],
    queryFn: async () => {
      const r = await fetch("/api/team");
      if (!r.ok) throw new Error("Error");
      return r.json();
    },
  });

  const invite = useMutation({
    mutationFn: async (body: typeof form) => {
      const r = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Error");
      return j;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["team"] });
      toast.success("Invitación enviada");
      setOpen(false);
      setForm({ name: "", email: "", role: "STAFF" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const members = data ?? [];
  const initials = (name: string) =>
    name.split(" ").filter(Boolean).map((s) => s[0] || "").slice(0, 2).join("").toUpperCase() || "?"};

  return (
    <div className="space-y-6">
      <PageHeader
        title="Equipo"
        subtitle="Gestiona miembros del equipo administrativo"
        icon={Users}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-1.5">
                <Plus className="h-4 w-4" /> Invitar miembro
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invitar miembro</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="n">Nombre</Label>
                  <Input id="n" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="e">Email</Label>
                  <Input id="e" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Rol</Label>
                  <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">Administrador</SelectItem>
                      <SelectItem value="STAFF">Personal</SelectItem>
                      <SelectItem value="VIEWER">Solo lectura</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button disabled={invite.isPending || !form.email.trim()} onClick={() => invite.mutate(form)}>
                  {invite.isPending ? "Enviando..." : "Enviar invitación"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : members.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState
              icon={Users}
              title="No hay miembros del equipo"
              description="Invita a otros administradores o miembros del personal del condominio."
              actionLabel="Invitar miembro"
              onAction={() => setOpen(true)}
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {members.map((m) => {
                const role = roleConfig[m.role] ?? roleConfig.VIEWER;
                const RoleIcon = role.Icon;
                const status = statusConfig[m.status ?? "ACTIVE"] ?? statusConfig.ACTIVE;
                return (
                  <div key={m.id} className="flex items-center gap-3 p-4 hover:bg-muted/40">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback className={cn("text-xs font-medium", role.cls)}>
                        {initials(m.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sm truncate">{m.name}</p>
                        <Badge className={cn("gap-1", role.cls)}>
                          <RoleIcon className="h-3 w-3" /> {role.label}
                        </Badge>
                        <Badge className={cn(status.cls)}>{status.label}</Badge>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {m.email}
                        {m.lastActiveAt && (
                          <span>· Última actividad: {new Date(m.lastActiveAt).toLocaleDateString("es-VE")}</span>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" title="Configuración">
                      <Shield className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
