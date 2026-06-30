import { NextResponse } from "next/server";
import { requireModule } from "@/lib/module-check";
import { db } from "@/lib/db";
import { getUserContext, unauthorized, noCondominium } from "@/lib/api-context";

// GET /api/marketplace
export async function GET(request: Request) {
  const { user, condominium } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();
  await requireModule(condominium.id, "marketplace");

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  const where: Record<string, unknown> = {
    condominiumId: condominium.id,
    status: "ACTIVE",
  };
  if (category) where.category = category;

  const listings = await db.marketplaceListing.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json(listings);
}

// POST /api/marketplace
export async function POST(request: Request) {
  const { user, condominium } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();

  try {
    const body = await request.json();
    if (!body.title || !body.price) {
      return NextResponse.json({ error: "Título y precio son obligatorios" }, { status: 400 });
    }

    const listing = await db.marketplaceListing.create({
      data: {
        condominiumId: condominium.id,
        userId: user.id,
        title: String(body.title).trim(),
        description: body.description?.trim() || null,
        price: Number(body.price),
        currency: body.currency || "USD",
        category: body.category || "Otros",
        condition: body.condition || "USED",
        sellerName: body.sellerName?.trim() || user.name,
        sellerPhone: body.sellerPhone?.trim() || null,
        location: body.location?.trim() || null,
        imageUrl: body.imageUrl?.trim() || null,
        status: "ACTIVE",
      },
    });

    return NextResponse.json({ listing }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al publicar anuncio" },
      { status: 500 },
    );
  }
}
