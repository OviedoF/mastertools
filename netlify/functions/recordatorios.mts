import { createHash } from "node:crypto";

/**
 * Función programada de Netlify: todos los días a las 13:00 UTC (8:00 hora de Bogotá, sin horario de verano)
 * llama a /api/cron/recordatorios, que envía los seguimientos vencidos a cada responsable y el resumen a gerencia.
 * La clave sale de los mismos secretos del servidor que usa el sitio; no hay nada que configurar.
 */
export const config = { schedule: "0 13 * * *" };

export default async () => {
  const base = process.env.URL || process.env.DEPLOY_PRIME_URL;
  if (!base) {
    console.error("[recordatorios] Netlify no entregó la URL del sitio.");
    return;
  }
  const token = createHash("sha256").update(`cron:${process.env.SETTINGS_KEY || process.env.DATABASE_URL || ""}`).digest("hex");
  const res = await fetch(`${base}/api/cron/recordatorios`, { headers: { authorization: `Bearer ${token}` } });
  console.log("[recordatorios]", res.status, await res.text());
};
