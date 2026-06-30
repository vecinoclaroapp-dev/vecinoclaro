// =====================================================================
// Ledger inmutable con hash chain (SHA-256)
// ---------------------------------------------------------------------
// Cada AccountEntry genera un hash = sha256(prevHash + payload ordenado).
// El payload incluye: type, residenceId, amountUSD, amountVES, bcvRateId,
// concept, category, date. Esto garantiza integridad criptográfica.
// =====================================================================

import { createHash } from "node:crypto";
import { db } from "@/lib/db";

export type LedgerInput = {
  residenceId: string;
  type: "CREDIT" | "DEBIT";
  amountUSD: number;
  amountVES: number;
  bcvRateId: string;
  concept: string;
  category: string;
  reference?: string | null;
  date: Date;
  paymentId?: string | null;
  invoiceId?: string | null;
  serviceChargeId?: string | null;
};

function buildPayload(prevHash: string | null, data: LedgerInput): string {
  return JSON.stringify({
    prevHash: prevHash ?? "",
    type: data.type,
    residenceId: data.residenceId,
    amountUSD: data.amountUSD,
    amountVES: data.amountVES,
    bcvRateId: data.bcvRateId,
    concept: data.concept,
    category: data.category,
    reference: data.reference ?? "",
    date: data.date.toISOString(),
    paymentId: data.paymentId ?? "",
    invoiceId: data.invoiceId ?? "",
    serviceChargeId: data.serviceChargeId ?? "",
  });
}

function computeHash(prevHash: string | null, data: LedgerInput): string {
  return createHash("sha256").update(buildPayload(prevHash, data)).digest("hex");
}

// Crea un asiento contable inmutable encadenado al ultimo
// USA TRANSACCION para prevenir race condition en el hash chain
export async function appendLedgerEntry(data: LedgerInput) {
  return db.$transaction(async (tx) => {
    // Dentro de la transaccion, obtener el ultimo hash
    const last = await tx.accountEntry.findFirst({
      orderBy: { createdAt: "desc" },
      select: { hash: true },
    });

    const prevHash = last?.hash ?? null;
    const hash = computeHash(prevHash, data);

    const entry = await tx.accountEntry.create({
      data: {
        residenceId: data.residenceId,
        type: data.type,
        amountUSD: data.amountUSD,
        amountVES: data.amountVES,
        bcvRateId: data.bcvRateId,
        concept: data.concept,
        category: data.category,
        reference: data.reference ?? null,
        date: data.date,
        hash,
        prevHash,
        paymentId: data.paymentId ?? null,
        invoiceId: data.invoiceId ?? null,
        serviceChargeId: data.serviceChargeId ?? null,
      },
      include: { bcvRate: true, residence: true },
    });

    return entry;
  });
}

// Verifica la integridad de toda la cadena (auditoria)
export async function verifyLedgerIntegrity(): Promise<{
  ok: boolean;
  brokenAt?: string;
  total: number;
}> {
  const entries = await db.accountEntry.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      hash: true,
      prevHash: true,
      type: true,
      residenceId: true,
      amountUSD: true,
      amountVES: true,
      bcvRateId: true,
      concept: true,
      category: true,
      reference: true,
      date: true,
      paymentId: true,
      invoiceId: true,
      serviceChargeId: true,
    },
  });

  let prev: string | null = null;
  for (const e of entries) {
    const expected = computeHash(prev, {
      residenceId: e.residenceId,
      type: e.type as "CREDIT" | "DEBIT",
      amountUSD: e.amountUSD,
      amountVES: e.amountVES,
      bcvRateId: e.bcvRateId,
      concept: e.concept,
      category: e.category,
      reference: e.reference,
      date: e.date,
      paymentId: e.paymentId,
      invoiceId: e.invoiceId,
      serviceChargeId: e.serviceChargeId,
    });
    if (expected !== e.hash) {
      return { ok: false, brokenAt: e.id, total: entries.length };
    }
    prev = e.hash;
  }
  return { ok: true, total: entries.length };
}
