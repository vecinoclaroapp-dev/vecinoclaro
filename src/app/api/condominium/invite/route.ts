import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserContext, unauthorized, noCondominium } from "@/lib/api-context";
import { randomBytes } from "crypto";

function generateCode(): string {
  // 8 chars alfanuméricos mayúsculas (sin caracteres ambiguos)
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(8);
  let out = "";
  for (let i = 0; i < 8; i++) {
    out += chars[bytes[i] % chars.length];
  }
  return out;
}

// GET /api/condominium/invite — código de invitación actual
export async function GET() {
  const { user, condominium } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();

  return NextResponse.json({
    code: condominium.inviteCode,
    condominiumName: condominium.name,
  });
}

// POST /api/condominium/invite — generar / regenerar código (solo admin)
export async function POST() {
  const { user, condominium, membership } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();
  if (membership?.role !== "ADMIN") {
    return NextResponse.json({ error: "Solo el administrador puede generar el código" }, { status: 403 });
  }

  const code = generateCode();
  const updated = await db.condominium.update({
    where: { id: condominium.id },
    data: { inviteCode: code },
  });

  return NextResponse.json({
    code: updated.inviteCode,
    condominiumName: updated.name,
  });
}
