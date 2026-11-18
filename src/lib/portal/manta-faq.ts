import "server-only";
import { VENCIDA } from "./cases";
import { query } from "./db";
import type { RespuestaManta } from "./manta-preguntas";
import { CIERRE, ESTADOS, PLAZO_PRIMER_CONTACTO_H, ROLES, TIPOS, type Estado, type Rol, type Tipo } from "./model";
import { AYUDA_ESTADOS } from "./manta";

function hace(d: Date | string) {
  const min = Math.round((Date.now() - new Date(d).getTime()) / 60000);
  if (min < 1) return "ahora";
  if (min < 60) return `hace ${min} min`;
  const h = Math.round(min / 60);
  if (h < 48) return `hace ${h} h`;
  return `hace ${Math.round(h / 24)} días`;
}

const cerrados = CIERRE.map((e) => `'${e}'`).join(",");
const plural = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`;

type Fila = { id: string; numero: number; nombre: string | null; tipo: Tipo; estado: Estado; creada_en: Date; servicio: string | null; ciudad: string | null };

const caso = (f: Fila) => ({
  label: `#${f.numero} ${f.nombre ?? "Sin nombre"} · ${TIPOS[f.tipo]}${f.ciudad ? ` · ${f.ciudad}` : ""} · ${hace(f.creada_en)}`,
  href: `/portal/casos/${f.id}`,
});

async function lista(where: string, params: unknown[], vacio: string, singular: string, plural_: string, enlace: string, limit = 6): Promise<RespuestaManta> {
  const filas = await query<Fila>(
    `select s.id, s.numero::int as numero, s.nombre, s.tipo, s.estado, s.creada_en, s.servicio, s.ciudad
       from solicitudes s where ${where} order by s.creada_en limit ${limit + 1}`,
    params,
  );
  if (!filas.length) return { texto: vacio };
  const hay = filas.length > limit;
  return {
    texto: hay ? `Hay más de ${limit} ${plural_}. Estos son los más antiguos:` : `${plural(filas.length, singular, plural_)}:`,
    items: filas.slice(0, limit).map(caso),
    enlace: { label: "Ver todos en la bandeja", href: enlace },
  };
}

