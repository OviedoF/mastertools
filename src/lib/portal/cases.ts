import "server-only";
import { dbConfigured, one, query } from "./db";
import { avisarSolicitudNueva } from "./avisos";
import { CIERRE, PLAZO_PRIMER_CONTACTO_H, type Estado, type Tipo } from "./model";

/* ------------------------------------------------------------------ */
/* Guardar una solicitud que llega del sitio                           */
/* ------------------------------------------------------------------ */

export type NewCase = {
  tipo: Tipo;
  origen: "form" | "manta";
  nombre?: string; empresa?: string; telefono?: string; correo?: string; ciudad?: string; direccion?: string;
  servicio?: string; plazo?: string; mensaje?: string; falla?: string; riesgo?: string;
  pagina?: string; conversacion?: string;
  adjunto?: { filename: string; content: Buffer; contentType?: string };
};

/** Guarda la solicitud y su evento "creada". Nunca lanza: si la base falla, el correo sigue siendo la red de seguridad. */
export async function saveCase(c: NewCase): Promise<{ id: string; numero: number } | null> {
  if (!dbConfigured()) return null;
  try {
    const row = await one<{ id: string; numero: string }>(
      `insert into solicitudes (tipo, origen, nombre, empresa, telefono, correo, ciudad, direccion, servicio, plazo, mensaje, falla, riesgo, pagina, conversacion)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) returning id, numero`,
      [c.tipo, c.origen, c.nombre, c.empresa, c.telefono, c.correo, c.ciudad, c.direccion, c.servicio, c.plazo, c.mensaje, c.falla, c.riesgo, c.pagina, c.conversacion].map((v) => v ?? null),
    );
    if (!row) return null;
    await query("insert into eventos (solicitud, tipo, detalle) values ($1,'creada',$2)", [row.id, JSON.stringify({ origen: c.origen })]);
    if (c.adjunto) {
      await query(
        "insert into adjuntos (solicitud, nombre, tipo, tamano, datos) values ($1,$2,$3,$4,$5)",
        [row.id, c.adjunto.filename, c.adjunto.contentType ?? null, c.adjunto.content.length, c.adjunto.content],
      );
      await query("insert into eventos (solicitud, tipo, detalle) values ($1,'adjunto',$2)", [row.id, JSON.stringify({ nombre: c.adjunto.filename })]);
    }
    await avisarSolicitudNueva({ id: row.id, numero: Number(row.numero), tipo: c.tipo, nombre: c.nombre, servicio: c.servicio, ciudad: c.ciudad, falla: c.falla });
    return { id: row.id, numero: Number(row.numero) };
  } catch (e) {
    console.error("[portal] no se pudo guardar la solicitud:", (e as Error).message);
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Bandeja                                                             */
/* ------------------------------------------------------------------ */

export type Filtros = {
  q?: string;
  tipo?: string;
  estado?: string; // un estado, "abiertas" o "cerradas"
  responsable?: string; // uuid, "sin" o "mios"
  servicio?: string;
  ciudad?: string;
  desde?: string;
  hasta?: string;
  vencidas?: string;
  page?: number;
};

export type CaseRow = {
  id: string; numero: number; creada_en: Date; tipo: Tipo; origen: "form" | "manta"; estado: Estado;
  nombre: string | null; empresa: string | null; telefono: string | null; ciudad: string | null; servicio: string | null;
  falla: string | null; responsable: string | null; responsable_nombre: string | null; vencida: boolean;
  seguimiento_vencido: boolean;
};

export const PAGE_SIZE = 25;
const cerrados = CIERRE.map((e) => `'${e}'`).join(",");

export const VENCIDA = `(s.primer_contacto_en is null and s.cerrada_en is null and s.estado = 'nueva' and
  s.creada_en < now() - make_interval(hours => case s.tipo when 'emergencia' then ${PLAZO_PRIMER_CONTACTO_H.emergencia} else ${PLAZO_PRIMER_CONTACTO_H.cotizacion} end))`;

export async function listCases(f: Filtros, userId: string): Promise<{ rows: CaseRow[]; total: number }> {
  const where: string[] = [];
  const p: unknown[] = [];
  const add = (v: unknown) => (p.push(v), `$${p.length}`);

  if (f.tipo === "cotizacion" || f.tipo === "emergencia") where.push(`s.tipo = ${add(f.tipo)}`);
  if (f.estado === "abiertas") where.push(`s.estado not in (${cerrados})`);
  else if (f.estado === "cerradas") where.push(`s.estado in (${cerrados})`);
  else if (f.estado) where.push(`s.estado = ${add(f.estado)}`);
  if (f.responsable === "sin") where.push("s.responsable is null");
  else if (f.responsable === "mios") where.push(`s.responsable = ${add(userId)}`);
  else if (f.responsable) where.push(`s.responsable = ${add(f.responsable)}::uuid`);
  if (f.servicio) where.push(`s.servicio = ${add(f.servicio)}`);
  if (f.ciudad) where.push(`s.ciudad ilike ${add(`%${f.ciudad}%`)}`);
  if (f.desde) where.push(`s.creada_en >= ${add(f.desde)}::date`);
  if (f.hasta) where.push(`s.creada_en < ${add(f.hasta)}::date + 1`);
  if (f.vencidas) where.push(VENCIDA);
  if (f.q?.trim()) {
    const t = add(`%${f.q.trim()}%`);
    where.push(`(s.nombre ilike ${t} or s.empresa ilike ${t} or s.telefono ilike ${t} or s.correo ilike ${t} or s.mensaje ilike ${t} or s.falla ilike ${t} or s.numero::text = ${add(f.q.trim().replace(/^#/, ""))})`);
  }
  const w = where.length ? `where ${where.join(" and ")}` : "";
  const page = Math.max(1, f.page ?? 1);

  const [rows, count] = await Promise.all([
    query<CaseRow>(
      `select s.id, s.numero::int, s.creada_en, s.tipo, s.origen, s.estado, s.nombre, s.empresa, s.telefono, s.ciudad, s.servicio, s.falla,
              s.responsable, u.nombre as responsable_nombre, ${VENCIDA} as vencida,
              exists (select 1 from seguimientos g where g.solicitud = s.id and not g.hecho and g.programado_para < now()) as seguimiento_vencido
         from solicitudes s left join usuarios u on u.id = s.responsable
         ${w}
        order by (s.estado not in (${cerrados})) desc, (s.tipo = 'emergencia' and s.estado = 'nueva') desc, s.creada_en desc
        limit ${PAGE_SIZE} offset ${(page - 1) * PAGE_SIZE}`,
      p,
    ),
    one<{ n: string }>(`select count(*) as n from solicitudes s ${w}`, p),
  ]);
  return { rows, total: Number(count?.n ?? 0) };
}

export type Resumen = {
  nuevas: number; sin_asignar: number; abiertas: number; vencidas: number;
  emergencias_nuevas: number; mis_casos: number; mis_seguimientos_vencidos: number; seguimientos_hoy: number;
};

export async function resumen(userId: string): Promise<Resumen> {
  const r = await one<Record<keyof Resumen, string>>(
    `select
       count(*) filter (where s.estado = 'nueva') as nuevas,
       count(*) filter (where s.responsable is null and s.estado not in (${cerrados})) as sin_asignar,
       count(*) filter (where s.estado not in (${cerrados})) as abiertas,
       count(*) filter (where ${VENCIDA}) as vencidas,
       count(*) filter (where s.tipo = 'emergencia' and s.estado = 'nueva') as emergencias_nuevas,
       count(*) filter (where s.responsable = $1 and s.estado not in (${cerrados})) as mis_casos,
       (select count(*) from seguimientos g where g.responsable = $1 and not g.hecho and g.programado_para < now()) as mis_seguimientos_vencidos,
       (select count(*) from seguimientos g where g.responsable = $1 and not g.hecho
          and g.programado_para >= now() and g.programado_para < (date_trunc('day', now() at time zone 'America/Bogota') + interval '1 day') at time zone 'America/Bogota') as seguimientos_hoy
     from solicitudes s`,
    [userId],
  );
  const n = (k: keyof Resumen) => Number(r?.[k] ?? 0);
  return {
    nuevas: n("nuevas"), sin_asignar: n("sin_asignar"), abiertas: n("abiertas"), vencidas: n("vencidas"),
    emergencias_nuevas: n("emergencias_nuevas"), mis_casos: n("mis_casos"),
    mis_seguimientos_vencidos: n("mis_seguimientos_vencidos"), seguimientos_hoy: n("seguimientos_hoy"),
  };
}

export async function opcionesFiltro() {
  const [servicios, usuarios] = await Promise.all([
    query<{ servicio: string }>("select distinct servicio from solicitudes where servicio is not null order by 1"),
    query<{ id: string; nombre: string }>("select id, nombre from usuarios where activo order by nombre"),
  ]);
  return { servicios: servicios.map((s) => s.servicio), usuarios };
}

/* ------------------------------------------------------------------ */
/* Ficha del caso                                                      */
/* ------------------------------------------------------------------ */

export type CaseFull = CaseRow & {
  correo: string | null; direccion: string | null; plazo: string | null; mensaje: string | null; riesgo: string | null;
  pagina: string | null; conversacion: string | null; cerrada_en: Date | null; primer_contacto_en: Date | null;
};

export async function getCase(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const c = await one<CaseFull>(
    `select s.*, s.numero::int as numero, u.nombre as responsable_nombre, ${VENCIDA} as vencida, false as seguimiento_vencido
       from solicitudes s left join usuarios u on u.id = s.responsable where s.id = $1`,
    [id],
  );
  if (!c) return null;
  const [notas, eventos, adjuntos, seguimientos] = await Promise.all([
    query<{ id: number; texto: string; creada_en: Date; autor: string }>(
      "select n.id, n.texto, n.creada_en, u.nombre as autor from notas n join usuarios u on u.id = n.usuario where n.solicitud = $1 order by n.creada_en desc", [id]),
    query<{ id: number; tipo: string; detalle: Record<string, string>; creado_en: Date; autor: string | null }>(
      "select e.id, e.tipo, e.detalle, e.creado_en, u.nombre as autor from eventos e left join usuarios u on u.id = e.usuario where e.solicitud = $1 order by e.creado_en desc, e.id desc", [id]),
    query<{ id: number; nombre: string; tipo: string | null; tamano: number; creado_en: Date; autor: string | null }>(
      "select a.id, a.nombre, a.tipo, a.tamano, a.creado_en, u.nombre as autor from adjuntos a left join usuarios u on u.id = a.usuario where a.solicitud = $1 order by a.creado_en desc", [id]),
    query<{ id: number; programado_para: Date; motivo: string | null; hecho: boolean; cerrado_en: Date | null; responsable_nombre: string }>(
      "select g.id, g.programado_para, g.motivo, g.hecho, g.cerrado_en, u.nombre as responsable_nombre from seguimientos g join usuarios u on u.id = g.responsable where g.solicitud = $1 order by g.hecho, g.programado_para", [id]),
  ]);
  return { caso: c, notas, eventos, adjuntos, seguimientos };
}

/* ------------------------------------------------------------------ */
/* Agenda de seguimientos                                              */
/* ------------------------------------------------------------------ */

export async function misSeguimientos(userId: string) {
  return query<{ id: number; solicitud: string; numero: number; nombre: string | null; motivo: string | null; programado_para: Date }>(
    `select g.id, g.solicitud, s.numero::int as numero, s.nombre, g.motivo, g.programado_para
       from seguimientos g join solicitudes s on s.id = g.solicitud
      where g.responsable = $1 and not g.hecho order by g.programado_para limit 8`,
    [userId],
  );
}
