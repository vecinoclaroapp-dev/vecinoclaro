"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

export type ResidentMe = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  residenceLabel?: string;
  residenceId?: string;
  condominiumName?: string;
  condominiumId?: string;
  outstanding?: number;
  lastPaymentDate?: string;
  paymentCode?: string;
};

export function useResidentMe() {
  return useQuery<ResidentMe>({
    queryKey: ["residents", "me"],
    queryFn: async () => {
      const r = await fetch("/api/residents/me");
      if (!r.ok) throw new Error("Error al cargar residente");
      return r.json();
    },
    staleTime: 15_000,
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
