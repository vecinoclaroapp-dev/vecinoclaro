"use client";

import { useEffect, useState } from "react";
import { useMe } from "@/hooks/use-auth";
import { AuthScreen } from "@/components/auth/auth-screen";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { ResidencesView } from "@/components/residences/residences-view";
import { PaymentsView } from "@/components/payments/payments-view";
import { LedgerView } from "@/components/ledger/ledger-view";
import { ServicesView } from "@/components/services/services-view";
import { InvoicesView } from "@/components/invoices/invoices-view";
import { ReportsView } from "@/components/dashboard/reports-view";
import { SettingsView } from "@/components/dashboard/settings-view";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppStore } from "@/store/app-store";

export default function Home() {
  const { data, isLoading, refetch } = useMe();
  const { view } = useAppStore();
  const [forceRefresh, setForceRefresh] = useState(0);

  // Refresca `me` al montar (por si venimos de login)
  useEffect(() => {
    refetch();
  }, [refetch, forceRefresh]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="space-y-4 text-center">
          <Skeleton className="h-12 w-12 rounded-2xl mx-auto" />
          <Skeleton className="h-4 w-48 mx-auto" />
          <Skeleton className="h-3 w-32 mx-auto" />
        </div>
      </div>
    );
  }

  // 1) No autenticado → pantalla de auth
  if (!data?.user) {
    return <AuthScreen onAuthed={() => setForceRefresh((n) => n + 1)} />;
  }

  // 2) Autenticado pero onboarding no completado → wizard
  if (!data.user.onboardingDone) {
    return <OnboardingWizard onComplete={() => setForceRefresh((n) => n + 1)} />;
  }

  // 3) Autenticado + onboarding completo → app
  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 p-4 lg:p-6">
          <div className="mx-auto max-w-7xl">
            {view === "dashboard" && <DashboardView />}
            {view === "residences" && <ResidencesView />}
            {view === "payments" && <PaymentsView />}
            {view === "ledger" && <LedgerView />}
            {view === "services" && <ServicesView />}
            {view === "invoices" && <InvoicesView />}
            {view === "reports" && <ReportsView />}
            {view === "settings" && <SettingsView />}
          </div>
        </main>
        <footer className="mt-auto border-t border-border bg-card/50 py-4 px-6">
          <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">CondominioDigital VE</span>
              <span>·</span>
              <span>Gestión bimonetaria para condominios venezolanos</span>
            </div>
            <div className="flex items-center gap-3">
              <span>USD + VES · BCV · Ledger SHA-256</span>
              <span>·</span>
              <span>v2.0.0</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
