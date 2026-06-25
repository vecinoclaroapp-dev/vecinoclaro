"use client";

import { useAppStore, type View } from "@/store/app-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  Home,
  CreditCard,
  BookOpen,
  Zap,
  FileText,
  Receipt,
  Target,
  Wallet,
  BarChart3,
  Settings,
  Building2,
  X,
  LogOut,
} from "lucide-react";
import { useCondominium } from "@/hooks/use-api";
import { useMe, useLogout } from "@/hooks/use-auth";
import { toast } from "sonner";

const NAV_ITEMS: { view: View; label: string; icon: React.ComponentType<{ className?: string }>; description: string }[] = [
  { view: "dashboard", label: "Panel", icon: LayoutDashboard, description: "Resumen general" },
  { view: "residences", label: "Viviendas", icon: Home, description: "Propiedades y saldos" },
  { view: "payments", label: "Pagos", icon: CreditCard, description: "Registro y consulta" },
  { view: "ledger", label: "Libro Contable", icon: BookOpen, description: "Historial inmutable" },
  { view: "services", label: "Servicios Críticos", icon: Zap, description: "Cargos extraordinarios" },
  { view: "invoices", label: "Facturas", icon: FileText, description: "Mantenimiento mensual" },
  { view: "expenses", label: "Gastos y Proveedores", icon: Receipt, description: "Egresos del condominio" },
  { view: "budget", label: "Presupuesto", icon: Target, description: "Presupuestado vs. real" },
  { view: "funds", label: "Fondos", icon: Wallet, description: "Ordinario, reserva" },
  { view: "reports", label: "Reportes", icon: BarChart3, description: "Estadísticas y exportes" },
  { view: "settings", label: "Ajustes", icon: Settings, description: "Configuración" },
];

export function Sidebar() {
  const { view, setView, sidebarOpen, setSidebarOpen } = useAppStore();
  const { data: condo } = useCondominium();
  const { data: me } = useMe();
  const logout = useLogout();

  const user = me?.user;
  const initials = user?.name
    ? user.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? "?";

  const handleLogout = () => {
    toast.promise(logout.mutateAsync(), {
      loading: "Cerrando sesión...",
      success: "Sesión cerrada",
      error: "Error",
    });
  };

  return (
    <>
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

        {/* User + logout */}
        <div className="border-t border-sidebar-border p-3 space-y-2">
          <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-sidebar-accent/50 transition-colors">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate leading-tight">{user?.name ?? "Usuario"}</p>
              <p className="text-[11px] text-muted-foreground truncate leading-tight">{user?.email}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-rose-600"
              onClick={handleLogout}
              aria-label="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
