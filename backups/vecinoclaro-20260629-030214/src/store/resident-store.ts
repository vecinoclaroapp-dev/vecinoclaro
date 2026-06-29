"use client";

import { create } from "zustand";

export type ResidentView =
  | "dashboard"
  | "payments"
  | "invoices"
  | "announcements"
  | "polls"
  | "requests"
  | "profile";

type ResidentState = {
  view: ResidentView;
  setView: (v: ResidentView) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
};

export const useResidentStore = create<ResidentState>((set) => ({
  view: "dashboard",
  setView: (view) => set({ view, sidebarOpen: false }),
  sidebarOpen: false,
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
}));
