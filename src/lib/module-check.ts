// Helper para verificar si un módulo está activo en un condominio
import { db } from "@/lib/db";

export async function isModuleEnabled(condominiumId: string, moduleKey: string): Promise<boolean> {
  const config = await db.moduleConfig.findUnique({
    where: {
      condominiumId_moduleKey: { condominiumId, moduleKey },
    },
    select: { enabled: true },
  });
  // Default: habilitado si no hay config
  return config?.enabled ?? true;
}

export async function requireModule(condominiumId: string, moduleKey: string): Promise<boolean> {
  const enabled = await isModuleEnabled(condominiumId, moduleKey);
  if (!enabled) {
    throw new Error(`El módulo ${moduleKey} está desactivado en este condominio`);
  }
  return true;
}
