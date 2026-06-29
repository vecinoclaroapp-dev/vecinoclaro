import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserContext, unauthorized, noCondominium } from "@/lib/api-context";

// GET /api/invoices
export async function GET(request: Request) {
  const { user, condominium } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();

  const { searchParams } = new URL(request.url);
  const residenceId = searchParams.get("residenceId");
  const status = searchParams.get("status");

  const where: Record<string, unknown> = { residence: { condominiumId: condominium.id } };
  if (residenceId) where.residenceId = residenceId;
  if (status) where.status = status;

  const invoices = await db.invoice.findMany({
    where,
    include: { residence: { select: { number: true, ownerName: true } } },
    orderBy: [{ period: "desc" }, { residence: { number: "asc" } }],
    take: 200,
  });

  return NextResponse.json({
    invoices: invoices.map((i) => ({
      id: i.id,
      residenceId: i.residenceId,
      residenceNumber: i.residence.number,
      ownerName: i.residence.ownerName ?? "—",
      period: i.period,
      amountUSD: i.amountUSD,
      amountVES: i.amountVES,
      dueDate: i.dueDate,
      status: i.status,
      paidAmountUSD: i.paidAmountUSD,
      createdAt: i.createdAt,
    })),
  });
}
