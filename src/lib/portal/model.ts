/** Vocabulario del portal: roles, estados y permisos. Sin acceso a base de datos, se puede usar en el cliente. */

export type Rol = "gerencia" | "comercial" | "operaciones" | "lectura";
export type Tipo = "cotizacion" | "emergencia";
export type Estado =
  | "nueva" | "contactada" | "en_cotizacion" | "ganada" | "perdida"
  | "equipo_asignado" | "en_sitio" | "resuelta" | "facturada" | "descartada";

export const ROLES: Record<Rol, { label: string; descripcion: string }> = {
  gerencia: { label: "Gerencia", descripcion: "Todo: casos, usuarios y dashboard" },
  comercial: { label: "Comercial", descripcion: "Gestiona cotizaciones y chats; consulta emergencias" },
  operaciones: { label: "Operaciones", descripcion: "Gestiona emergencias; consulta cotizaciones" },
  lectura: { label: "Lectura", descripcion: "Solo consulta" },
};

export const TIPOS: Record<Tipo, string> = { cotizacion: "Cotización", emergencia: "Emergencia" };

export const ESTADOS: Record<Estado, { label: string; tono: "azul" | "verde" | "gris" | "alerta" }> = {
  nueva: { label: "Nueva", tono: "azul" },
  contactada: { label: "Contactada", tono: "azul" },
  en_cotizacion: { label: "En cotización", tono: "azul" },
  ganada: { label: "Ganada", tono: "verde" },
  perdida: { label: "Perdida", tono: "gris" },
  equipo_asignado: { label: "Equipo asignado", tono: "alerta" },
  en_sitio: { label: "En sitio", tono: "alerta" },
  resuelta: { label: "Resuelta", tono: "verde" },
  facturada: { label: "Facturada", tono: "verde" },
  descartada: { label: "Descartada", tono: "gris" },
};

/** Flujo de cada tipo. */
export const FLUJO: Record<Tipo, Estado[]> = {
  cotizacion: ["nueva", "contactada", "en_cotizacion", "ganada", "perdida", "descartada"],
  emergencia: ["nueva", "equipo_asignado", "en_sitio", "resuelta", "facturada", "descartada"],
};

/** Estados que cierran el caso. "Resuelta" aún espera facturación, así que no cierra. */
export const CIERRE: Estado[] = ["ganada", "perdida", "facturada", "descartada"];
export const esCerrado = (e: Estado) => CIERRE.includes(e);

export function puedeGestionar(rol: Rol, tipo: Tipo): boolean {
  if (rol === "gerencia") return true;
  if (rol === "comercial") return tipo === "cotizacion";
  if (rol === "operaciones") return tipo === "emergencia";
  return false;
}

export const puedeAdministrar = (rol: Rol) => rol === "gerencia";

/** Horas para el primer contacto antes de marcar un caso como vencido. A confirmar con el cliente. */
export const PLAZO_PRIMER_CONTACTO_H: Record<Tipo, number> = { cotizacion: 24, emergencia: 1 };

export const ORIGENES = { form: "Formulario", manta: "Manta (chat)" } as const;
