import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserContext, unauthorized } from "@/lib/api-context";
import { outstandingFromEntries } from "@/lib/money";

// GET /api/residents/me — data del residente actual
export async function GET() {
  const { user, condominium, membership } = await getUserContext();
  if (!user) return unauthorized();

  // Si no es residente o no tiene condominio
  if (!condominium) {
    return NextResponse.json({ error: "Sin condominio" }, { status: 404 });
  }
  if (membership?.role !== "RESIDENT") {
    return NextResponse.json(
      { error: "Esta vista es solo para residentes", role: membership?.role },
      { status: 403 },
    );
  }

  // Fetch full user to get phone (not in session)
  const fullUser = await db.user.findUnique({
    where: { id: user.id },
    select: { id: true, name: true, email: true, phone: true, image: true },
  });

  const residence = membership.residenceId
    ? await db.residence.findUnique({
        where: { id: membership.residenceId },
        include: {
          ledgerEntries: { select: { type: true, amountUSD: true, amountVES: true } },
          invoices: {
            where: { status: { in: ["PENDING", "PARTIAL"] } },
            orderBy: { period: "desc" },
            take: 12,
          },
        },
      })
    : null;

  const balances = residence
    ? outstandingFromEntries(residence.ledgerEntries ?? [])
    : { usd: 0, ves: 0 };

  return NextResponse.json({
    user: {
      id: fullUser?.id ?? user.id,
      name: fullUser?.name ?? user.name,
      email: fullUser?.email ?? user.email ?? null,
      phone: fullUser?.phone ?? null,
      image: fullUser?.image ?? user.image ?? null,
    },
    condominium: {
      id: condominium.id,
      name: condominium.name,
      logoUrl: condominium.logoUrl,
      primaryColor: condominium.primaryColor,
      baseFeeUSD: condominium.baseFeeUSD,
    },
    membership: {
      role: membership.role,
      residenceId: membership.residenceId,
      acceptedAt: membership.acceptedAt,
    },
    residence: residence
      ? {
          id: residence.id,
          number: residence.number,
          type: residence.type,
          aliquot: residence.aliquot,
          ownerName: residence.ownerName,
          residentName: residence.residentName,
        }
      : null,
    balance: balances,
    pendingInvoices: residence?.invoices ?? [],
  });
}
