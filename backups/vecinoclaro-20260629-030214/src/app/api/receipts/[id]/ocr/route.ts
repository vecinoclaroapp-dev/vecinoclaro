import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserContext, unauthorized, noCondominium } from "@/lib/api-context";
import { analyzeReceiptWithGroq } from "@/lib/groq";

// POST /api/receipts/[id]/ocr — re-analizar comprobante con Groq
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, condominium, membership } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();
  if (membership?.role === "RESIDENT") {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  const { id } = await params;

  const receipt = await db.receipt.findFirst({
    where: { id, condominiumId: condominium.id },
  });
  if (!receipt) {
    return NextResponse.json({ error: "Comprobante no encontrado" }, { status: 404 });
  }

  const result = await analyzeReceiptWithGroq(receipt.fileUrl, receipt.fileType ?? undefined);

  if (!result) {
    // Sin API key → marcar como manual
    await db.receipt.update({
      where: { id },
      data: { ocrStatus: "MANUAL" },
    });
    return NextResponse.json({
      ok: false,
      message: "OCR no disponible (GROQ_API_KEY no configurada). Ingrese los datos manualmente.",
      ocrStatus: "MANUAL",
    });
  }

  const updated = await db.receipt.update({
    where: { id },
    data: {
      ocrStatus: "PROCESSED",
      ocrRaw: result.raw ?? null,
      amountUSD: result.amountUSD ?? receipt.amountUSD,
      amountVES: result.amountVES ?? receipt.amountVES,
      reference: result.reference ?? receipt.reference,
      payerName: result.payerName ?? receipt.payerName,
      payerDoc: result.payerDoc ?? receipt.payerDoc,
      method: result.method ?? receipt.method,
    },
  });

  return NextResponse.json({ ok: true, receipt: updated, ocr: result });
}
