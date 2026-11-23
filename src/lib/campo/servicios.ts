import "server-only";
import type { PoolClient } from "pg";
import { crearAvisos } from "@/lib/portal/avisos";
import { one, query, tx } from "@/lib/portal/db";
import { ErrorCampo, type UsuarioCampo } from "./auth";

/** Servicios, catálogos y operaciones de la app de campo. */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** Ids de archivo generados en el celular: "foto-<uuid>", "firma-<uuid>", "doc-ats-<uuid>"… */
const ARCHIVO = /^[a-z][a-z-]{1,20}-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const esUuid = (s: unknown): s is string => typeof s === "string" && UUID.test(s);
export const esArchivo = (s: unknown): s is string => typeof s === "string" && ARCHIVO.test(s);

type FilaServicio = {
  id: string; codigo: string; cliente: string; direccion: string; lat: number | null; lng: number | null;
  id_frontera: string | null; comercializador: string | null; departamento: string; ciudad: string; actividad: string;
  fecha_hora: Date; descripcion: string | null; tecnico: string | null; tecnico_nombre: string | null;
  alturas: boolean; vehiculo: boolean; estado: string; inicio_en: Date | null; fin_en: Date | null;
  motivo_cancelacion: string | null; actualizado_en: Date; ats_enviado: boolean; preop_enviado: boolean;
  documentos: { tipo: string; archivo: string; generado_en: string }[] | null;
};

/** Servicios del técnico: los abiertos y los de los últimos 30 días. Nunca los de otro técnico. */
export async function serviciosDe(u: UsuarioCampo) {
  const filas = await query<FilaServicio>(
    `select s.*, t.nombre as tecnico_nombre,
            exists(select 1 from campo_ats a where a.servicio = s.id) as ats_enviado,
            exists(select 1 from campo_preoperacionales p where p.servicio = s.id) as preop_enviado,
            (select json_agg(json_build_object('tipo', d.tipo, 'archivo', d.archivo, 'generado_en', d.generado_en))
               from campo_documentos d where d.servicio = s.id) as documentos
       from campo_servicios s left join usuarios t on t.id = s.tecnico
      where s.tecnico = $1
        and (s.estado in ('programado','notificado','en_sitio','en_ejecucion','reprogramado') or s.fecha_hora > now() - interval '30 days')
      order by s.fecha_hora
      limit 300`,
    [u.id],
  );
  return filas.map((s) => ({
    id: s.id,
    codigo: s.codigo,
    cliente: s.cliente,
    direccion: s.direccion,
    lat: s.lat,
    lng: s.lng,
    id_frontera: s.id_frontera ?? "",
    comercializador: s.comercializador ?? "",
    departamento: s.departamento,
    ciudad: s.ciudad,
    actividad: s.actividad,
    fecha_hora: s.fecha_hora.toISOString(),
    descripcion: s.descripcion ?? "",
    tecnico_id: s.tecnico,
    tecnico_nombre: s.tecnico_nombre ?? "",
    alturas: s.alturas,
    vehiculo: s.vehiculo,
    estado: s.estado,
    inicio_en: s.inicio_en?.toISOString() ?? null,
    fin_en: s.fin_en?.toISOString() ?? null,
    ats_enviado: s.ats_enviado,
    preop_enviado: s.preop_enviado,
    motivo_cancelacion: s.motivo_cancelacion,
    actualizado_en: s.actualizado_en.toISOString(),
    documentos: (s.documentos ?? []).map((d) => ({ tipo: d.tipo, url: `/api/campo/archivos/${d.archivo}`, generado_en: d.generado_en })),
  }));
}

