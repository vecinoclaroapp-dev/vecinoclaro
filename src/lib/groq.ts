// =====================================================================
// Análisis de comprobantes de pago con Groq Vision (si está configurado)
// =====================================================================

export type ReceiptOcrResult = {
  amountUSD?: number;
  amountVES?: number;
  reference?: string;
  payerName?: string;
  payerDoc?: string;
  method?: string;
  bank?: string;
  raw?: string;
};

/**
 * Analiza una imagen de comprobante con Groq Vision.
 * Si no hay API key configurada, retorna null (la API debe manejarlo).
 */
export async function analyzeReceiptWithGroq(
  _fileUrl: string,
  _mimeType?: string,
): Promise<ReceiptOcrResult | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return null;
  }
  try {
    // Implementación real requeriría fetch a https://api.groq.com/openai/v1/chat/completions
    // con modelo vision (p.ej. llama-3.2-90b-vision-preview) y la imagen en base64.
    // Por ahora retornamos null para que la API guarde el comprobante sin OCR.
    return null;
  } catch (e) {
    console.error("[groq] error analizando comprobante:", e);
    return null;
  }
}
