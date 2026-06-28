// Lista de claves de módulos disponibles (compartido entre API y frontend)
export const MODULE_KEYS = [
  "payments",
  "announcements",
  "polls",
  "requests",
  "facilities",
  "calendar",
  "messages",
  "marketplace",
  "documents",
  "works",
  "directory",
  "security",
] as const;

export type ModuleKey = (typeof MODULE_KEYS)[number];
