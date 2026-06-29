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
  Vote,
  Megaphone,
  LifeBuoy,
  CalendarDays,
  MessageSquare,
  ShoppingBag,
  FolderOpen,
  HardHat,
  Users,
  UserCheck,
  Car,
  Bell,
  ScrollText,
  KeyRound,
  ShieldCheck,
  Blocks,
  Crown,
} from "lucide-react";
import { useCondominium, useModules } from "@/hooks/use-api";
import { useMe, useLogout } from "@/hooks/use-auth";
import { toast } from "sonner";

type NavItem = { view: View; label: string; icon: React.ComponentType<{ className?: string }>; description: string; module?: string };
type NavSection = { title: string; items: NavItem[] };

const NAV_SECTIONS: NavSection[] = [
  {
    title: "Resumen",
    items: [
      { view: "dashboard", label: "Panel", icon: LayoutDashboard, description: "Resumen general" },
      { view: "reports", label: "Reportes", icon: BarChart3, description: "Estadísticas y exportes" },
    ],
  },
  {
    title: "Financiero",
    items: [
      { view: "residences", label: "Viviendas", icon: Home, description: "Propiedades y saldos" },
      { view: "invoices", label: "Facturas", icon: FileText, description: "Mantenimiento mensual" },
      { view: "payments", label: "Pagos", icon: CreditCard, description: "Pagos · Comprobantes · Cuentas" },
      { view: "ledger", label: "Libro Contable", icon: BookOpen, description: "Historial inmutable" },
      { view: "expenses", label: "Gastos y Proveedores", icon: Receipt, description: "Egresos del condominio" },
      { view: "services", label: "Servicios Críticos", icon: Zap, description: "Cargos extraordinarios" },
      { view: "budget", label: "Presupuesto", icon: Target, description: "Presupuestado vs. real" },
      { view: "funds", label: "Fondos", icon: Wallet, description: "Ordinario, reserva" },
    ],
  },
  {
    title: "Comunicación",
    items: [
      { view: "announcements", label: "Avisos y Morosos", icon: Megaphone, description: "Cartelera digital", module: "announcements" },
      { view: "polls", label: "Votaciones", icon: Vote, description: "Por indiviso (Ley PH)", module: "polls" },
      { view: "requests", label: "Solicitudes", icon: LifeBuoy, description: "Help-desk de residentes", module: "requests" },
      { view: "messages", label: "Mensajes", icon: MessageSquare, description: "Chat interno", module: "messages" },
      { view: "calendar", label: "Calendario", icon: CalendarDays, description: "Eventos y asambleas", module: "calendar" },
    ],
  },
  {
    title: "Comunidad",
    items: [
      { view: "facilities", label: "Áreas comunes", icon: Building2, description: "Reservas", module: "facilities" },
      { view: "directory", label: "Directorio", icon: Users, description: "Vecinos y contactos", module: "directory" },
      { view: "marketplace", label: "Marketplace", icon: ShoppingBag, description: "Compra-venta", module: "marketplace" },
      { view: "documents", label: "Documentos", icon: FolderOpen, description: "Actas y manuales", module: "documents" },
      { view: "works", label: "Obras", icon: HardHat, description: "Proyectos y mantenimiento", module: "works" },
    ],
  },
  {
    title: "Seguridad",
    items: [
      { view: "visitors", label: "Visitantes", icon: UserCheck, description: "Check-in/out", module: "security" },
      { view: "vehicles", label: "Vehículos", icon: Car, description: "Placas y permisos", module: "security" },
      { view: "alerts", label: "Alertas", icon: Bell, description: "Incidencias", module: "security" },
      { view: "access-log", label: "Bitácora", icon: ScrollText, description: "Registro de accesos", module: "security" },
    ],
  },
  {
    title: "Administración",
    items: [
      { view: "membership", label: "Membresía", icon: Crown, description: "Plan $2/apt/mes (3B)" },
      { view: "invite-code", label: "Código invitación", icon: KeyRound, description: "Para residentes" },
      { view: "team", label: "Equipo", icon: ShieldCheck, description: "Roles y permisos" },
      { view: "module-config", label: "Módulos", icon: Blocks, description: "Activar/desactivar" },
      { view: "settings", label: "Ajustes", icon: Settings, description: "Configuración" },
    ],
  },
];

export function Sidebar() {
  const { view, setView, sidebarOpen, setSidebarOpen } = useAppStore();
  const { data: condo } = useCondominium();
  const { data: me } = useMe();
  const { data: modules } = useModules();
  const logout = useLogout();

  const user = me?.user;
  const initials = user?.name
    ? user.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? "?";

  // Filtrar secciones/items según módulos activos
  const filteredSections = NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => {
      if (!item.module) return true;
      return modules?.[item.module] !== false;
    }),
  })).filter((section) => section.items.length > 0);

  const handleLogout = () => {
    logout.mutate(undefined);
    toast.success("Sesión cerrada");
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
        {/* Brand con logo real + eslogan */}
        <div className="flex items-center justify-between gap-3 px-5 h-16 border-b border-sidebar-border">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src="/logo-vecinoclaro.jpg"
              alt="VecinoClaro"
              className="h-10 w-10 rounded-xl object-cover shrink-0 ring-1 ring-sidebar-border"
            />
            <div className="min-w-0">
              <p className="font-bold text-sm leading-tight truncate">VecinoClaro</p>
              <p className="text-[10px] text-muted-foreground leading-tight font-medium tracking-wide truncate">
                Cuentas Claras, Vecinos Claros
              </p>
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
        <nav className="flex-1 overflow-y-auto scroll-fine px-3 py-3 space-y-4">
          {filteredSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                {section.title}
              </p>
              {section.items.map((item) => {
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
                      "w-full group flex items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors",
                      active
                        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                        : "text-sidebar-foreground hover:bg-sidebar-accent",
                    )}
                  >
                    <Icon className={cn("h-[17px] w-[17px] shrink-0", active ? "" : "text-muted-foreground group-hover:text-sidebar-foreground")} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium leading-tight">{item.label}</p>
                      <p className={cn("text-[10px] leading-tight truncate", active ? "text-sidebar-primary-foreground/70" : "text-muted-foreground")}>
                        {item.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
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
