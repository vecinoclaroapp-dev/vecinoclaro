import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { fetchBcvRate, saveBcvRate } from "@/lib/bcv";

// GET /api/me — sesión actual con su condominio
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      onboardingDone: true,
      onboardingStep: true,
      provider: true,
    },
  });

  if (!user) {
    return NextResponse.json({ user: null });
  }

  const membership = await db.condominiumMember.findFirst({
    where: { userId: user.id },
    include: { condominium: true },
  });

  return NextResponse.json({
    user,
    condominium: membership?.condominium ?? null,
    membershipRole: membership?.role ?? null,
  });
}

// PATCH /api/me — actualizar onboarding step
export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  const body = await request.json();

  // Sincronizar tasa BCV si el onboarding la solicita (solo ADMIN)
  if (body.syncBcv) {
    const { getUserContext } = await import("@/lib/api-context");
    const { membership } = await getUserContext();
    if (membership?.role !== "ADMIN") {
      return NextResponse.json({ error: "Solo el administrador puede sincronizar BCV" }, { status: 403 });
    }
    const r = await fetchBcvRate();
    const saved = await saveBcvRate(r);
    return NextResponse.json({ ok: true, rate: saved.rate });
  }

  const updated = await db.user.update({
    where: { id: session.user.id },
    data: {
      onboardingStep: body.onboardingStep,
      onboardingDone: body.onboardingDone,
    },
  });

  return NextResponse.json({ ok: true, user: updated });
}
