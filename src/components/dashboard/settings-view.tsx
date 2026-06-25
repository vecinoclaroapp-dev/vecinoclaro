"use client";

import { useCondominium, useBcvRate, useSyncBcv, useBcvHistory } from "@/hooks/use-api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatNumber, formatDate, formatUSD } from "@/lib/money";
import { Building2, Settings, RefreshCw, ShieldCheck, Database, User, Phone, MapPin, FileText, Wifi } from "lucide-react";
import { toast } from "sonner";

export function SettingsView() {
  const { data: condo, isLoading } = useCondominium();
  const { data: bcv } = useBcvRate();
  const { data: hist } = useBcvHistory(30);
  const sync = useSyncBcv();

  const handleSync = () => {
    toast.promise(sync.mutateAsync(), {
      loading: "Sincronizando BCV...",
      success: (res: { rate?: number }) => `Tasa: ${res.rate} Bs/USD`,
      error: (e: Error) => e.message,
    });
  };

  if (isLoading || !condo) {
    return <Skeleton className="h-96 rounded-xl" />;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Info del condominio */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-4 w-4 text-emerald-600" />
            Información del condominio
          </CardTitle>
          <CardDescription>Datos generales de la entidad administrada</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Nombre</Label>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{condo.name}</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">RIF</Label>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="font-mono font-medium">{condo.rif}</span>
            </div>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs text-muted-foreground">Dirección</Label>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm">{condo.address}</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Administrador</Label>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{condo.adminName ?? "—"}</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Teléfono</Label>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm tabular-nums">{condo.adminPhone ?? "—"}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Parámetros financieros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="h-4 w-4 text-emerald-600" />
            Parámetros financieros
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border p-4">
            <p className="text-xs text-muted-foreground uppercase">Cuota base</p>
            <p className="text-2xl font-bold tabular-nums text-usd mt-1">{formatUSD(condo.baseFeeUSD)}</p>
            <p className="text-xs text-muted-foreground">Mantenimiento mensual</p>
          </div>
          <div className="rounded-xl border p-4">
            <p className="text-xs text-muted-foreground uppercase">Fondo de reserva</p>
            <p className="text-2xl font-bold tabular-nums text-emerald-700 dark:text-emerald-400 mt-1">{formatUSD(condo.reserveFund)}</p>
            <p className="text-xs text-muted-foreground">Acumulado</p>
          </div>
          <div className="rounded-xl border p-4">
            <p className="text-xs text-muted-foreground uppercase">Viviendas activas</p>
            <p className="text-2xl font-bold tabular-nums mt-1">{condo.residencesCount}</p>
            <p className="text-xs text-muted-foreground">Unidades registradas</p>
          </div>
        </CardContent>
      </Card>

      {/* Configuración BCV */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-emerald-600" />
                Sincronización BCV
              </CardTitle>
              <CardDescription>Configuración de la tasa de cambio oficial</CardDescription>
            </div>
            <Button size="sm" variant="outline" onClick={handleSync} disabled={sync.isPending} className="gap-1.5">
              <RefreshCw className={`h-3.5 w-3.5 ${sync.isPending ? "animate-spin" : ""}`} />
              Sincronizar ahora
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border p-4">
              <p className="text-xs text-muted-foreground uppercase">Tasa vigente</p>
              <p className="text-2xl font-bold tabular-nums text-emerald-700 dark:text-emerald-400 mt-1">
                {formatNumber(bcv?.rate ?? 0)}
              </p>
              <p className="text-xs text-muted-foreground">Bs/USD</p>
            </div>
            <div className="rounded-xl border p-4">
              <p className="text-xs text-muted-foreground uppercase">Última actualización</p>
              <p className="text-sm font-semibold mt-1">{bcv?.date ? formatDate(bcv.date) : "—"}</p>
              <Badge variant="outline" className="mt-2">
                {bcv?.source ?? "—"}
              </Badge>
            </div>
            <div className="rounded-xl border p-4">
              <p className="text-xs text-muted-foreground uppercase">Historial disponible</p>
              <p className="text-2xl font-bold tabular-nums mt-1">{hist?.rates?.length ?? 0}</p>
              <p className="text-xs text-muted-foreground">días registrados</p>
            </div>
          </div>

          <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 p-3">
            <div className="flex items-start gap-2">
              <Wifi className="h-4 w-4 text-emerald-700 dark:text-emerald-400 mt-0.5 shrink-0" />
              <div className="text-xs text-muted-foreground">
                <p className="font-medium text-emerald-800 dark:text-emerald-300">Sincronización automática</p>
                <p className="mt-0.5">El sistema consulta el BCV automáticamente al cargar la aplicación y mediante el botón del topbar. Si no hay conexión, usa la última tasa conocida.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="h-4 w-4 text-emerald-600" />
            Sistema y seguridad
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <div>
                <p className="text-sm font-medium">Libro contable inmutable</p>
                <p className="text-xs text-muted-foreground">Hash chain SHA-256 activo</p>
              </div>
            </div>
            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900">
              Activo
            </Badge>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-emerald-600" />
              <div>
                <p className="text-sm font-medium">Contabilidad bimonetaria</p>
                <p className="text-xs text-muted-foreground">USD + VES con snapshot de tasa</p>
              </div>
            </div>
            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900">
              Activo
            </Badge>
          </div>
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-emerald-600" />
              <div>
                <p className="text-sm font-medium">Versión del sistema</p>
                <p className="text-xs text-muted-foreground">CondominioDigital VE 1.0.0</p>
              </div>
            </div>
            <Badge variant="outline">Producción</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
