import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserContext, unauthorized, noCondominium } from "@/lib/api-context";

// GET /api/suppliers
export async function GET() {
  const { user, condominium, membership } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();

  const suppliers = await db.supplier.findMany({
    where: { condominiumId: condominium.id },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({
    suppliers: suppliers.map((s) => ({
      id: s.id,
      name: s.name,
      rif: s.rif,
      contactName: s.contactName,
      phone: s.phone,
      email: s.email,
      bankAccount: s.bankAccount,
      bankName: s.bankName,
      category: s.category,
      active: s.active,
    })),
  });
}

// POST /api/suppliers
export async function POST(request: Request) {
  const { user, condominium } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();
  if (membership?.role !== "ADMIN") {
    return NextResponse.json({ error: "Solo el administrador puede realizar esta acción" }, { status: 403 });
  }

  try {
    const body = await request.json();
    if (!body.name) {
      return NextResponse.json({ error: "Nombre es obligatorio" }, { status: 400 });
    }

    const supplier = await db.supplier.create({
      data: {
        condominiumId: condominium.id,
        name: body.name.trim(),
        rif: body.rif?.trim() || null,
        contactName: body.contactName?.trim() || null,
        phone: body.phone?.trim() || null,
        email: body.email?.trim() || null,
        bankAccount: body.bankAccount?.trim() || null,
        bankName: body.bankName?.trim() || null,
        category: body.category || "OTRO",
        active: true,
      },
    });

    return NextResponse.json({ ok: true, supplier }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al crear proveedor" },
      { status: 500 },
    );
  }
}

// PATCH /api/suppliers - no soportado, usar endpoint individual
// Los suppliers se manejan solo con GET y POST por ahora
