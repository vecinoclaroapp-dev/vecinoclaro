import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserContext, unauthorized, noCondominium } from "@/lib/api-context";
import { outstandingFromEntries } from "@/lib/money";

// GET /api/morosos — lista viviendas morosas (sin ownerName para privacidad)
export async function GET() {
  const { user, condominium } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();

  const residences = await db.residence.findMany({
    where: { condominiumId: condominium.id, active: true },
    include: {
      ledgerEntries: { select: { type: true, amountUSD: true, amountVES: true } },
    },
    orderBy: [{ type: "asc" }, { number: "asc" }],
  });

  const morosos = residences
    .map((r) => {
      const balances = outstandingFromEntries(r.ledgerEntries ?? []);
      return {
        id: r.id,
        number: r.number,
        type: r.type,
        outstandingUSD: balances.usd,
        outstandingVES: balances.ves,
        monthsLate: balances.usd > 0 ? Math.max(1, Math.round(balances.usd / (condominium.baseFeeUSD || 1))) : 0,
      };
    })
    .filter((r) => r.outstandingUSD > 0.01)
    .sort((a, b) => b.outstandingUSD - a.outstandingUSD);

  return NextResponse.json({
    total: morosos.length,
    totalDebtUSD: morosos.reduce((a, m) => a + m.outstandingUSD, 0),
    morosos,
  });
}
