import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/ledger — libro contable inmutable
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const residenceId = searchParams.get("residenceId");
  const type = searchParams.get("type");
  const category = searchParams.get("category");
  const limit = Math.min(parseInt(searchParams.get("limit") || "100", 10), 500);

  const where: Record<string, unknown> = {};
  if (residenceId) where.residenceId = residenceId;
  if (type) where.type = type;
  if (category) where.category = category;

  const entries = await db.accountEntry.findMany({
    where,
    include: {
      residence: { select: { number: true, ownerName: true } },
      bcvRate: { select: { rate: true, date: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return NextResponse.json({
    entries: entries.map((e) => ({
      id: e.id,
      residenceId: e.residenceId,
      residenceNumber: e.residence.number,
      ownerName: e.residence.ownerName,
      type: e.type,
      amountUSD: e.amountUSD,
      amountVES: e.amountVES,
      bcvRate: e.bcvRate.rate,
      concept: e.concept,
      category: e.category,
      reference: e.reference,
      date: e.date,
      hash: e.hash,
      prevHash: e.prevHash,
      paymentId: e.paymentId,
      invoiceId: e.invoiceId,
      serviceChargeId: e.serviceChargeId,
      createdAt: e.createdAt,
    })),
  });
}
