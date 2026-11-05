/**
 * Configuración de Sanity. Si no hay proyecto configurado, el sitio usa el
 * contenido estático de src/content como respaldo.
 */
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2026-11-01";
export const studioUrl = "/studio";

export const isSanityConfigured = projectId.length > 0;