/** Catálogos de los formularios. Las listas vacías se omiten y la app usa su copia de fábrica. */
export async function catalogos() {
  const items = await query<{ id: string; lista: string; texto: string; critico: boolean; ayuda: string | null; v: Date }>(
    "select id, lista, texto, critico, ayuda, actualizado_en as v from campo_items where activo order by lista, orden, texto",
  );
  const out: Record<string, unknown> = {};
  let version = 0;
  for (const i of items) {
    version = Math.max(version, i.v.getTime());
    if (i.lista === "peligros" || i.lista === "resultados") {
      ((out[i.lista] ??= []) as string[]).push(i.texto);
    } else {
      ((out[i.lista] ??= []) as unknown[]).push({ id: i.id, texto: i.texto, critico: i.critico, ...(i.ayuda ? { ayuda: i.ayuda } : {}) });
    }
  }
  return { version: version ? `servidor-${version}` : "fabrica-1", ...out };
}

/** El servicio debe estar asignado al técnico de la sesión. */
export async function servicioPropio(u: UsuarioCampo, servicioId: unknown) {
  if (!esUuid(servicioId)) throw new ErrorCampo("Servicio inválido.");
  const s = await one<{ id: string; codigo: string; cliente: string; estado: string }>(
    "select id, codigo, cliente, estado from campo_servicios where id = $1 and tecnico = $2",
    [servicioId, u.id],
  );
  if (!s) throw new ErrorCampo("Este servicio no está asignado a usted.", 403);
  return s;
}

export type Operacion = { id: string; tipo: string; servicio: string; creado_en: string; datos: Record<string, unknown> };

const TIPOS = ["inicio", "ats", "preoperacional", "alerta", "evidencia", "documento", "finalizar", "no_ejecutado"] as const;

const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);
const txt = (v: unknown, max = 5000) => (typeof v === "string" ? v.slice(0, max) : null);
const fecha = (v: unknown) => {
  const d = typeof v === "string" ? new Date(v) : null;
  return d && !Number.isNaN(d.getTime()) ? d : null;
};

/** Estados que el técnico puede mover. Un servicio cancelado por el administrador no cambia de estado. */
const ABIERTO = "estado not in ('cancelado','finalizado','no_ejecutado')";

/**
 * Registra una operación de la app una sola vez (por id) y la aplica. Reenviarla no hace nada.
 * Devuelve false si ya estaba registrada.
 */
export async function aplicarOperacion(u: UsuarioCampo, op: Operacion): Promise<boolean> {
  if (!esUuid(op.id)) throw new ErrorCampo("Operación inválida.");
  if (!(TIPOS as readonly string[]).includes(op.tipo)) throw new ErrorCampo(`Tipo de operación desconocido: ${op.tipo}`);
  const s = await servicioPropio(u, op.servicio);
  const d = op.datos ?? {};
  const creado = fecha(op.creado_en) ?? new Date();

  const nueva = await tx(async (c) => {
    const r = await c.query(
      "insert into campo_operaciones (id, servicio, usuario, tipo, datos, creado_en) values ($1,$2,$3,$4,$5,$6) on conflict (id) do nothing",
      [op.id, s.id, u.id, op.tipo, JSON.stringify(d), creado],
    );
    if (!r.rowCount) return false;
    await aplicar(c, u, s.id, op.tipo, d);
    await c.query("update campo_servicios set actualizado_en = now() where id = $1", [s.id]);
    return true;
  });

  if (nueva && op.tipo === "alerta") await avisarAlerta(s, d);
  return nueva;
}

