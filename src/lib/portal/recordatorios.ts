import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { layout, mailConfigured, sendMail } from "../mail";
import { crearAvisos } from "./avisos";
import { VENCIDA } from "./cases";
import { dbConfigured, one, query } from "./db";

/**
 * Recordatorio diario de las 8:00 (hora de Bogotá): cada responsable recibe por correo y en el portal sus seguimientos
 * vencidos, y gerencia recibe un resumen. Lo dispara una función programada de Netlify (netlify/functions/recordatorios.mts)
 * y, como respaldo, la primera visita al portal después de las 8:00. Un registro por día evita enviarlo dos veces.
 */

/** Clave con la que la función programada se identifica ante /api/cron/recordatorios. No necesita configuración: sale de los secretos del servidor. */
export const cronToken = () => createHash("sha256").update(`cron:${process.env.SETTINGS_KEY || process.env.DATABASE_URL || ""}`).digest("hex");

export function cronValido(header: string | null): boolean {
  const esperado = Buffer.from(`Bearer ${cronToken()}`);
  const recibido = Buffer.from(header ?? "");
  return recibido.length === esperado.length && timingSafeEqual(recibido, esperado);
}

const base = () => process.env.NEXT_PUBLIC_SITE_URL || process.env.URL || "";
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] ?? c);
const fmt = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Bogota" });

type Venc = { id: number; programado_para: Date; motivo: string | null; responsable: string; nombre: string; correo: string; solicitud: string; numero: number; cliente: string | null; tipo: string };

export type ResultadoRecordatorios = { ejecutado: boolean; motivo?: string; seguimientos: number; responsables: number; correos: number; resumenGerencia: boolean };

