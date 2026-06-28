import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserContext, unauthorized, noCondominium } from "@/lib/api-context";
import { outstandingFromEntries } from "@/lib/money";

function csvEscape(value: unknown): string {
  if (value == null) return "";
  const s = String(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function toCsv(rows: Record<string, unknown>[], headers: string[]): string {
  const head = headers.join(",");
  const body = rows
    .map((r) => headers.map((h) => csvEscape(r[h])).join(","))
    .join("\n");
  return `${head}\n${body}`;
}

// GET /api/reports/export?type=residents|payments|invoices|morosos|expenses
export async function GET(request: Request) {
  const { user, condominium, membership } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();
  if (membership?.role === "RESIDENT") {
    return NextResponse.json({ error: "Sin permisos para exportar reportes" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "residents";

  let csv = "";
  let filename = "reporte.csv";

  if (type === "residents" || type === "morosos") {
    const residences = await db.residence.findMany({
      where: { condominiumId: condominium.id, active: true },
      include: {
        ledgerEntries: { select: { type: true, amountUSD: true, amountVES: true } },
      },
      orderBy: [{ type: "asc" }, { number: "asc" }],
    });

    const rows = residences.map((r) => {
      const balances = outstandingFromEntries(r.ledgerEntries ?? []);
      return {
        number: r.number,
        type: r.type,
        aliquot: r.aliquot,
        ownerName: r.ownerName ?? "",
        ownerPhone: r.ownerPhone ?? "",
        ownerEmail: r.ownerEmail ?? "",
        residentName: r.residentName ?? "",
        outstandingUSD: balances.usd,
        outstandingVES: balances.ves,
      };
    });

    const filtered = type === "morosos" ? rows.filter((r) => r.outstandingUSD > 0.01) : rows;
    filename = type === "morosos" ? "morosos.csv" : "viviendas.csv";
    csv = toCsv(filtered, [
      "number",
      "type",
      "aliquot",
      "ownerName",
      "ownerPhone",
      "ownerEmail",
      "residentName",
      "outstandingUSD",
      "outstandingVES",
    ]);
  } else if (type === "payments") {
    const payments = await db.payment.findMany({
      where: { residence: { condominiumId: condominium.id } },
      include: { residence: { select: { number: true } }, bcvRate: { select: { rate: true } } },
      orderBy: { date: "desc" },
      take: 1000,
    });
    filename = "pagos.csv";
    csv = toCsv(
      payments.map((p) => ({
        date: p.date.toISOString().slice(0, 10),
        residence: p.residence.number,
        amountUSD: p.amountUSD,
        amountVES: p.amountVES,
        bcvRate: p.bcvRate.rate,
        method: p.method,
        reference: p.reference ?? "",
        concept: p.concept,
        status: p.status,
      })),
      ["date", "residence", "amountUSD", "amountVES", "bcvRate", "method", "reference", "concept", "status"],
    );
  } else if (type === "invoices") {
    const invoices = await db.invoice.findMany({
      where: { residence: { condominiumId: condominium.id } },
      include: { residence: { select: { number: true } } },
      orderBy: [{ period: "desc" }, { residence: { number: "asc" } }],
      take: 1000,
    });
    filename = "facturas.csv";
    csv = toCsv(
      invoices.map((i) => ({
        period: i.period,
        residence: i.residence.number,
        amountUSD: i.amountUSD,
        amountVES: i.amountVES,
        paidAmountUSD: i.paidAmountUSD,
        dueDate: i.dueDate.toISOString().slice(0, 10),
        status: i.status,
      })),
      ["period", "residence", "amountUSD", "amountVES", "paidAmountUSD", "dueDate", "status"],
    );
  } else if (type === "expenses") {
    const expenses = await db.expense.findMany({
      where: { condominiumId: condominium.id },
      orderBy: { date: "desc" },
      take: 1000,
    });
    filename = "gastos.csv";
    csv = toCsv(
      expenses.map((e) => ({
        date: e.date.toISOString().slice(0, 10),
        concept: e.concept,
        category: e.category,
        amountUSD: e.amountUSD,
        amountVES: e.amountVES,
        paymentMethod: e.paymentMethod ?? "",
        reference: e.reference ?? "",
        status: e.status,
      })),
      ["date", "concept", "category", "amountUSD", "amountVES", "paymentMethod", "reference", "status"],
    );
  } else {
    return NextResponse.json({ error: "Tipo de reporte inválido" }, { status: 400 });
  }

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
