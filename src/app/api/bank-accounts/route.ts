import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserContext, unauthorized, noCondominium } from "@/lib/api-context";
import { VENEZUELAN_BANKS } from "@/lib/constants";

// GET /api/bank-accounts — cuentas bancarias del condominio
export async function GET() {
  const { user, condominium } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();

  const accounts = await db.bankAccount.findMany({
    where: { condominiumId: condominium.id, active: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(accounts);
}

// POST /api/bank-accounts (solo admin)
export async function POST(request: Request) {
  const { user, condominium, membership } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();
  if (membership?.role !== "ADMIN") {
    return NextResponse.json({ error: "Solo el administrador puede registrar cuentas bancarias" }, { status: 403 });
  }

  try {
    const body = await request.json();
    if (!body.name || !body.bankName || !body.accountNumber) {
      return NextResponse.json(
        { error: "Nombre, banco y número de cuenta son obligatorios" },
        { status: 400 },
      );
    }

    // Validar banco si viene código
    const bankName = VENEZUELAN_BANKS.includes(body.bankName)
      ? body.bankName
      : body.bankName;

    const account = await db.bankAccount.create({
      data: {
        condominiumId: condominium.id,
        name: String(body.name).trim(),
        bankName,
        accountNumber: String(body.accountNumber).trim(),
        accountType: body.accountType || "CORRIENTE",
        currency: body.currency || "VES",
        phonePagoMovil: body.phonePagoMovil?.trim() || null,
        cedulaPagoMovil: body.cedulaPagoMovil?.trim() || null,
        active: body.active !== false,
      },
    });

    return NextResponse.json({ account }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al crear cuenta bancaria" },
      { status: 500 },
    );
  }
}
