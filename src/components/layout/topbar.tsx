"use client";

import { useState } from "react";
import { useAppStore, type View } from "@/store/app-store";
import { useBcvRate, useSyncBcv } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Menu, RefreshCw, TrendingUp, Calendar, CheckCircle2, AlertTriangle, Pencil } from "lucide-react";
import { formatRate, formatDate, formatNumber } from "@/lib/money";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const VIEW_TITLES: Record<View, { title: string; subtitle: string }> = {
  dashboard: { title: "Panel General", subtitle: "Resumen bimonetario del condominio" },
  residences: { title: "Viviendas", subtitle: "Propiedades, propietarios y saldos" },
  payments: { title: "Pagos", subtitle: "Registro, comprobantes y cuentas bancarias" },
  receipts: { title: "Pagos", subtitle: "Registro, comprobantes y cuentas bancarias" },
  "payment-references": { title: "Pagos", subtitle: "Registro, comprobantes y cuentas bancarias" },
  ledger: { title: "Libro Contable", subtitle: "Historial inmutable con hash chain SHA-256" },
  services: { title: "Servicios Críticos", subtitle: "Cargos extraordinarios y contingencias" },
  invoices: { title: "Facturas", subtitle: "Mantenimiento mensual y estados de cuenta" },
  expenses: { title: "Gastos y Proveedores", subtitle: "Egresos, cuentas por pagar y comprobantes" },
  budget: { title: "Presupuesto", subtitle: "Presupuestado vs. real" },
  funds: { title: "Fondos", subtitle: "Ordinario, reserva, extraordinario" },
  reports: { title: "Reportes", subtitle: "Estadísticas y exportación de datos" },
  polls: { title: "Votaciones", subtitle: "Votaciones con peso por indiviso" },
  announcements: { title: "Avisos y Morosos", subtitle: "Cartelera digital y morosidad" },
  requests: { title: "Solicitudes", subtitle: "Help-desk de residentes" },
  facilities: { title: "Áreas Comunes", subtitle: "Reservas de instalaciones" },
  calendar: { title: "Calendario", subtitle: "Eventos y asambleas" },
  messages: { title: "Mensajes", subtitle: "Chat interno del condominio" },
  marketplace: { title: "Marketplace", subtitle: "Compra-venta entre vecinos" },
  documents: { title: "Documentos", subtitle: "Actas, manuales y documentos" },
  works: { title: "Obras", subtitle: "Proyectos y mantenimiento" },
  directory: { title: "Directorio", subtitle: "Vecinos y contactos" },
  visitors: { title: "Visitantes", subtitle: "Control de check-in/out" },
  vehicles: { title: "Vehículos", subtitle: "Placas y permisos" },
  alerts: { title: "Alertas", subtitle: "Incidencias y novedades" },
  "access-log": { title: "Bitácora", subtitle: "Registro de accesos" },
  "invite-code": { title: "Código de Invitación", subtitle: "Para que residentes se unan" },
  team: { title: "Equipo", subtitle: "Roles y permisos" },
  "module-config": { title: "Módulos", subtitle: "Activar o desactivar funciones" },
  settings: { title: "Ajustes", subtitle: "Configuración del condominio" },
};

export function Topbar() {
  const { view, setSidebarOpen } = useAppStore();
  const { data: bcv, isLoading } = useBcvRate();
  const sync = useSyncBcv();
  const [manualRate, setManualRate] = useState("");
  const [popoverOpen, setPopoverOpen] = useState(false);

  const t = VIEW_TITLES[view] ?? VIEW_TITLES.dashboard;

  const handleSync = async () => {
    try {
      const res = await sync.mutateAsync();
      if (res.isFallback) {
        // Mostrar popover de tasa manual automáticamente
        setPopoverOpen(true);
        toast.warning("No se pudo conectar con DolarApi. Ingresa la tasa manualmente.");
      } else {
        toast.success(`Tasa BCV actualizada: ${res.rate} Bs/USD`);
      }
    } catch (e) {
      setPopoverOpen(true);
      toast.error("Error de sincronización. Ingresa la tasa manualmente.");
    }
  };

  const submitManual = async () => {
    const rate = Number(manualRate);
    if (!rate || rate <= 0) {
      toast.error("Ingresa una tasa válida");
      return;
    }
    try {
      const res = await fetch("/api/bcv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ manualRate: rate }),
      });
      const j = await res.json();
      if (!j.ok) throw new Error(j.error);
      toast.success(`Tasa manual guardada: ${rate} Bs/USD`);
      setManualRate("");
      setPopoverOpen(false);
      // Refrescar
      window.location.reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al guardar");
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75 border-b border-border">
      <div className="flex items-center gap-3 px-4 lg:px-6 h-16">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden h-9 w-9"
          onClick={() => setSidebarOpen(true)}
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="min-w-0 flex-1">
          <h1 className="text-lg lg:text-xl font-bold leading-tight truncate">{t.title}</h1>
          <p className="text-xs text-muted-foreground leading-tight truncate hidden sm:block">{t.subtitle}</p>
        </div>

        {/* Widget BCV — Tasa del día + Sincronizar + Popover manual */}
        <div className="flex items-center gap-2 lg:gap-3">
          <div className="hidden md:flex flex-col items-end leading-tight">
            {isLoading ? (
              <Skeleton className="h-4 w-28" />
            ) : bcv?.rate ? (
              <>
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="font-bold tabular-nums text-sm text-emerald-700 dark:text-emerald-400">
                    Tasa BCV: {formatNumber(bcv.rate)} VES
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Calendar className="h-2.5 w-2.5" />
                  {formatDate(bcv.date)}
                  {bcv.isToday ? (
                    <Badge variant="outline" className="h-3.5 px-1 text-[9px] gap-0.5 ml-1 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900">
                      <CheckCircle2 className="h-2 w-2" /> Actualizado
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="h-3.5 px-1 text-[9px] ml-1 bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900">
                      <AlertTriangle className="h-2 w-2 mr-0.5" /> Desactualizado
                    </Badge>
                  )}
                </div>
              </>
            ) : (
              <span className="text-xs text-muted-foreground">Sin tasa</span>
            )}
          </div>

          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={handleSync}
                disabled={sync.isPending}
                className="gap-1.5"
              >
                <RefreshCw className={cn("h-3.5 w-3.5", sync.isPending && "animate-spin")} />
                <span className="hidden sm:inline">Sincronizar</span>
                <span className="sm:hidden">BCV</span>
              </Button>
              <PopoverTrigger asChild>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0" aria-label="Editar tasa manual">
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </PopoverTrigger>
            </div>

            <PopoverContent className="w-80" align="end">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold">Tasa manual BCV</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Si la sincronización falló o quieres forzar un valor, ingrésalo aquí:
                    </p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="manual-rate" className="text-xs">Tasa (Bs/USD)</Label>
                  <Input
                    id="manual-rate"
                    type="number"
                    step="0.01"
                    placeholder="621.53"
                    value={manualRate}
                    onChange={(e) => setManualRate(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submitManual()}
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Esta tasa se aplicará a todas las conversiones USD/VES.
                  </p>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button size="sm" variant="outline" onClick={() => setPopoverOpen(false)}>Cancelar</Button>
                  <Button size="sm" onClick={submitManual}>Guardar tasa</Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  );
}
