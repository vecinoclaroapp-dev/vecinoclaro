import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserContext, unauthorized, noCondominium } from "@/lib/api-context";

const RATE_PER_APT_USD = 2.0; // $2 USD por apartamento por mes

// GET /api/memberships — lista membresías del condominio + cálculo del período actual
export async function GET() {
  const { user, condominium, membership } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();

  // Contar apartamentos activos
  const activeResidences = await db.residence.count({
    where: { condominiumId: condominium.id, active: true },
  });

  // Período actual (YYYY-MM)
  const now = new Date();
  const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  // Buscar o crear membresía del período actual
  let currentMembership = await db.membership.findUnique({
    where: {
      condominiumId_period: { condominiumId: condominium.id, period: currentPeriod },
    },
  });

  // Si no existe, la creamos automáticamente
  if (!currentMembership) {
    // Obtener tasa BCV actual
    const latestBcv = await db.bcvRate.findFirst({
      orderBy: { date: "desc" },
    });
    const bcvRate = latestBcv?.rate ?? 0;
    const totalUSD = activeResidences * RATE_PER_APT_USD;
    const totalVES = bcvRate > 0 ? totalUSD * bcvRate : 0;

    // Fecha de vencimiento: día 10 del mes siguiente
    const dueDate = new Date(now.getFullYear(), now.getMonth() + 1, 10);

    currentMembership = await db.membership.create({
      data: {
        condominiumId: condominium.id,
        period: currentPeriod,
        activeResidences,
        ratePerAptUSD: RATE_PER_APT_USD,
        totalUSD,
        totalVES,
        bcvRate,
        dueDate,
        status: now > dueDate ? "OVERDUE" : "PENDING",
      },
    });
  }

  // Historial de membresías (últimos 12 períodos)
  const history = await db.membership.findMany({
    where: { condominiumId: condominium.id },
    orderBy: { period: "desc" },
    take: 12,
  });

  // Estadísticas anuales
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const yearlyStats = await db.membership.aggregate({
    where: {
      condominiumId: condominium.id,
      createdAt: { gte: yearStart },
    },
    _sum: { totalUSD: true, totalVES: true },
    _count: true,
  });
  const paidCount = await db.membership.count({
    where: {
      condominiumId: condominium.id,
      createdAt: { gte: yearStart },
      status: "PAID",
    },
  });

  return NextResponse.json({
    current: currentMembership,
    history,
    activeResidences,
    ratePerAptUSD: RATE_PER_APT_USD,
    yearly: {
      totalUSD: yearlyStats._sum.totalUSD ?? 0,
      totalVES: yearlyStats._sum.totalVES ?? 0,
      totalPeriods: yearlyStats._count,
      paidPeriods: paidCount,
    },
    membershipRole: membership?.role ?? null,
  });
}

// POST /api/memberships — marcar membresía como pagada (solo ADMIN)
export async function POST(request: Request) {
  const { user, condominium, membership } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();
  if (membership?.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Solo el administrador puede gestionar membresías" },
      { status: 403 },
    );
  }

  try {
    const body = await request.json();
    const { period, paidMethod, paidReference } = body;

    if (!period) {
      return NextResponse.json({ error: "Período requerido" }, { status: 400 });
    }

    const existing = await db.membership.findUnique({
      where: {
        condominiumId_period: { condominiumId: condominium.id, period },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Membresía no encontrada" }, { status: 404 });
    }

    if (existing.status === "PAID") {
      return NextResponse.json({ error: "Esta membresía ya está pagada" }, { status: 400 });
    }

    const updated = await db.membership.update({
      where: { id: existing.id },
      data: {
        status: "PAID",
        paidAt: new Date(),
        paidMethod: paidMethod || "MANUAL",
        paidReference: paidReference || null,
        paidById: user.id,
      },
    });

    return NextResponse.json({ membership: updated });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al actualizar membresía" },
      { status: 500 },
    );
  }
}
