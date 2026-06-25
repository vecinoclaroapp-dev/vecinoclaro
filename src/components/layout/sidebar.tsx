"use client";

import { useAppStore, type View } from "@/store/app-store";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Home,
  CreditCard,
  BookOpen,
  Zap,
  FileText,
  BarChart3,
  Settings,
  Building2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCondominium } from "@/hooks/use-api";

const NAV_ITEMS: { view: View; label: string; icon: React.ComponentType<{ className?: string }>; description: string }[] = [
  { view: "dashboard", label: "Panel", icon: LayoutDashboard, description: "Resumen general" },
  { view: "residences", label: "Viviendas", icon: Home, description: "Propiedades y saldos" },
  { view: "payments", label: "Pagos", icon: CreditCard, description: "Registro y consulta" },
  { view: "ledger", label: "Libro Contable", icon: BookOpen, description: "Historial inmutable" },
  { view: "services", label: "Servicios Críticos", icon: Zap, description: "Cargos extraordinarios" },
  { view: "invoices", label: "Facturas", icon: FileText, description: "Mantenimiento mensual" },
  { view: "reports", label: "Reportes", icon: BarChart3, description: "Estadísticas y exportes" },
  { view: "settings", label: "Ajustes", icon: Settings, description: "Configuración" },
];

export function Sidebar() {
  const { view, setView, sidebarOpen, setSidebarOpen } = useAppStore();
  const { data: condo } = useCondominium();

  return (
    <>
      {/* Overlay móvil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          "fixed lg:sticky top-0 z-50 lg:z-auto h-screen w-72 shrink-0",
          "bg-sidebar border-r border-sidebar-border flex flex-col",
          "transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Brand */}
        <div className="flex items-center justify-between gap-3 px-5 h-16 border-b border-sidebar-border">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-sm shrink-0">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm leading-tight truncate">CondominioDigital</p>
              <p className="text-[11px] text-muted-foreground leading-tight font-medium tracking-wide">VE · Bimonetario</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-8 w-8"
            onClick={() => setSidebarOpen(false)}
            aria-label="Cerrar menú"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Condominio actual */}
        <div className="px-4 py-3 border-b border-sidebar-border">
          <div className="rounded-lg bg-sidebar-accent/60 p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Condominio</p>
            <p className="text-sm font-semibold truncate mt-0.5">{condo?.name ?? "—"}</p>
            <p className="text-[11px] text-muted-foreground truncate">{condo?.rif ?? ""}</p>
          </div>
        </div>

        {/* Navegación */}
        <nav className="flex-1 overflow-y-auto scroll-fine px-3 py-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = view === item.view;
            return (
              <button
                key={item.view}
                onClick={() => {
                  setView(item.view);
                  setSidebarOpen(false);
                }}
                className={cn(
                  "w-full group flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent",
                )}
              >
                <Icon className={cn("h-[18px] w-[18px] shrink-0", active ? "" : "text-muted-foreground group-hover:text-sidebar-foreground")} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-tight">{item.label}</p>
                  <p className={cn("text-[11px] leading-tight truncate", active ? "text-sidebar-primary-foreground/70" : "text-muted-foreground")}>
                    {item.description}
                  </p>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-4">
          <div className="rounded-lg bg-gradient-to-br from-emerald-50 to-amber-50 dark:from-emerald-950/30 dark:to-amber-950/20 p-3 border border-emerald-100 dark:border-emerald-900/50">
            <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">Sistema bimonetario</p>
            <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
              USD + VES · Tasa BCV · Ledger inmutable
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
