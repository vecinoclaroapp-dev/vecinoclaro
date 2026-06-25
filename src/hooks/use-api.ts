"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// ---------------- BCV ----------------
export function useBcvRate() {
  return useQuery({
    queryKey: ["bcv", "rate"],
    queryFn: async () => {
      const r = await fetch("/api/bcv");
      if (!r.ok) throw new Error("Error al cargar tasa");
      return r.json();
    },
    refetchInterval: 5 * 60 * 1000, // cada 5 min
  });
}

export function useSyncBcv() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const r = await fetch("/api/bcv", { method: "POST" });
      if (!r.ok) throw new Error("Error al sincronizar");
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bcv"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useBcvHistory(days = 30) {
  return useQuery({
    queryKey: ["bcv", "history", days],
    queryFn: async () => {
      const r = await fetch(`/api/bcv/history?days=${days}`);
      if (!r.ok) throw new Error("Error al cargar historial");
      return r.json();
    },
  });
}

// ---------------- Dashboard ----------------
export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const r = await fetch("/api/dashboard");
      if (!r.ok) throw new Error("Error al cargar dashboard");
      return r.json();
    },
  });
}

// ---------------- Condominium ----------------
export function useCondominium() {
  return useQuery({
    queryKey: ["condominium"],
    queryFn: async () => {
      const r = await fetch("/api/condominium");
      if (!r.ok) throw new Error("Error al cargar condominio");
      return r.json();
    },
  });
}

// ---------------- Residences ----------------
export function useResidences(activeOnly = true) {
  return useQuery({
    queryKey: ["residences", { activeOnly }],
    queryFn: async () => {
      const r = await fetch(`/api/residences?active=${activeOnly}`);
      if (!r.ok) throw new Error("Error al cargar viviendas");
      return r.json();
    },
  });
}

export function useCreateResidence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const r = await fetch("/api/residences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Error al crear");
      return j;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["residences"] }),
  });
}

export function useUpdateResidence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const r = await fetch(`/api/residences/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Error al actualizar");
      return j;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["residences"] }),
  });
}

export function useDeleteResidence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const r = await fetch(`/api/residences/${id}`, { method: "DELETE" });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Error al desactivar");
      return j;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["residences"] }),
  });
}

// ---------------- Payments ----------------
export function usePayments(filters: { residenceId?: string; method?: string; status?: string; limit?: number } = {}) {
  const params = new URLSearchParams();
  if (filters.residenceId) params.set("residenceId", filters.residenceId);
  if (filters.method) params.set("method", filters.method);
  if (filters.status) params.set("status", filters.status);
  if (filters.limit) params.set("limit", String(filters.limit));

  return useQuery({
    queryKey: ["payments", filters],
    queryFn: async () => {
      const r = await fetch(`/api/payments?${params}`);
      if (!r.ok) throw new Error("Error al cargar pagos");
      return r.json();
    },
  });
}

export function useCreatePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const r = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Error al registrar pago");
      return j;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payments"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["ledger"] });
      qc.invalidateQueries({ queryKey: ["residences"] });
    },
  });
}

// ---------------- Ledger ----------------
export function useLedger(filters: { residenceId?: string; type?: string; category?: string; limit?: number } = {}) {
  const params = new URLSearchParams();
  if (filters.residenceId) params.set("residenceId", filters.residenceId);
  if (filters.type) params.set("type", filters.type);
  if (filters.category) params.set("category", filters.category);
  if (filters.limit) params.set("limit", String(filters.limit));

  return useQuery({
    queryKey: ["ledger", filters],
    queryFn: async () => {
      const r = await fetch(`/api/ledger?${params}`);
      if (!r.ok) throw new Error("Error al cargar libro contable");
      return r.json();
    },
  });
}

// ---------------- Services ----------------
export function useServices(filters: { status?: string; type?: string } = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.type) params.set("type", filters.type);

  return useQuery({
    queryKey: ["services", filters],
    queryFn: async () => {
      const r = await fetch(`/api/services?${params}`);
      if (!r.ok) throw new Error("Error al cargar servicios");
      return r.json();
    },
  });
}

export function useCreateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const r = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Error al crear cargo");
      return j;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["services"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["ledger"] });
      qc.invalidateQueries({ queryKey: ["residences"] });
    },
  });
}

export function useUpdateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const r = await fetch(`/api/services/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Error al actualizar");
      return j;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["services"] }),
  });
}

// ---------------- Invoices ----------------
export function useInvoices(filters: { residenceId?: string; status?: string } = {}) {
  const params = new URLSearchParams();
  if (filters.residenceId) params.set("residenceId", filters.residenceId);
  if (filters.status) params.set("status", filters.status);

  return useQuery({
    queryKey: ["invoices", filters],
    queryFn: async () => {
      const r = await fetch(`/api/invoices?${params}`);
      if (!r.ok) throw new Error("Error al cargar facturas");
      return r.json();
    },
  });
}
