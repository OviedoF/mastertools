import "server-only";
import { dbConfigured, query } from "./db";
import type { Tipo } from "./model";

/** Avisos dentro del portal (la campana). Nunca lanzan: un aviso fallido no debe frenar una solicitud. */

export type Aviso = { id: number; tipo: string; titulo: string; detalle: string | null; solicitud: string | null; leido: boolean; creado_en: Date };

export async function crearAvisos(
  usuarios: string[],
  a: { tipo: string; titulo: string; detalle?: string; solicitud?: string },
): Promise<void> {
  if (!dbConfigured() || !usuarios.length) return;
  try {
    await query(
      `insert into avisos (usuario, tipo, titulo, detalle, solicitud)
       select u, $2, $3, $4, $5 from unnest($1::uuid[]) as u`,
      [usuarios, a.tipo, a.titulo, a.detalle ?? null, a.solicitud ?? null],
    );
  } catch (e) {
    console.error("[portal] no se pudo crear el aviso:", (e as Error).message);
  }
}

/** Quién se entera de una solicitud nueva: comercial y gerencia; en emergencias también operaciones. Lectura no recibe avisos. */
export async function avisarSolicitudNueva(c: { id: string; numero: number; tipo: Tipo; nombre?: string; servicio?: string; ciudad?: string; falla?: string }) {
  if (!dbConfigured()) return;
  try {
    const roles = c.tipo === "emergencia" ? ["gerencia", "comercial", "operaciones"] : ["gerencia", "comercial"];
    const rows = await query<{ id: string }>("select id from usuarios where activo and rol = any($1::text[])", [roles]);
    const quien = [c.nombre, c.ciudad].filter(Boolean).join(" · ");
    await crearAvisos(rows.map((r) => r.id), {
      tipo: c.tipo === "emergencia" ? "emergencia" : "solicitud",
      titulo: c.tipo === "emergencia" ? `Emergencia nueva #${c.numero}` : `Cotización nueva #${c.numero}`,
      detalle: [quien, c.tipo === "emergencia" ? c.falla : c.servicio].filter(Boolean).join(" — ") || undefined,
      solicitud: c.id,
    });
  } catch (e) {
    console.error("[portal] aviso de solicitud nueva:", (e as Error).message);
  }
}

export async function contarAvisos(userId: string): Promise<number> {
  const r = await query<{ n: string }>("select count(*) as n from avisos where usuario = $1 and not leido", [userId]);
  return Number(r[0]?.n ?? 0);
}

export const listarAvisos = (userId: string, limit = 60) =>
  query<Aviso>(
    "select id, tipo, titulo, detalle, solicitud, leido, creado_en from avisos where usuario = $1 order by creado_en desc limit $2",
    [userId, limit],
  );
