import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserContext, unauthorized, noCondominium } from "@/lib/api-context";
import { MODULE_KEYS } from "@/lib/modules-list";

// PATCH /api/modules/[key] — toggle módulo (solo admin)
export async function PATCH(request: Request, { params }: { params: Promise<{ key: string }> }) {
  const { user, condominium, membership } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();
  if (membership?.role !== "ADMIN") {
    return NextResponse.json({ error: "Solo el administrador puede configurar módulos" }, { status: 403 });
  }

  const { key } = await params;
  if (!(MODULE_KEYS as readonly string[]).includes(key)) {
    return NextResponse.json({ error: "Módulo inválido" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const enabled = !!body.enabled;

    const config = await db.moduleConfig.upsert({
      where: {
        condominiumId_moduleKey: { condominiumId: condominium.id, moduleKey: key },
      },
      update: { enabled },
      create: { condominiumId: condominium.id, moduleKey: key, enabled },
    });

    return NextResponse.json({ module: key, enabled: config.enabled });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al actualizar módulo" },
      { status: 500 },
    );
  }
}
