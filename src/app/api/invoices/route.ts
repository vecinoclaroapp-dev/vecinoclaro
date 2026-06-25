import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/invoices — facturas de mantenimiento
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const residenceId = searchParams.get("residenceId");
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {};
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
      ownerName: i.residence.ownerName,
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
