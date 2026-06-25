import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/condominium — info del condominio
export async function GET() {
  const condo = await db.condominium.findFirst({
    include: {
      residences: { where: { active: true }, select: { id: true } },
    },
  });

  if (!condo) {
    return NextResponse.json({ error: "No hay condominio configurado" }, { status: 404 });
  }

  return NextResponse.json({
    id: condo.id,
    name: condo.name,
    rif: condo.rif,
    address: condo.address,
    adminName: condo.adminName,
    adminPhone: condo.adminPhone,
    baseFeeUSD: condo.baseFeeUSD,
    reserveFund: condo.reserveFund,
    residencesCount: condo.residences.length,
  });
}
