"use client";

import { useEffect, useState } from "react";
import { useMe } from "@/hooks/use-auth";
import { LandingPage } from "@/components/landing/landing-page";
import { AuthScreen } from "@/components/auth/auth-screen";
import { RoleSelectorScreen } from "@/components/auth/role-selector-screen";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { ResidencesView } from "@/components/residences/residences-view";
import { UnifiedPaymentsView } from "@/components/payments/unified-payments-view";
import { LedgerView } from "@/components/ledger/ledger-view";
import { ServicesView } from "@/components/services/services-view";
import { InvoicesView } from "@/components/invoices/invoices-view";
import { ExpensesView } from "@/components/expenses/expenses-view";
import { BudgetView } from "@/components/budget/budget-view";
import { FundsView } from "@/components/funds/funds-view";
import { ReportsView } from "@/components/dashboard/reports-view";
import { PollsView } from "@/components/polls/polls-view";
import { AnnouncementsView } from "@/components/announcements/announcements-view";
import { RequestsView } from "@/components/requests/requests-view";
import { FacilitiesView } from "@/components/facilities/facilities-view";
import { CalendarView } from "@/components/calendar/calendar-view";
import { MessagesView } from "@/components/messages/messages-view";
import { MarketplaceView } from "@/components/marketplace/marketplace-view";
import { DocumentsView } from "@/components/documents/documents-view";
import { WorksView } from "@/components/works/works-view";
import { DirectoryView } from "@/components/directory/directory-view";
import { VisitorsView } from "@/components/security/visitors-view";
import { VehiclesView } from "@/components/security/vehicles-view";
import { AlertsView } from "@/components/security/alerts-view";
import { AccessLogView } from "@/components/security/access-log-view";
import { InviteCodeView } from "@/components/admin/invite-code-view";
import { TeamView } from "@/components/admin/team-view";
import { ModuleConfigView } from "@/components/admin/module-config-view";
import { MembershipView } from "@/components/membership/membership-view";
import { SettingsView } from "@/components/dashboard/settings-view";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppStore } from "@/store/app-store";

type GuestView = "landing" | "auth" | "register";

export default function Home() {
  const { data, isLoading, refetch } = useMe();
  const { view } = useAppStore();
  const [forceRefresh, setForceRefresh] = useState(0);
  const [guestView, setGuestView] = useState<GuestView>("landing");

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

  // 1) No autenticado → landing o auth
  if (!data?.user) {
    if (guestView === "landing") {
      return (
        <LandingPage
          onGetStarted={() => setGuestView("register")}
          onLogin={() => setGuestView("auth")}
        />
      );
    }
    return (
      <AuthScreen
        initialMode={guestView === "register" ? "register" : "login"}
        onAuthed={() => setForceRefresh((n) => n + 1)}
        onBack={() => setGuestView("landing")}
      />
    );
  }

  // 2) Autenticado, onboarding no completado → wizard
  if (!data.user.onboardingDone) {
    return <OnboardingWizard onComplete={() => setForceRefresh((n) => n + 1)} />;
  }

  // 3) Autenticado + onboarding completo → app desktop
  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 p-4 lg:p-6">
          <div className="mx-auto max-w-7xl">
            {view === "dashboard" && <DashboardView />}
            {view === "residences" && <ResidencesView />}
            {view === "payments" && <UnifiedPaymentsView />}
            {view === "receipts" && <UnifiedPaymentsView />}
            {view === "payment-references" && <UnifiedPaymentsView />}
            {view === "ledger" && <LedgerView />}
            {view === "services" && <ServicesView />}
            {view === "invoices" && <InvoicesView />}
            {view === "expenses" && <ExpensesView />}
            {view === "budget" && <BudgetView />}
            {view === "funds" && <FundsView />}
            {view === "reports" && <ReportsView />}
            {view === "polls" && <PollsView />}
            {view === "announcements" && <AnnouncementsView />}
            {view === "requests" && <RequestsView />}
            {view === "facilities" && <FacilitiesView />}
            {view === "calendar" && <CalendarView />}
            {view === "messages" && <MessagesView />}
            {view === "marketplace" && <MarketplaceView />}
            {view === "documents" && <DocumentsView />}
            {view === "works" && <WorksView />}
            {view === "directory" && <DirectoryView />}
            {view === "visitors" && <VisitorsView />}
            {view === "vehicles" && <VehiclesView />}
            {view === "alerts" && <AlertsView />}
            {view === "access-log" && <AccessLogView />}
            {view === "invite-code" && <InviteCodeView />}
            {view === "team" && <TeamView />}
            {view === "module-config" && <ModuleConfigView />}
            {view === "membership" && <MembershipView />}
            {view === "settings" && <SettingsView />}
          </div>
        </main>
        <footer className="mt-auto border-t border-border bg-card/50 py-4 px-6">
          <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">VecinoClaro</span>
              <span>·</span>
              <span>Gestión bimonetaria para condominios venezolanos</span>
            </div>
            <div className="flex items-center gap-3">
              <span>USD + VES · DolarApi BCV · Ledger SHA-256</span>
              <span>·</span>
              <span>v2.1.0</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
