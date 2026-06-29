import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserContext, unauthorized, noCondominium } from "@/lib/api-context";

// GET /api/billing-config
export async function GET() {
  const { user, condominium } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();

  let config = await db.billingConfig.findUnique({
    where: { condominiumId: condominium.id },
  });

  if (!config) {
    config = await db.billingConfig.create({
      data: { condominiumId: condominium.id },
    });
  }

  return NextResponse.json(config);
}

// POST /api/billing-config (solo admin)
export async function POST(request: Request) {
  const { user, condominium, membership } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();
  if (membership?.role !== "ADMIN") {
    return NextResponse.json({ error: "Solo el administrador puede configurar facturación" }, { status: 403 });
  }

  try {
    const body = await request.json();

    const data = {
      invoiceDay: Math.min(Math.max(Number(body.invoiceDay ?? 1), 1), 28),
      dueDays: Math.min(Math.max(Number(body.dueDays ?? 15), 1), 60),
      lateFeePercent: Math.max(Number(body.lateFeePercent ?? 0), 0),
      lateFeeFixedUSD: Math.max(Number(body.lateFeeFixedUSD ?? 0), 0),
      graceDays: Math.max(Number(body.graceDays ?? 0), 0),
      autoGenerate: !!body.autoGenerate,
    };

    const config = await db.billingConfig.upsert({
      where: { condominiumId: condominium.id },
      update: data,
      create: { condominiumId: condominium.id, ...data },
    });

    return NextResponse.json({ config });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al guardar configuración" },
      { status: 500 },
    );
  }
}
