import type { Resumen } from "./cases";

/** Manta en el portal, nivel 1: avisos por reglas a partir de los números del día. Sin IA. */

export type MantaMood = "feliz" | "contento" | "pensativo" | "serio";
export type MantaAviso = { texto: string; href?: string; tono?: "alerta" };

const plural = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`;

export function mantaBrief(r: Resumen, nombre: string) {
  const primero = nombre.trim().split(/\s+/)[0] || "";
  const hora = Number(new Intl.DateTimeFormat("en-US", { hour: "numeric", hour12: false, timeZone: "America/Bogota" }).format(new Date())) % 24;
  const saludo = `${hora < 12 ? "Buenos días" : hora < 19 ? "Buenas tardes" : "Buenas noches"}${primero ? `, ${primero}` : ""}.`;

  const avisos: MantaAviso[] = [];
  if (r.emergencias_nuevas)
    avisos.push({ texto: `${plural(r.emergencias_nuevas, "emergencia sin atender", "emergencias sin atender")}.`, href: "/portal?tipo=emergencia&estado=nueva", tono: "alerta" });
  if (r.vencidas)
    avisos.push({ texto: `${plural(r.vencidas, "caso pasó", "casos pasaron")} el plazo de primer contacto.`, href: "/portal?vencidas=1" });
  if (r.mis_seguimientos_vencidos)
    avisos.push({ texto: `Tiene ${plural(r.mis_seguimientos_vencidos, "seguimiento vencido", "seguimientos vencidos")}.`, href: "/portal?responsable=mios" });
  if (r.sin_asignar)
    avisos.push({ texto: `${plural(r.sin_asignar, "caso está sin responsable", "casos están sin responsable")}.`, href: "/portal?responsable=sin&estado=abiertas" });
  if (r.seguimientos_hoy)
    avisos.push({ texto: `Hoy tiene ${plural(r.seguimientos_hoy, "seguimiento programado", "seguimientos programados")}.` });

  const mood: MantaMood = r.emergencias_nuevas ? "serio" : avisos.length ? "pensativo" : r.abiertas ? "contento" : "feliz";
  const resumen = avisos.length
    ? `Esto es lo que necesita su atención.`
    : r.abiertas
      ? `Todo al día. Hay ${plural(r.abiertas, "caso abierto", "casos abiertos")} y ninguno está vencido.`
      : `No hay casos abiertos por ahora.`;
  return { saludo, resumen, avisos, mood };
}

/** Explicación corta de cada estado, para el panel de Manta en la ficha. */
export const AYUDA_ESTADOS: Record<string, string> = {
  nueva: "Llegó y nadie la ha tomado. Asigne un responsable y haga el primer contacto.",
  contactada: "Ya se habló con el cliente. Siguiente paso: levantar la información para cotizar.",
  en_cotizacion: "Se está preparando o ya se envió la cotización. Programe un seguimiento.",
  ganada: "El cliente aceptó. El caso se cierra.",
  perdida: "No se concretó. Deje en una nota el motivo.",
  equipo_asignado: "Ya hay un equipo en camino. Confirme la hora de llegada con el cliente.",
  en_sitio: "El equipo está atendiendo la falla.",
  resuelta: "La falla quedó atendida. Falta pasar a facturación.",
  facturada: "Atención facturada. El caso se cierra.",
  descartada: "Spam, duplicada o fuera de alcance. Deje la razón en una nota.",
};
