"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader, EmptyState } from "@/components/shared/layout";
import { Ticket, Copy, RefreshCw, Check, Users, Home } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type InviteData = {
  code: string;
  condominiumName?: string;
  expiresAt?: string;
  usedCount?: number;
  maxUses?: number;
};

export function InviteCodeView() {
  const qc = useQueryClient();
  const [copied, setCopied] = useState(false);

  const { data, isLoading } = useQuery<InviteData>({
    queryKey: ["invite"],
    queryFn: async () => {
      const r = await fetch("/api/condominium/invite");
      if (!r.ok) throw new Error("Error");
      return r.json();
    },
  });

  const regenerate = useMutation({
    mutationFn: async () => {
      const r = await fetch("/api/condominium/invite", { method: "POST" });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Error");
      return j;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["invite"] });
      toast.success("Código regenerado");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const copy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Código copiado");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("No se pudo copiar");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Código de Invitación"
        subtitle="Comparte este código para que los residentes se registren"
        icon={Ticket}
        actions={
          <Button
            variant="outline"
            className="gap-1.5"
            disabled={regenerate.isPending}
            onClick={() => regenerate.mutate()}
          >
            <RefreshCw className={cn("h-4 w-4", regenerate.isPending && "animate-spin")} />
            Regenerar
          </Button>
        }
      />

      {isLoading ? (
        <Card>
          <CardContent className="p-6 space-y-3">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-10 w-1/2" />
          </CardContent>
        </Card>
      ) : !data ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState
              icon={Ticket}
              title="Sin código activo"
              description="Genera un código de invitación para permitir el registro de residentes."
              actionLabel="Generar código"
              onAction={() => regenerate.mutate()}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Código activo</CardTitle>
              <CardDescription>
                {data.condominiumName
                  ? `Condominio: ${data.condominiumName}`
                  : "Comparte este código con los residentes"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={data.code}
                  className="font-mono text-lg font-bold tracking-wider text-center"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copy(data.code)}
                  title="Copiar"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="rounded-lg border p-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <Users className="h-3.5 w-3.5" /> Usos
                  </div>
                  <p className="font-semibold">
                    {data.usedCount ?? 0}
                    {data.maxUses ? ` / ${data.maxUses}` : ""}
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <Home className="h-3.5 w-3.5" /> Expira
                  </div>
                  <p className="font-semibold text-sm">
                    {data.expiresAt
                      ? new Date(data.expiresAt).toLocaleDateString("es-VE")
                      : "Sin expiración"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cómo usarlo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex gap-2">
                <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 shrink-0">1</Badge>
                <p>Comparte el código con tus residentes.</p>
              </div>
              <div className="flex gap-2">
                <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 shrink-0">2</Badge>
                <p>Ellos se registran en la app y seleccionan "Soy residente".</p>
              </div>
              <div className="flex gap-2">
                <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 shrink-0">3</Badge>
                <p>Indican su vivienda y el código de invitación.</p>
              </div>
              <div className="flex gap-2">
                <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 shrink-0">4</Badge>
                <p>Quedan vinculados a tu condominio automáticamente.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
