"use client";

import { useState } from "react";
import { InteractiveMenu } from "@/components/ui/interactive-menu";
import { useMe } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Home,
  CreditCard,
  FileText,
  Megaphone,
  User,
  KeyRound,
  ArrowLeft,
  Download,
  LogOut,
  Bell,
} from "lucide-react";
import { useLogout } from "@/hooks/use-auth";
import { toast } from "sonner";

type UserView = "home" | "payments" | "invoices" | "announcements" | "profile";

export function UserPortal({ onBackToLanding }: { onBackToLanding: () => void }) {
  const { data: me, isLoading } = useMe();
  const logout = useLogout();
  const [view, setView] = useState<UserView>("home");

  const user = me?.user;
  const initials = user?.name
    ? user.name.split(" ").map((p: string) => p[0]).slice(0, 2).join("").toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? "?";

  const handleLogout = () => {
    logout.mutate(undefined);
    toast.success("Sesión cerrada");
  };

  const menuItems = [
    { label: "Inicio", icon: Home, view: "home" },
    { label: "Pagos", icon: CreditCard, view: "payments" },
    { label: "Facturas", icon: FileText, view: "invoices" },
    { label: "Avisos", icon: Megaphone, view: "announcements" },
    { label: "Perfil", icon: User, view: "profile" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Skeleton className="h-12 w-12 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75 border-b border-border">
        <div className="flex items-center justify-between gap-3 px-4 h-16">
          <div className="flex items-center gap-2.5">
            <img src="/logo-vecinoclaro.png" alt="VecinoClaro" className="h-9 w-9 object-cover" />
            <div>
              <p className="font-bold text-sm leading-tight">VecinoClaro</p>
              <p className="text-[10px] text-muted-foreground leading-tight">Cuentas Claras, Vecinos Claros</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Notificaciones">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-rose-600" onClick={handleLogout} aria-label="Cerrar sesión">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 pb-32 max-w-2xl mx-auto w-full">
        {view === "home" && <HomeView user={user} onNavigate={setView} onBackToLanding={onBackToLanding} />}
        {view === "payments" && <PaymentsView />}
        {view === "invoices" && <InvoicesView />}
        {view === "announcements" && <AnnouncementsView />}
        {view === "profile" && <ProfileView user={user} initials={initials} />}
      </main>

      <div className="interactive-menu--fixed-bottom">
        <InteractiveMenu
          items={menuItems}
          activeView={view}
          onNavigate={(v) => setView(v as UserView)}
          accentColor="#047857"
        />
      </div>
    </div>
  );
}

function HomeView({ user, onNavigate, onBackToLanding }: { user: any; onNavigate: (v: UserView) => void; onBackToLanding: () => void }) {
  const hasCondominium = !!user?.condominium;
  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-emerald-50 to-amber-50/50 dark:from-emerald-950/20 dark:to-amber-950/10 border-emerald-200 dark:border-emerald-900/50">
        <CardContent className="pt-6">
          <h1 className="text-2xl font-bold mb-1">Hola, {user?.name?.split(" ")[0] ?? "Vecino"} 👋</h1>
          <p className="text-sm text-muted-foreground">
            {hasCondominium ? "Bienvenido a tu panel de VecinoClaro" : "Aún no estás vinculado a un condominio"}
          </p>
        </CardContent>
      </Card>

      {!hasCondominium && (
        <Card className="border-sky-200 dark:border-sky-900/50 bg-sky-50/50 dark:bg-sky-950/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-sky-100 dark:bg-sky-950/50 flex items-center justify-center shrink-0">
                <KeyRound className="h-5 w-5 text-sky-600 dark:text-sky-400" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Únete a tu condominio</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Pídele a tu administrador el código de invitación para vincular tu cuenta a tu vivienda.
                </p>
              </div>
            </div>
            <Button className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700" onClick={() => onNavigate("profile")}>
              <KeyRound className="h-4 w-4" />
              Ingresar código de invitación
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => onNavigate("payments")} className="rounded-xl border bg-card p-4 text-left hover:shadow-md transition-shadow">
          <div className="h-9 w-9 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center mb-2">
            <CreditCard className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="font-semibold text-sm">Mis Pagos</p>
          <p className="text-xs text-muted-foreground">Historial y nuevo pago</p>
        </button>
        <button onClick={() => onNavigate("invoices")} className="rounded-xl border bg-card p-4 text-left hover:shadow-md transition-shadow">
          <div className="h-9 w-9 rounded-lg bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center mb-2">
            <FileText className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="font-semibold text-sm">Mis Facturas</p>
          <p className="text-xs text-muted-foreground">Estados de cuenta</p>
        </button>
        <button onClick={() => onNavigate("announcements")} className="rounded-xl border bg-card p-4 text-left hover:shadow-md transition-shadow">
          <div className="h-9 w-9 rounded-lg bg-violet-100 dark:bg-violet-950/50 flex items-center justify-center mb-2">
            <Megaphone className="h-4 w-4 text-violet-600 dark:text-violet-400" />
          </div>
          <p className="font-semibold text-sm">Avisos</p>
          <p className="text-xs text-muted-foreground">Cartelera digital</p>
        </button>
        <button onClick={() => onNavigate("profile")} className="rounded-xl border bg-card p-4 text-left hover:shadow-md transition-shadow">
          <div className="h-9 w-9 rounded-lg bg-sky-100 dark:bg-sky-950/50 flex items-center justify-center mb-2">
            <User className="h-4 w-4 text-sky-600 dark:text-sky-400" />
          </div>
          <p className="font-semibold text-sm">Mi Perfil</p>
          <p className="text-xs text-muted-foreground">Datos y configuración</p>
        </button>
      </div>

      <button onClick={onBackToLanding} className="w-full flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground py-3">
        <ArrowLeft className="h-3 w-3" />
        Volver a la página de inicio
      </button>
    </div>
  );
}

function PaymentsView() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Mis Pagos</h2>
      <Card><CardContent className="pt-6 text-center">
        <div className="h-14 w-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center mx-auto mb-3">
          <CreditCard className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <p className="text-sm font-medium">No tienes pagos registrados</p>
        <p className="text-xs text-muted-foreground mt-1">Cuando estés vinculado a un condominio, tus pagos aparecerán aquí.</p>
      </CardContent></Card>
    </div>
  );
}