export async function responderManta(id: string, u: { id: string; rol: Rol }): Promise<RespuestaManta> {
  switch (id) {
    case "sin_contactar":
      return lista("s.estado = 'nueva' and s.primer_contacto_en is null", [], "No hay solicitudes sin contactar. Todo al día.", "solicitud sin contactar", "solicitudes sin contactar", "/portal?estado=nueva");
    case "emergencias":
      return lista("s.tipo = 'emergencia' and s.estado not in (" + cerrados + ")", [], "No hay emergencias abiertas.", "emergencia abierta", "emergencias abiertas", "/portal?tipo=emergencia&estado=abiertas");
    case "mis_casos":
      return lista("s.responsable = $1 and s.estado not in (" + cerrados + ")", [u.id], "No tiene casos abiertos asignados.", "caso abierto asignado a usted", "casos abiertos asignados a usted", "/portal?responsable=mios&estado=abiertas");
    case "sin_responsable":
      return lista("s.responsable is null and s.estado not in (" + cerrados + ")", [], "Todos los casos abiertos tienen responsable.", "caso sin responsable", "casos sin responsable", "/portal?responsable=sin&estado=abiertas");
    case "vencidas":
      return lista(VENCIDA, [], "Ningún caso pasó el plazo de primer contacto.", "caso pasó el plazo", "casos pasaron el plazo", "/portal?vencidas=1");

    case "mis_seguimientos": {
      const filas = await query<{ id: string; solicitud: string; numero: number; cliente: string | null; programado_para: Date; motivo: string | null }>(
        `select g.id, s.id as solicitud, s.numero::int as numero, s.nombre as cliente, g.programado_para, g.motivo
           from seguimientos g join solicitudes s on s.id = g.solicitud
          where g.responsable = $1 and not g.hecho and s.cerrada_en is null and g.programado_para < now() + interval '7 days'
          order by g.programado_para limit 10`,
        [u.id],
      );
      if (!filas.length) return { texto: "No tiene seguimientos pendientes para los próximos 7 días." };
      const fmt = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Bogota" });
      const vencidos = filas.filter((f) => new Date(f.programado_para) < new Date()).length;
      return {
        texto: `${plural(filas.length, "seguimiento pendiente", "seguimientos pendientes")}${vencidos ? `, ${vencidos} ya vencido${vencidos === 1 ? "" : "s"}` : ""}:`,
        items: filas.map((f) => ({
          label: `${new Date(f.programado_para) < new Date() ? "Vencido · " : ""}${fmt.format(new Date(f.programado_para))} · #${f.numero} ${f.cliente ?? ""}${f.motivo ? ` · ${f.motivo}` : ""}`,
          href: `/portal/casos/${f.solicitud}`,
        })),
      };
    }

    case "semana": {
      const [r] = await query<Record<string, string>>(
        `select
           count(*) filter (where creada_en >= now() - interval '7 days') as esta,
           count(*) filter (where creada_en >= now() - interval '7 days' and tipo = 'cotizacion') as cot,
           count(*) filter (where creada_en >= now() - interval '7 days' and tipo = 'emergencia') as emer,
           count(*) filter (where creada_en >= now() - interval '14 days' and creada_en < now() - interval '7 days') as antes
         from solicitudes`,
      );
      const esta = Number(r?.esta ?? 0), antes = Number(r?.antes ?? 0);
      const cmp = antes ? (esta === antes ? "Igual que la semana anterior." : `${esta > antes ? "Subió" : "Bajó"} ${Math.abs(Math.round(((esta - antes) / antes) * 100))} % frente a la semana anterior (${antes}).`) : "No hay semana anterior con qué comparar.";
      return { texto: `En los últimos 7 días llegaron ${plural(esta, "solicitud", "solicitudes")}: ${r?.cot ?? 0} de cotización y ${r?.emer ?? 0} de emergencia. ${cmp}`, enlace: { label: "Ver el dashboard", href: "/portal/dashboard" } };
    }

    case "ganadas_mes": {
      const [r] = await query<Record<string, string>>(
        `select count(*) filter (where estado = 'ganada') as ganadas, count(*) filter (where estado = 'perdida') as perdidas
           from solicitudes where tipo = 'cotizacion' and cerrada_en >= date_trunc('month', now() at time zone 'America/Bogota') at time zone 'America/Bogota'`,
      );
      const g = Number(r?.ganadas ?? 0), p = Number(r?.perdidas ?? 0);
      return { texto: g + p ? `Este mes se cerraron ${g + p} cotizaciones: ${g} ganadas y ${p} perdidas.` : "Este mes todavía no se ha cerrado ninguna cotización." };
    }

    case "estados":
      return {
        texto: [
          "Cotización: " + ["nueva", "contactada", "en_cotizacion", "ganada", "perdida"].map((e) => `${ESTADOS[e as Estado].label} (${AYUDA_ESTADOS[e]})`).join(" "),
          "Emergencia: " + ["equipo_asignado", "en_sitio", "resuelta", "facturada"].map((e) => `${ESTADOS[e as Estado].label} (${AYUDA_ESTADOS[e]})`).join(" "),
          `Descartada: ${AYUDA_ESTADOS.descartada}`,
        ].join("\n\n"),
      };
    case "cerrar":
      return { texto: "Un caso se cierra cuando pasa a Ganada, Perdida, Facturada o Descartada. En la ficha, en «Gestión», elija el estado, escriba el motivo (opcional, pero recomendable) y pulse «Cambiar estado». Al cerrarse, los seguimientos pendientes se dan por hechos. Una emergencia «Resuelta» todavía no se cierra: falta la facturación." };
    case "seguimiento":
      return { texto: "En la ficha del caso, en «Seguimientos», elija la fecha y hora, escriba el motivo y pulse «Programar seguimiento». El responsable recibe un aviso y, cada día a las 8:00, un correo con los que ya vencieron. Cuando lo haga, márquelo como hecho." };
    case "adjuntar":
      return { texto: "En la ficha del caso, en «Adjuntos», pulse «Seleccionar archivo» y luego «Subir archivo». Cada archivo puede pesar hasta 10 MB. Quedan en el historial del caso, con quién los subió y cuándo." };
    case "vistas":
      return { texto: "En la bandeja, aplique los filtros que necesite. Debajo del filtro aparece «Guardar esta búsqueda»: póngale un nombre y queda como botón rápido, solo para usted. Puede borrarla cuando quiera." };
    case "avisos":
      return { texto: "La campana del menú junta sus avisos: solicitudes nuevas (llegan a gerencia, comercial y operaciones), casos que le asignan y seguimientos vencidos. Además, todos los días a las 8:00 recibe un correo con sus seguimientos vencidos, y gerencia recibe un resumen.", enlace: { label: "Abrir mis avisos", href: "/portal/avisos" } };
    case "roles":
      return { texto: (Object.keys(ROLES) as Rol[]).map((r) => `${ROLES[r].label}: ${ROLES[r].descripcion}.`).join("\n") + `\n\nSu rol es ${ROLES[u.rol].label}.` };
    case "plazos":
      return { texto: `Una cotización debe contactarse en máximo ${PLAZO_PRIMER_CONTACTO_H.cotizacion} horas y una emergencia en ${PLAZO_PRIMER_CONTACTO_H.emergencia} hora. Pasado ese tiempo sin primer contacto, el caso aparece como vencido.` };
  }
  return { texto: "No tengo una respuesta para esa pregunta. Elija una de la lista." };
}
