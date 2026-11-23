/** Vocabulario del portal: roles, estados y permisos. Sin acceso a base de datos, se puede usar en el cliente. */

export type Rol = "gerencia" | "comercial" | "operaciones" | "lectura" | "tecnico";
export type Tipo = "cotizacion" | "emergencia";
export type Estado =
  | "nueva" | "contactada" | "en_cotizacion" | "ganada" | "perdida"
  | "equipo_asignado" | "en_sitio" | "resuelta" | "facturada" | "descartada";

export const ROLES: Record<Rol, { label: string; descripcion: string }> = {
  gerencia: { label: "Gerencia", descripcion: "Todo: casos, usuarios y dashboard" },
  comercial: { label: "Comercial", descripcion: "Gestiona cotizaciones y emergencias (comunicación y seguimiento)" },
  operaciones: { label: "Operaciones", descripcion: "Gestiona cotizaciones y emergencias, y ejecuta la atención técnica" },
  lectura: { label: "Lectura", descripcion: "Solo consulta" },
  tecnico: { label: "Técnico", descripcion: "Solo la app Master Tools Campo: ve y ejecuta los servicios que le asignan" },
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

/**
 * Comercial y Operaciones gestionan ambos tipos de solicitud (decisión de Master Tools, 16/11/2026):
 * la diferencia entre ellos es operativa (solo Operaciones ejecuta la atención técnica), no de permisos.
 * Lectura solo consulta. `tipo` se conserva para poder diferenciar permisos más adelante.
 */
export function puedeGestionar(rol: Rol, _tipo: Tipo): boolean {
  return rol === "gerencia" || rol === "comercial" || rol === "operaciones";
}

export const puedeAdministrar = (rol: Rol) => rol === "gerencia";

/** Horas para el primer contacto antes de marcar un caso como vencido. Confirmado por Master Tools el 18/11/2026. */
export const PLAZO_PRIMER_CONTACTO_H: Record<Tipo, number> = { cotizacion: 24, emergencia: 12 };

export const ORIGENES = { form: "Formulario", manta: "Manta (chat)" } as const;
