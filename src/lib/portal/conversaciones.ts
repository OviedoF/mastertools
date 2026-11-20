import "server-only";
import { one, query } from "./db";

/** Minutos sin actividad a partir de los cuales una conversación sin solicitud se da por abandonada. */
export const MINUTOS_EN_CURSO = 5;

export const VERES = {
  todas: "Todas",
  en_curso: "En curso",
  solicitud: "Terminaron en solicitud",
  abandonadas: "Abandonadas",
} as const;
export type Ver = keyof typeof VERES;
export const verValido = (v?: string): Ver => (v && v in VERES ? (v as Ver) : "todas");

export const PAGE_SIZE_CONV = 30;

const EN_CURSO = `(not c.completa and c.actualizada_en > now() - make_interval(mins => ${MINUTOS_EN_CURSO}))`;
const FILTRO: Record<Ver, string> = {
  todas: "true",
  en_curso: EN_CURSO,
  solicitud: "c.completa",
  abandonadas: `(not c.completa and not ${EN_CURSO})`,
};

export type ConvRow = {
  id: string;
  creada_en: Date;
  actualizada_en: Date;
  paso: string | null;
  completa: boolean;
  en_curso: boolean;
  pagina: string | null;
  mensajes: number;
  solicitud: string | null;
  numero: number | null;
  nombre: string | null;
  vista_previa: string | null;
};

const COLUMNAS = `c.id, c.creada_en, c.actualizada_en, c.paso, c.completa, ${EN_CURSO} as en_curso, c.pagina, c.mensajes,
  c.solicitud, s.numero::int as numero, s.nombre`;

export async function listConversaciones(ver: Ver, page: number) {
  const offset = (Math.max(1, page) - 1) * PAGE_SIZE_CONV;
  const [rows, total, conteos] = await Promise.all([
    query<ConvRow>(
      `select ${COLUMNAS},
              -- primer mensaje que escribió el visitante (o eligió), para reconocer la conversación en la lista
              substring(coalesce(c.transcripcion, s.conversacion) from 'Cliente: ([^\\n]{1,90})') as vista_previa
         from conversaciones c left join solicitudes s on s.id = c.solicitud
        where ${FILTRO[ver]}
        order by ${EN_CURSO} desc, c.actualizada_en desc
        limit ${PAGE_SIZE_CONV} offset ${offset}`,
    ),
    one<{ n: string }>(`select count(*) as n from conversaciones c where ${FILTRO[ver]}`),
    one<Record<Ver, string>>(
      `select count(*) as todas,
              count(*) filter (where ${FILTRO.en_curso}) as en_curso,
              count(*) filter (where ${FILTRO.solicitud}) as solicitud,
              count(*) filter (where ${FILTRO.abandonadas}) as abandonadas
         from conversaciones c`,
    ),
  ]);
  const n = (k: Ver) => Number(conteos?.[k] ?? 0);
  return {
    rows,
    total: Number(total?.n ?? 0),
    conteos: { todas: n("todas"), en_curso: n("en_curso"), solicitud: n("solicitud"), abandonadas: n("abandonadas") } as Record<Ver, number>,
  };
}

export async function getConversacion(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  return one<ConvRow & { transcripcion: string | null }>(
    `select ${COLUMNAS}, null as vista_previa, coalesce(c.transcripcion, s.conversacion) as transcripcion
       from conversaciones c left join solicitudes s on s.id = c.solicitud where c.id = $1`,
    [id],
  );
}

export type Mensaje = { de: "manta" | "cliente"; texto: string };

/** Convierte la transcripción «Manta: …» / «Cliente: …» en mensajes. Las líneas sin prefijo siguen al mensaje anterior. */
export function mensajes(transcripcion: string | null): Mensaje[] {
  if (!transcripcion) return [];
  const out: Mensaje[] = [];
  for (const linea of transcripcion.split("\n")) {
    const m = /^(Manta|Cliente): ?(.*)$/.exec(linea);
    if (m) out.push({ de: m[1] === "Manta" ? "manta" : "cliente", texto: m[2] });
    else if (out.length) out[out.length - 1].texto += `\n${linea}`;
  }
  return out;
}
