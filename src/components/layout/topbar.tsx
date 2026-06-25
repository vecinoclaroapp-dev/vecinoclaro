"use client";

import { useAppStore, type View } from "@/store/app-store";
import { useBcvRate, useSyncBcv } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Menu, RefreshCw, TrendingUp, Calendar, CheckCircle2 } from "lucide-react";
import { formatRate, formatDate } from "@/lib/money";
import { toast } from "sonner";

const VIEW_TITLES: Record<View, { title: string; subtitle: string }> = {
  dashboard: { title: "Panel General", subtitle: "Resumen bimonetario del condominio" },
  residences: { title: "Viviendas", subtitle: "Propiedades, propietarios y saldos" },
  payments: { title: "Pagos", subtitle: "Registro y consulta de pagos recibidos" },
  ledger: { title: "Libro Contable", subtitle: "Historial inmutable con hash chain SHA-256" },
  services: { title: "Servicios Críticos", subtitle: "Cargos extraordinarios y contingencias" },
  invoices: { title: "Facturas", subtitle: "Mantenimiento mensual y estados de cuenta" },
  reports: { title: "Reportes", subtitle: "Estadísticas y exportación de datos" },
  settings: { title: "Ajustes", subtitle: "Configuración del condominio" },
};

export function Topbar() {
  const { view, setSidebarOpen } = useAppStore();
  const { data: bcv, isLoading } = useBcvRate();
  const sync = useSyncBcv();

  const t = VIEW_TITLES[view];

  const handleSync = () => {
    toast.promise(sync.mutateAsync(), {
      loading: "Sincronizando con BCV...",
      success: (res: { rate?: number; source?: string; message?: string }) =>
        res.message
          ? `Tasa: ${res.rate} Bs/USD (${res.source})`
          : `Tasa actualizada: ${res.rate} Bs/USD`,
      error: (e: Error) => `Error: ${e.message}`,
    });
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

        {/* Widget BCV */}
        <div className="flex items-center gap-2 lg:gap-3">
          <div className="hidden md:flex flex-col items-end leading-tight">
            {isLoading ? (
              <Skeleton className="h-4 w-28" />
            ) : bcv?.rate ? (
              <>
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="font-bold tabular-nums text-sm text-emerald-700 dark:text-emerald-400">
                    {formatRate(bcv.rate)}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Calendar className="h-2.5 w-2.5" />
                  {formatDate(bcv.date)}
                  {bcv.isToday ? (
                    <Badge variant="outline" className="h-3.5 px-1 text-[9px] gap-0.5 ml-1 bg-emerald-50 text-emerald-700 border-emerald-200">
                      <CheckCircle2 className="h-2 w-2" /> Hoy
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="h-3.5 px-1 text-[9px] ml-1 bg-amber-50 text-amber-700 border-amber-200">
                      Desactualizado
                    </Badge>
                  )}
                </div>
              </>
            ) : (
              <span className="text-xs text-muted-foreground">Sin tasa</span>
            )}
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={handleSync}
            disabled={sync.isPending}
            className="gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${sync.isPending ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Sincronizar BCV</span>
            <span className="sm:hidden">BCV</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
