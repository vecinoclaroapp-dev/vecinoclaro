// =====================================================================
// Helpers de auth + contexto de condominio para las APIs
// =====================================================================

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: string;
  onboardingDone: boolean;
  onboardingStep: number;
};

// Devuelve la sesión + el condominio del usuario actual
export async function getUserContext() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { session: null, user: null, condominium: null, membership: null };

  const membership = await db.condominiumMember.findFirst({
    where: { userId: session.user.id },
    include: { condominium: true },
  });

  return {
    session,
    user: session.user as SessionUser,
    condominium: membership?.condominium ?? null,
    membership,
  };
}

// Helper para respuestas 401
export function unauthorized() {
  return Response.json({ error: "No autenticado" }, { status: 401 });
}

// Helper para respuestas 404 sin condominio
export function noCondominium() {
  return Response.json(
    { error: "Debe completar el onboarding y crear un condominio primero" },
    { status: 404 },
  );
}
