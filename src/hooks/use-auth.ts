"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

// Sesión actual desde /api/me (más completa que useSession)
export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const r = await fetch("/api/me");
      if (!r.ok) throw new Error("Error");
      return r.json();
    },
    staleTime: 10_000,
  });
}

export function useRegister() {
  const router = useRouter();
  return useMutation({
    mutationFn: async (data: { name: string; email: string; password: string }) => {
      const r = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Error al registrar");
      return j;
    },
    onSuccess: async (_data, vars) => {
      // Auto-login tras registro
      await signIn("credentials", {
        email: vars.email,
        password: vars.password,
        redirect: false,
      });
      router.refresh();
    },
  });
}

export function useLogin() {
  const router = useRouter();
  return useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const res = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      if (!res?.ok) throw new Error("Correo o contraseña incorrectos");
      return res;
    },
    onSuccess: () => router.refresh(),
  });
}

export function useLogout() {
  const router = useRouter();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await signOut({ redirect: false });
    },
    onSuccess: () => {
      qc.clear();
      router.refresh();
    },
  });
}

export function useOnboardingStep() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const r = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Error");
      return j;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
      qc.invalidateQueries({ queryKey: ["condominium"] });
    },
  });
}

export function useCompleteOnboarding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const r = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onboardingDone: true }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      return j;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["me"] }),
  });
}
