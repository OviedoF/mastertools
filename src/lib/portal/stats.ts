import "server-only";
import { one, query } from "./db";
import { CIERRE, PLAZO_PRIMER_CONTACTO_H } from "./model";

/** Estadísticas del portal: salen de la base de datos (conversión real, no una estimación). */

export const PERIODOS = [7, 30, 90] as const;
export type Periodo = (typeof PERIODOS)[number];
export const periodoValido = (v: unknown): Periodo => (PERIODOS.includes(Number(v) as Periodo) ? (Number(v) as Periodo) : 30);

const cerrados = CIERRE.map((e) => `'${e}'`).join(",");
const num = (v: unknown) => Number(v ?? 0);

export type Kpis = {
  total: number;
  cotizaciones: number;
  emergencias: number;
  por_manta: number;
  por_formulario: number;
  ganadas: number;
  perdidas: number;
  cerradas: number;
  horas_primer_contacto: number | null;
  dias_cierre: number | null;
};

async function kpis(desde: string, hasta: string): Promise<Kpis> {
  const r = await one<Record<string, string | null>>(
    `select
       count(*) as total,
       count(*) filter (where tipo = 'cotizacion') as cotizaciones,
       count(*) filter (where tipo = 'emergencia') as emergencias,
       count(*) filter (where origen = 'manta') as por_manta,
       count(*) filter (where origen = 'form') as por_formulario,
       count(*) filter (where estado = 'ganada') as ganadas,
       count(*) filter (where estado = 'perdida') as perdidas,
       count(*) filter (where estado in (${cerrados})) as cerradas,
       avg(extract(epoch from (primer_contacto_en - creada_en)) / 3600) as horas_primer_contacto,
       avg(extract(epoch from (cerrada_en - creada_en)) / 86400) as dias_cierre
     from solicitudes
     where creada_en >= ${desde} and creada_en < ${hasta}`,
  );
  return {
    total: num(r?.total), cotizaciones: num(r?.cotizaciones), emergencias: num(r?.emergencias),
    por_manta: num(r?.por_manta), por_formulario: num(r?.por_formulario),
    ganadas: num(r?.ganadas), perdidas: num(r?.perdidas), cerradas: num(r?.cerradas),
    horas_primer_contacto: r?.horas_primer_contacto == null ? null : Number(r.horas_primer_contacto),
    dias_cierre: r?.dias_cierre == null ? null : Number(r.dias_cierre),
  };
}

export type Conteo = { etiqueta: string; n: number };
export type Dia = { dia: string; cotizaciones: number; emergencias: number };

export type Estadisticas = {
  dias: Periodo;
  actual: Kpis;
  anterior: Kpis;
  porDia: Dia[];
  porServicio: Conteo[];
  porCiudad: Conteo[];
  porEstado: Conteo[];
  porResponsable: { nombre: string; asignados: number; ganadas: number; abiertas: number }[];
  vencidasAhora: number;
  abiertasAhora: number;
  chat: { iniciadas: number; completas: number; abandonadas: number; porPaso: Conteo[] };
};

export async function estadisticas(dias: Periodo): Promise<Estadisticas> {
  const d = `make_interval(days => ${dias})`;
  const actualDesde = `(now() - ${d})`;
  const anteriorDesde = `(now() - 2 * ${d})`;

  const [actual, anterior, porDia, porServicio, porCiudad, porEstado, porResponsable, estado, chat, pasos] = await Promise.all([
    kpis(actualDesde, "now() + interval '1 minute'"),
    kpis(anteriorDesde, actualDesde),
    query<{ dia: string; cotizaciones: string; emergencias: string }>(
      `select to_char(g.dia, 'YYYY-MM-DD') as dia,
              count(s.id) filter (where s.tipo = 'cotizacion') as cotizaciones,
              count(s.id) filter (where s.tipo = 'emergencia') as emergencias
         from generate_series(((now() at time zone 'America/Bogota')::date - ${dias - 1}), (now() at time zone 'America/Bogota')::date, interval '1 day') as g(dia)
         left join solicitudes s on (s.creada_en at time zone 'America/Bogota')::date = g.dia::date
        group by g.dia order by g.dia`,
    ),
    query<{ etiqueta: string; n: string }>(
      `select coalesce(nullif(servicio, ''), 'Sin servicio') as etiqueta, count(*) as n from solicitudes
        where creada_en >= ${actualDesde} and tipo = 'cotizacion' group by 1 order by n desc, 1 limit 8`,
    ),
    query<{ etiqueta: string; n: string }>(
      `select coalesce(nullif(ciudad, ''), 'Sin ciudad') as etiqueta, count(*) as n from solicitudes
        where creada_en >= ${actualDesde} group by 1 order by n desc, 1 limit 8`,
    ),
    query<{ etiqueta: string; n: string }>(
      `select estado as etiqueta, count(*) as n from solicitudes where creada_en >= ${actualDesde} group by 1 order by n desc`,
    ),
    query<{ nombre: string; asignados: string; ganadas: string; abiertas: string }>(
      `select u.nombre, count(*) as asignados,
              count(*) filter (where s.estado in ('ganada','facturada')) as ganadas,
              count(*) filter (where s.estado not in (${cerrados})) as abiertas
         from solicitudes s join usuarios u on u.id = s.responsable
        where s.creada_en >= ${actualDesde} group by u.nombre order by asignados desc, u.nombre limit 10`,
    ),
    one<{ vencidas: string; abiertas: string }>(
      `select
         count(*) filter (where primer_contacto_en is null and cerrada_en is null and estado = 'nueva' and
           creada_en < now() - make_interval(hours => case tipo when 'emergencia' then ${PLAZO_PRIMER_CONTACTO_H.emergencia} else ${PLAZO_PRIMER_CONTACTO_H.cotizacion} end)) as vencidas,
         count(*) filter (where estado not in (${cerrados})) as abiertas
       from solicitudes`,
    ),
    one<{ iniciadas: string; completas: string }>(
      `select count(*) as iniciadas, count(*) filter (where completa) as completas from conversaciones where creada_en >= ${actualDesde}`,
    ),
    query<{ etiqueta: string; n: string }>(
      `select coalesce(paso, 'start') as etiqueta, count(*) as n from conversaciones
        where creada_en >= ${actualDesde} and not completa group by 1 order by n desc limit 8`,
    ),
  ]);

  const iniciadas = num(chat?.iniciadas);
  const completas = num(chat?.completas);
  return {
    dias,
    actual,
    anterior,
    porDia: porDia.map((r) => ({ dia: r.dia, cotizaciones: num(r.cotizaciones), emergencias: num(r.emergencias) })),
    porServicio: porServicio.map((r) => ({ etiqueta: r.etiqueta, n: num(r.n) })),
    porCiudad: porCiudad.map((r) => ({ etiqueta: r.etiqueta, n: num(r.n) })),
    porEstado: porEstado.map((r) => ({ etiqueta: r.etiqueta, n: num(r.n) })),
    porResponsable: porResponsable.map((r) => ({ nombre: r.nombre, asignados: num(r.asignados), ganadas: num(r.ganadas), abiertas: num(r.abiertas) })),
    vencidasAhora: num(estado?.vencidas),
    abiertasAhora: num(estado?.abiertas),
    chat: { iniciadas, completas, abandonadas: Math.max(0, iniciadas - completas), porPaso: pasos.map((r) => ({ etiqueta: r.etiqueta, n: num(r.n) })) },
  };
}