export async function ejecutarRecordatorios(opciones: { forzar?: boolean } = {}): Promise<ResultadoRecordatorios> {
  const vacio = (motivo: string): ResultadoRecordatorios => ({ ejecutado: false, motivo, seguimientos: 0, responsables: 0, correos: 0, resumenGerencia: false });
  if (!dbConfigured()) return vacio("Sin base de datos.");

  const marca = await one<{ dia: string }>(
    "insert into recordatorios (dia) values ((now() at time zone 'America/Bogota')::date) on conflict (dia) do nothing returning dia::text",
  );
  if (!marca && !opciones.forzar) return vacio("Ya se envió hoy.");

  const vencidos = await query<Venc>(
    `select g.id, g.programado_para, g.motivo, g.responsable, u.nombre, u.correo, s.id as solicitud, s.numero::int as numero, s.nombre as cliente, s.tipo
       from seguimientos g
       join solicitudes s on s.id = g.solicitud
       join usuarios u on u.id = g.responsable and u.activo
      where not g.hecho and g.programado_para < now() and s.cerrada_en is null
      order by g.programado_para`,
  );
  const [casos] = await query<{ vencidas: string; sin_responsable: string }>(
    `select count(*) filter (where ${VENCIDA}) as vencidas,
            count(*) filter (where s.responsable is null and s.cerrada_en is null) as sin_responsable
       from solicitudes s`,
  );
  const nVencidas = Number(casos?.vencidas ?? 0);
  const nSin = Number(casos?.sin_responsable ?? 0);

  const correo = await mailConfigured();
  let correos = 0;

  // 1) Cada responsable: sus seguimientos vencidos
  const porPersona = new Map<string, Venc[]>();
  for (const v of vencidos) porPersona.set(v.responsable, [...(porPersona.get(v.responsable) ?? []), v]);
  for (const [uid, lista] of porPersona) {
    const titulo = lista.length === 1 ? "Tiene 1 seguimiento vencido" : `Tiene ${lista.length} seguimientos vencidos`;
    await crearAvisos([uid], {
      tipo: "seguimiento",
      titulo,
      detalle: lista.slice(0, 3).map((v) => `#${v.numero}${v.motivo ? ` ${v.motivo}` : ""}`).join(" · "),
      solicitud: lista.length === 1 ? lista[0].solicitud : undefined,
    });
    if (correo) {
      const filas = lista.map((v) => ({
        txt: `#${v.numero} ${v.cliente ?? ""} · ${v.motivo ?? "Seguimiento"} · era para ${fmt.format(new Date(v.programado_para))}\n${base()}/portal/casos/${v.solicitud}`,
        html: `<li style="margin:0 0 10px"><a href="${base()}/portal/casos/${v.solicitud}" style="color:#0066B2;font-weight:600">#${v.numero} ${esc(v.cliente ?? "")}</a><br><span style="color:#8A8F98">${esc(v.motivo ?? "Seguimiento")} · era para ${esc(fmt.format(new Date(v.programado_para)))}</span></li>`,
      }));
      try {
        await sendMail({
          to: lista[0].correo,
          subject: `${titulo} · Portal Master Tools`,
          text: `Buenos días, ${lista[0].nombre.split(" ")[0]}.\n\n${titulo}:\n\n${filas.map((f) => f.txt).join("\n\n")}`,
          html: layout(titulo, `<p style="margin:0 0 12px">Buenos días, ${esc(lista[0].nombre.split(" ")[0])}. Estos seguimientos pasaron su fecha:</p><ul style="margin:0;padding-left:18px">${filas.map((f) => f.html).join("")}</ul>`),
        });
        correos++;
      } catch (e) {
        console.error("[recordatorios] correo a un responsable:", (e as Error).message);
      }
    }
  }

  // 2) Gerencia: resumen del día
  let resumenGerencia = false;
  if (vencidos.length || nVencidas || nSin) {
    const gerentes = await query<{ id: string; nombre: string; correo: string }>("select id, nombre, correo from usuarios where activo and rol = 'gerencia'");
    const lineas = [
      `${vencidos.length} ${vencidos.length === 1 ? "seguimiento vencido" : "seguimientos vencidos"}`,
      `${nVencidas} ${nVencidas === 1 ? "caso pasó" : "casos pasaron"} el plazo de primer contacto`,
      `${nSin} ${nSin === 1 ? "caso abierto está" : "casos abiertos están"} sin responsable`,
    ];
    await crearAvisos(gerentes.map((g) => g.id), { tipo: "resumen", titulo: "Resumen de las 8:00", detalle: lineas.join(" · ") });
    if (correo && gerentes.length) {
      try {
        await sendMail({
          to: gerentes.map((g) => g.correo),
          subject: "Resumen de las 8:00 · Portal Master Tools",
          text: `${lineas.join("\n")}\n\n${base()}/portal`,
          html: layout("Resumen de las 8:00", `<ul style="margin:0 0 12px;padding-left:18px">${lineas.map((l) => `<li>${esc(l)}</li>`).join("")}</ul><p style="margin:0"><a href="${base()}/portal?vencidas=1" style="color:#0066B2">Abrir el portal</a></p>`),
        });
        correos++;
        resumenGerencia = true;
      } catch (e) {
        console.error("[recordatorios] correo a gerencia:", (e as Error).message);
      }
    }
  }

  await query("update recordatorios set enviados = $1 where dia = (now() at time zone 'America/Bogota')::date", [correos]);
  return { ejecutado: true, seguimientos: vencidos.length, responsables: porPersona.size, correos, resumenGerencia };
}

let ultimoIntento = "";
/** Respaldo: la primera visita al portal después de las 8:00 dispara el recordatorio del día si la función programada no corrió. */
export async function recordatorioOportunista() {
  const ahora = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hour12: false }).formatToParts(new Date());
  const get = (t: string) => ahora.find((p) => p.type === t)?.value ?? "";
  const dia = `${get("year")}-${get("month")}-${get("day")}`;
  if (Number(get("hour")) % 24 < 8 || ultimoIntento === dia) return;
  ultimoIntento = dia;
  try {
    await ejecutarRecordatorios();
  } catch (e) {
    console.error("[recordatorios] respaldo:", (e as Error).message);
  }
}