function InvoicesView() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Mis Facturas</h2>
      <Card><CardContent className="pt-6 text-center">
        <div className="h-14 w-14 rounded-2xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center mx-auto mb-3">
          <FileText className="h-6 w-6 text-amber-600 dark:text-amber-400" />
        </div>
        <p className="text-sm font-medium">No tienes facturas pendientes</p>
        <p className="text-xs text-muted-foreground mt-1">Tus estados de cuenta mensuales aparecerán aquí.</p>
      </CardContent></Card>
    </div>
  );
}

function AnnouncementsView() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Avisos</h2>
      <Card><CardContent className="pt-6 text-center">
        <div className="h-14 w-14 rounded-2xl bg-violet-50 dark:bg-violet-950/30 flex items-center justify-center mx-auto mb-3">
          <Megaphone className="h-6 w-6 text-violet-600 dark:text-violet-400" />
        </div>
        <p className="text-sm font-medium">No hay avisos disponibles</p>
        <p className="text-xs text-muted-foreground mt-1">Los avisos de tu condominio aparecerán aquí.</p>
      </CardContent></Card>
    </div>
  );
}

function ProfileView({ user, initials }: { user: any; initials: string }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Mi Perfil</h2>
      <Card><CardContent className="pt-6">
        <div className="flex items-center gap-4 mb-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-lg font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-bold text-base">{user?.name ?? "Usuario"}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>
      </CardContent></Card>
      <Card><CardContent className="pt-6">
        <h3 className="font-semibold text-sm mb-3">Cuenta</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Rol</span><span className="font-medium">Residente</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Condominio</span><span className="font-medium">{user?.condominium?.name ?? "No vinculado"}</span></div>
        </div>
      </CardContent></Card>
      <Card className="border-sky-200 dark:border-sky-900/50"><CardContent className="pt-6">
        <h3 className="font-semibold text-sm mb-2">Código de invitación</h3>
        <p className="text-xs text-muted-foreground mb-3">Si tu administrador te dio un código, ingrésalo para vincular tu vivienda.</p>
        <Button variant="outline" className="w-full gap-2" disabled>
          <KeyRound className="h-4 w-4" />
          Ingresar código (próximamente)
        </Button>
      </CardContent></Card>
      <div className="pt-2">
        <a href="/vecinoclaro.apk" download="vecinoclaro.apk" className="w-full inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-bold bg-gradient-to-r from-amber-400 to-emerald-500 hover:from-amber-300 hover:to-emerald-400 text-emerald-950 transition-all">
          <Download className="h-4 w-4" />
          Descargar App
        </a>
      </div>
    </div>
  );
}
