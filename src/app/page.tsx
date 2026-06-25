"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { useAppStore } from "@/store/app-store";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { ResidencesView } from "@/components/residences/residences-view";
import { PaymentsView } from "@/components/payments/payments-view";
import { LedgerView } from "@/components/ledger/ledger-view";
import { ServicesView } from "@/components/services/services-view";
import { InvoicesView } from "@/components/invoices/invoices-view";
import { ReportsView } from "@/components/dashboard/reports-view";
import { SettingsView } from "@/components/dashboard/settings-view";

export default function Home() {
  const { view } = useAppStore();

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
              <span>v1.0.0</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
