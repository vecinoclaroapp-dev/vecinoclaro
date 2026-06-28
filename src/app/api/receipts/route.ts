import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserContext, unauthorized, noCondominium } from "@/lib/api-context";
import { analyzeReceiptWithGroq, type ReceiptOcrResult } from "@/lib/groq";

// GET /api/receipts — lista de comprobantes
export async function GET(request: Request) {
  const { user, condominium, membership } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const where: Record<string, unknown> = { condominiumId: condominium.id };
  // Residentes solo ven sus propios comprobantes
  if (membership?.role === "RESIDENT") {
    where.OR = [{ userId: user.id }, { residenceId: membership.residenceId ?? undefined }];
  }
  if (status) where.status = status;

  const receipts = await db.receipt.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json(
    receipts.map((r) => ({
      id: r.id,
      fileName: r.fileName ?? r.fileUrl,
      url: r.fileUrl,
      amount: r.amountUSD,
      currency: "USD",
      residenceId: r.residenceId,
      reference: r.reference,
      payerName: r.payerName,
      method: r.method,
      ocrStatus: r.ocrStatus,
      status: r.status === "APPROVED" ? "VERIFIED" : r.status,
      rejectionReason: r.rejectionReason,
      notes: r.notes,
      uploadedAt: r.createdAt,
    })),
  );
}

// POST /api/receipts — subir comprobante (JSON con fileName + opcional fileUrl/data)
export async function POST(request: Request) {
  const { user, condominium, membership } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();

  try {
    const body = await request.json();
    if (!body.fileName && !body.fileUrl) {
      return NextResponse.json({ error: "fileName o fileUrl requerido" }, { status: 400 });
    }

    const fileName = String(body.fileName ?? "comprobante").trim();
    const fileUrl = String(body.fileUrl ?? `/uploads/${fileName}`).trim();
    const amountUSD = body.amount != null && body.amount !== "" ? Number(body.amount) : null;

    // Si viene imagen base64, intentar OCR con Groq (si está configurado)
    let ocrResult: ReceiptOcrResult | null = null;
    let ocrStatus = "PENDING";
    if (body.data) {
      ocrResult = await analyzeReceiptWithGroq(body.data, body.mimeType);
      ocrStatus = ocrResult ? "PROCESSED" : "MANUAL";
    }

    const receipt = await db.receipt.create({
      data: {
        condominiumId: condominium.id,
        residenceId: membership?.residenceId ?? body.residenceId ?? null,
        userId: user.id,
        fileUrl,
        fileName,
        fileType: body.mimeType ?? null,
        amountUSD: ocrResult?.amountUSD ?? amountUSD,
        amountVES: ocrResult?.amountVES ?? null,
        reference: ocrResult?.reference ?? body.reference ?? null,
        payerName: ocrResult?.payerName ?? body.payerName ?? null,
        payerDoc: ocrResult?.payerDoc ?? null,
        method: ocrResult?.method ?? body.method ?? null,
        ocrRaw: ocrResult?.raw ?? null,
        ocrStatus,
        status: "PENDING",
        notes: body.notes?.trim() || null,
      },
    });

    return NextResponse.json(
      {
        receipt: {
          id: receipt.id,
          fileName: receipt.fileName,
          url: receipt.fileUrl,
          amount: receipt.amountUSD,
          status: "PENDING",
          uploadedAt: receipt.createdAt,
        },
      },
      { status: 201 },
    );
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al subir comprobante" },
      { status: 500 },
    );
  }
}