async function aplicar(c: PoolClient, u: UsuarioCampo, servicio: string, tipo: string, d: Record<string, unknown>) {
  switch (tipo) {
    case "inicio":
      await c.query(
        `update campo_servicios set inicio_en = coalesce(inicio_en, $2), inicio_lat = coalesce(inicio_lat, $3), inicio_lng = coalesce(inicio_lng, $4),
                estado = case when estado in ('programado','notificado','reprogramado') then 'en_sitio' else estado end
          where id = $1`,
        [servicio, fecha(d.en) ?? new Date(), num(d.lat), num(d.lng)],
      );
      break;
    case "ats":
    case "preoperacional": {
      const tabla = tipo === "ats" ? "campo_ats" : "campo_preoperacionales";
      // Inmutables: si ya existe, el reenvío no lo reemplaza.
      await c.query(
        `insert into ${tabla} (servicio, respuestas, firma, firmado_en, usuario) values ($1,$2,$3,$4,$5) on conflict (servicio) do nothing`,
        [servicio, JSON.stringify(d), typeof d.firma === "string" ? d.firma : null, fecha(d.firmado_en), u.id],
      );
      await c.query(
        `update campo_servicios set estado = 'en_ejecucion'
          where id = $1 and estado in ('programado','notificado','en_sitio','reprogramado')
            and exists(select 1 from campo_ats where servicio = $1) and exists(select 1 from campo_preoperacionales where servicio = $1)`,
        [servicio],
      );
      break;
    }
    case "alerta":
      await c.query("insert into campo_alertas (servicio, origen, bloqueante, motivos) values ($1,$2,$3,$4)", [
        servicio,
        txt(d.origen, 40) ?? "app",
        d.bloqueante === true,
        JSON.stringify(Array.isArray(d.motivos) ? d.motivos.slice(0, 50) : []),
      ]);
      break;
    case "evidencia":
      if (!esUuid(d.id) || !esArchivo(d.archivo)) throw new ErrorCampo("Evidencia inválida.");
      await c.query(
        "insert into campo_evidencias (id, servicio, archivo, tomada_en, comentario) values ($1,$2,$3,$4,$5) on conflict (id) do update set comentario = excluded.comentario",
        [d.id, servicio, d.archivo, fecha(d.tomada_en) ?? new Date(), txt(d.comentario, 500)],
      );
      break;
    case "documento": {
      const t = d.tipo;
      if ((t !== "informe" && t !== "ats" && t !== "preoperacional") || !esArchivo(d.archivo)) throw new ErrorCampo("Documento inválido.");
      await c.query(
        "insert into campo_documentos (servicio, tipo, archivo) values ($1,$2,$3) on conflict (servicio, tipo) do update set archivo = excluded.archivo, generado_en = now()",
        [servicio, t, d.archivo],
      );
      break;
    }
    case "finalizar":
    case "no_ejecutado": {
      const fin = (d.fin ?? {}) as Record<string, unknown>;
      await c.query(
        `update campo_servicios set
            estado = case when ${ABIERTO} then $2 else estado end,
            fin_en = coalesce(fin_en, $3), fin_lat = $4, fin_lng = $5,
            observacion = $6, resultado = $7, resultado_detalle = $8, no_ejecutado_motivo = $9
          where id = $1`,
        [
          servicio,
          tipo === "finalizar" ? "finalizado" : "no_ejecutado",
          fecha(fin.en) ?? new Date(),
          num(fin.lat),
          num(fin.lng),
          txt(tipo === "finalizar" ? d.observacion : d.detalle),
          tipo === "finalizar" ? txt(d.resultado, 200) : null,
          tipo === "finalizar" ? txt(d.resultado_detalle) : null,
          tipo === "no_ejecutado" ? txt(d.motivo, 200) : null,
        ],
      );
      break;
    }
  }
}

/** Respuestas críticas del ATS o herramientas en mal estado: aviso en la campana del portal a gerencia y operaciones. */
async function avisarAlerta(s: { id: string; codigo: string; cliente: string }, d: Record<string, unknown>) {
  try {
    const quienes = await query<{ id: string }>("select id from usuarios where activo and rol in ('gerencia','operaciones')");
    const motivos = Array.isArray(d.motivos) ? d.motivos.map(String) : [];
    await crearAvisos(
      quienes.map((q) => q.id),
      {
        tipo: "campo_alerta",
        titulo: d.bloqueante === true ? `ATS bloqueado en ${s.codigo}` : `Novedad en el pre-operacional de ${s.codigo}`,
        detalle: `${s.cliente}: ${motivos.join("; ")}`.slice(0, 900),
      },
    );
  } catch (e) {
    console.error("[campo] aviso de alerta:", (e as Error).message);
  }
}
