import { NextResponse } from "next/server";
import { requireModule } from "@/lib/module-check";
import { db } from "@/lib/db";
import { getUserContext, unauthorized, noCondominium } from "@/lib/api-context";

// GET /api/documents
export async function GET(request: Request) {
  const { user, condominium, membership } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();
  await requireModule(condominium.id, "documents");

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  const where: Record<string, unknown> = { condominiumId: condominium.id };
  // Residentes solo ven documentos visibles
  if (membership?.role === "RESIDENT") where.visible = true;
  if (category) where.category = category;

  const documents = await db.document.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json(documents);
}

// POST /api/documents
export async function POST(request: Request) {
  const { user, condominium, membership } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();
  if (membership?.role === "RESIDENT") {
    return NextResponse.json({ error: "Sin permisos para subir documentos" }, { status: 403 });
  }

  try {
    const body = await request.json();
    if (!body.title || !body.fileUrl) {
      return NextResponse.json({ error: "Título y archivo son obligatorios" }, { status: 400 });
    }

    const doc = await db.document.create({
      data: {
        condominiumId: condominium.id,
        title: String(body.title).trim(),
        description: body.description?.trim() || null,
        category: body.category || "OTRO",
        fileUrl: String(body.fileUrl),
        fileType: body.fileType || null,
        fileSize: body.fileSize ? Number(body.fileSize) : null,
        visible: body.visible !== false,
        uploadedById: user.id,
      },
    });

    return NextResponse.json({ document: doc }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al subir documento" },
      { status: 500 },
    );
  }
}
