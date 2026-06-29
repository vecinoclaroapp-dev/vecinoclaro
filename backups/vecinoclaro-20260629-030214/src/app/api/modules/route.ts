import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserContext, unauthorized, noCondominium } from "@/lib/api-context";
import { MODULE_KEYS } from "@/lib/modules-list";

// GET /api/modules — mapa moduleKey → enabled
export async function GET() {
  const { user, condominium } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();

  const configs = await db.moduleConfig.findMany({
    where: { condominiumId: condominium.id },
  });

  const map: Record<string, boolean> = {};
  for (const key of MODULE_KEYS) {
    const cfg = configs.find((c) => c.moduleKey === key);
    map[key] = cfg ? cfg.enabled : true; // por defecto habilitado
  }

  return NextResponse.json(map);
}

// POST /api/modules — toggle (solo admin)
export async function POST(request: Request) {
  const { user, condominium, membership } = await getUserContext();
  if (!user) return unauthorized();
  if (!condominium) return noCondominium();
  if (membership?.role !== "ADMIN") {
    return NextResponse.json({ error: "Solo el administrador puede configurar módulos" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const key = body.key;
    const enabled = !!body.enabled;
    if (!key || !MODULE_KEYS.includes(key)) {
      return NextResponse.json({ error: "Módulo inválido" }, { status: 400 });
    }

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
