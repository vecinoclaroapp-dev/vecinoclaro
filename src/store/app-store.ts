"use client";

import { create } from "zustand";

export type View =
  | "dashboard"
  | "residences"
  | "payments"
  | "ledger"
  | "services"
  | "invoices"
  | "reports"
  | "settings";

type AppState = {
  view: View;
  setView: (v: View) => void;
  // Filtros activos compartidos entre vistas
  selectedResidenceId: string | null;
  setSelectedResidence: (id: string | null) => void;
  // Pre-fill del formulario de pago (ej: "pagar servicio X")
  prefillPayment: {
    residenceId?: string;
    concept?: string;
    category?: string;
    serviceChargeId?: string;
  } | null;
  setPrefillPayment: (p: AppState["prefillPayment"]) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
};

export const useAppStore = create<AppState>((set) => ({
  view: "dashboard",
  setView: (view) => set({ view }),
  selectedResidenceId: null,
  setSelectedResidence: (selectedResidenceId) => set({ selectedResidenceId }),
  prefillPayment: null,
  setPrefillPayment: (prefillPayment) => set({ prefillPayment }),
  sidebarOpen: false,
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
}));
