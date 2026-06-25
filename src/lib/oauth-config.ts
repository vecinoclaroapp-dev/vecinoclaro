// Flag accesible desde el cliente: ¿Google OAuth está configurado?
// NEXT_PUBLIC_* se inyecta en build time como string
export const googleOAuthEnabled = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED === "true";
