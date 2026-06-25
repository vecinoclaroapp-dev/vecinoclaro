import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserContext, unauthorized, noCondominium } from "@/lib/api-context";

// GET /api/condominium — info del condominio del usuario actual
export async function GET() {
  const { user, condominium } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();

  const residencesCount = await db.residence.count({
    where: { condominiumId: condominium.id, active: true },
  });

  return NextResponse.json({
    id: condominium.id,
    name: condominium.name,
    rif: condominium.rif,
    address: condominium.address,
    city: condominium.city,
    adminName: condominium.adminName,
    adminPhone: condominium.adminPhone,
    adminEmail: condominium.adminEmail,
    baseFeeUSD: condominium.baseFeeUSD,
    reserveFund: condominium.reserveFund,
    logoUrl: condominium.logoUrl,
    primaryColor: condominium.primaryColor,
    setupComplete: condominium.setupComplete,
    residencesCount,
  });
}
