"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useResidentStore, type ResidentView } from "@/store/resident-store";
import { useResidentMe } from "@/hooks/use-resident";
import {
  LayoutDashboard,
  CreditCard,
  FileText,
  Megaphone,
  Vote,
  LifeBuoy,
  User,
  LogOut,
  Menu,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type NavItem = { key: ResidentView; label: string; icon: LucideIcon };

const NAV_ITEMS: NavItem[] = [
  { key: "dashboard", label: "Mi Panel", icon: LayoutDashboard },
  { key: "payments", label: "Mis Pagos", icon: CreditCard },
  { key: "invoices", label: "Mis Facturas", icon: FileText },
  { key: "announcements", label: "Avisos", icon: Megaphone },
  { key: "polls", label: "Votaciones", icon: Vote },
  { key: "requests", label: "Mis Solicitudes", icon: LifeBuoy },
  { key: "profile", label: "Mi Perfil", icon: User },
];

function NavList({
  view,
  setView,
}: {
  view: ResidentView;
  setView: (v: ResidentView) => void;
}) {
  return (
    <nav className="space-y-1">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = view === item.key;
        return (
          <Button
            key={item.key}
            variant={isActive ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start gap-2.5 font-medium",
              isActive && "bg-emerald-100 text-emerald-900 hover:bg-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-100"
            )}
            onClick={() => setView(item.key)}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Button>
        );
      })}
    </nav>
  );
}

function UserCard({ name, residenceLabel }: { name?: string; residenceLabel?: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
      <Avatar className="h-9 w-9">
        <AvatarFallback className="bg-emerald-100 text-emerald-800 text-xs dark:bg-emerald-950/50 dark:text-emerald-300">
          {name?.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase() ?? "?"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{name ?? "Residente"}</p>
        {residenceLabel && (
          <p className="text-xs text-muted-foreground truncate">{residenceLabel}</p>
        )}
      </div>
    </div>
  );
}

function BrandHeader() {
  return (
    <div className="flex items-center gap-2">
      <div className="h-9 w-9 rounded-lg bg-emerald-600 flex items-center justify-center">
        <Building2 className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="font-bold text-sm leading-tight">VecinoClaro</p>
        <p className="text-xs text-muted-foreground">Panel del residente</p>
      </div>
    </div>
  );
}

export function ResidentSidebar() {
  const { view, setView, sidebarOpen, setSidebarOpen } = useResidentStore();
  const { data: resident } = useResidentMe();

  return (
    <>
      {/* Mobile trigger */}
      <div className="lg:hidden fixed top-3 left-3 z-50">
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-4">
            <div className="mb-4">
              <BrandHeader />
            </div>
            <NavList view={view} setView={setView} />
            <Separator className="my-4" />
            <UserCard
              name={resident?.name}
              residenceLabel={resident?.residenceLabel}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r bg-background shrink-0">
        <div className="p-4 border-b">
          <BrandHeader />
        </div>
        <div className="flex-1 p-3 overflow-y-auto">
          <NavList view={view} setView={setView} />
        </div>
        <div className="p-3 border-t space-y-2">
          <UserCard
            name={resident?.name}
            residenceLabel={resident?.residenceLabel}
          />
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground">
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </Button>
        </div>
      </aside>
    </>
  );
}
