"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { PageHeader, EmptyState } from "@/components/shared/layout";
import {
  LayoutGrid,
  CreditCard,
  Users,
  Calendar,
  MessageSquare,
  ShoppingBag,
  FileText,
  Shield,
  HardHat,
  Vote,
  Megaphone,
  LifeBuoy,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type ModuleDef = {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: LucideIcon;
  enabled: boolean;
  premium?: boolean;
};

const MODULES: Omit<ModuleDef, "enabled">[] = [
  { key: "payments", name: "Pagos", description: "Registro y seguimiento de pagos bimonetarios", icon: CreditCard },
  { key: "announcements", name: "Avisos", description: "Comunicados y estado de morosos", icon: Megaphone },
  { key: "polls", name: "Votaciones", description: "Votaciones con peso indiviso", icon: Vote },
  { key: "requests", name: "Solicitudes", description: "Help desk de residentes", icon: LifeBuoy },
  { key: "facilities", name: "Áreas comunes", description: "Reservas de instalaciones", icon: LayoutGrid, premium: true },
  { key: "calendar", name: "Calendario", description: "Eventos y reuniones", icon: Calendar },
  { key: "messages", name: "Mensajes", description: "Mensajería entre residentes", icon: MessageSquare, premium: true },
  { key: "marketplace", name: "Marketplace", description: "Compraventa entre residentes", icon: ShoppingBag, premium: true },
  { key: "documents", name: "Documentos", description: "Actas y estados financieros", icon: FileText },
  { key: "works", name: "Obras", description: "Gestión de obras y mejoras", icon: HardHat },
  { key: "directory", name: "Directorio", description: "Residentes y personal", icon: Users },
  { key: "security", name: "Seguridad", description: "Visitantes, vehículos y alertas", icon: Shield, premium: true },
];

export function ModuleConfigView() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery<Record<string, boolean>>({
    queryKey: ["modules"],
    queryFn: async () => {
      const r = await fetch("/api/modules");
      if (!r.ok) throw new Error("Error");
      return r.json();
    },
  });

  const toggle = useMutation({
    mutationFn: async ({ key, enabled }: { key: string; enabled: boolean }) => {
      const r = await fetch(`/api/modules/${key}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Error");
      return j;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["modules"] });
      toast.success("Módulo actualizado");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const enabledMap = data ?? {};
  const enabledCount = MODULES.filter((m) => enabledMap[m.key]).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Módulos"
        subtitle={`${enabledCount} de ${MODULES.length} módulos activos`}
        icon={LayoutGrid}
        actions={
          <Button variant="outline" className="gap-1.5" onClick={() => toast.info("Cambios guardados automáticamente")}>
            <Save className="h-4 w-4" /> Guardar
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : MODULES.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState icon={LayoutGrid} title="Sin módulos" description="No hay módulos disponibles." />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((m) => {
            const Icon = m.icon;
            const isEnabled = !!enabledMap[m.key];
            return (
              <Card key={m.key} className={cn("transition", isEnabled && "ring-1 ring-emerald-200 dark:ring-emerald-900")}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className={cn(
                      "h-10 w-10 rounded-lg flex items-center justify-center",
                      isEnabled
                        ? "bg-emerald-100 dark:bg-emerald-950/50"
                        : "bg-slate-100 dark:bg-slate-900/50"
                    )}>
                      <Icon className={cn(
                        "h-5 w-5",
                        isEnabled ? "text-emerald-700 dark:text-emerald-400" : "text-slate-500"
                      )} />
                    </div>
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={(checked) => toggle.mutate({ key: m.key, enabled: checked })}
                      disabled={toggle.isPending}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{m.name}</p>
                      {m.premium && (
                        <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300">
                          Premium
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{m.description}</p>
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
