import "server-only";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { dbConfigured, query } from "./portal/db";

/**
 * Ajustes de conexión y credenciales editables por gerencia desde /portal/ajustes.
 *
 * Orden de lectura: valor guardado en la base > variable de entorno del servidor > vacío.
 * Así el sitio sigue funcionando con las variables de Netlify, y gerencia puede cambiarlas
 * sin tocar el servidor. Los valores secretos se guardan cifrados (AES-256-GCM) con la clave
 * SETTINGS_KEY; si no existe, se deriva de DATABASE_URL (ver docs/AJUSTES.md).
 */

export type AjusteDef = {
  clave: string;
  grupo: GrupoId;
  etiqueta: string;
  ayuda: string;
  secreto?: boolean;
  multilinea?: boolean;
  placeholder?: string;
  /** Variable de entorno de respaldo, si se llama distinto a la clave. */
  env?: string;
  /** Validación al guardar. Devuelve un mensaje de error o null. */
  validar?: (v: string) => string | null;
};

export type GrupoId = "analytics" | "correo" | "avisos" | "whatsapp" | "acceso";

export const GRUPOS: Record<GrupoId, { titulo: string; descripcion: string }> = {
  analytics: {
    titulo: "Google Analytics 4",
    descripcion: "Mide las visitas del sitio y las muestra en el dashboard. Guía paso a paso en docs/GA4.md.",
  },
  correo: {
    titulo: "Correo de salida",
    descripcion: "Buzón desde el que el sitio envía los avisos internos y las confirmaciones a los clientes (SMTP, por ejemplo Zoho).",
  },
  avisos: {
    titulo: "Destinatarios y conexiones",
    descripcion: "A quién le llegan las solicitudes y a qué sistema externo se reenvían.",
  },
  whatsapp: {
    titulo: "Aviso de emergencias por WhatsApp",
    descripcion: "Cada emergencia nueva se avisa por WhatsApp al equipo de turno, con la API oficial de Meta. Guía en docs/WHATSAPP.md.",
  },
  acceso: {
    titulo: "Acceso al portal",
    descripcion: "Quiénes pueden tener usuario.",
  },
};

const noVacio = (v: string) => (v.trim() ? null : "No puede quedar vacío.");
const correos = (v: string) =>
  v.split(",").map((x) => x.trim()).filter(Boolean).every((x) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(x)) ? null : "Use correos válidos separados por coma.";

export const AJUSTES: AjusteDef[] = [
  {
    clave: "GA_MEASUREMENT_ID", env: "NEXT_PUBLIC_GA_ID", grupo: "analytics", etiqueta: "ID de medición",
    ayuda: "Formato G-XXXXXXXXXX. Está en Analytics > Administrar > Flujos de datos. Con él el sitio empieza a enviar visitas.",
    placeholder: "G-XXXXXXXXXX", validar: (v) => (/^G-[A-Z0-9]{4,}$/.test(v) ? null : "Debe tener el formato G-XXXXXXXXXX."),
  },
  {
    clave: "GA4_PROPERTY_ID", grupo: "analytics", etiqueta: "ID de la propiedad",
    ayuda: "Solo números. Está en Analytics > Administrar > Configuración de la propiedad.",
    placeholder: "123456789", validar: (v) => (/^\d{5,}$/.test(v) ? null : "Solo números."),
  },
  {
    clave: "GA4_CLIENT_EMAIL", grupo: "analytics", etiqueta: "Correo de la cuenta de servicio",
    ayuda: "Campo client_email del archivo JSON de la cuenta de servicio. Debe tener rol Lector en la propiedad.",
    placeholder: "portal-analytics@proyecto.iam.gserviceaccount.com", validar: (v) => (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v) ? null : "Correo no válido."),
  },
  {
    clave: "GA4_PRIVATE_KEY", grupo: "analytics", etiqueta: "Clave privada de la cuenta de servicio", secreto: true, multilinea: true,
    ayuda: "Campo private_key del archivo JSON, completo (desde -----BEGIN hasta END-----). Se guarda cifrada y no se vuelve a mostrar.",
    validar: (v) => (v.includes("BEGIN") && v.includes("PRIVATE KEY") ? null : "No parece una clave privada de Google."),
  },
  { clave: "MAIL_HOST", grupo: "correo", etiqueta: "Servidor SMTP", ayuda: "Zoho: smtppro.zoho.com", placeholder: "smtppro.zoho.com", validar: noVacio },
  { clave: "MAIL_PORT", grupo: "correo", etiqueta: "Puerto", ayuda: "465 (SSL) o 587 (STARTTLS).", placeholder: "465", validar: (v) => (/^\d{2,5}$/.test(v) ? null : "Solo números.") },
  { clave: "MAIL_USERNAME", grupo: "correo", etiqueta: "Usuario (correo del buzón)", ayuda: "Buzón remitente.", placeholder: "negocios@mastertools.tech", validar: (v) => (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v) ? null : "Correo no válido.") },
  {
    clave: "MAIL_PASSWORD", grupo: "correo", etiqueta: "Contraseña de aplicación", secreto: true,
    ayuda: "En Zoho: Seguridad > Contraseñas de aplicación. No use la contraseña del buzón. Se guarda cifrada.", validar: noVacio,
  },
  { clave: "MAIL_FROM_NAME", grupo: "correo", etiqueta: "Nombre que ve el cliente", ayuda: "Por defecto: Master Tools.", placeholder: "Master Tools", validar: noVacio },
  { clave: "MAIL_TO", grupo: "avisos", etiqueta: "Destinatarios de cotizaciones", ayuda: "Uno o varios correos separados por coma.", placeholder: "negocios@mastertools.tech, gerencia@mastertools.tech", validar: correos },
  { clave: "EMERGENCY_TO", grupo: "avisos", etiqueta: "Destinatarios de emergencias", ayuda: "Si queda vacío, se usan los de cotizaciones.", placeholder: "negocios@mastertools.tech, gerencia@mastertools.tech", validar: correos },
  {
    clave: "LEAD_WEBHOOK_URL", grupo: "avisos", etiqueta: "Webhook externo (opcional)", secreto: true,
    ayuda: "Si se define, cada solicitud también se envía como JSON a esa dirección (Zoho, Make, Zapier). Se guarda cifrada porque la URL suele llevar una clave.",
    placeholder: "https://…", validar: (v) => (/^https:\/\/\S+$/.test(v) ? null : "Debe empezar por https://"),
  },
  {
    clave: "WHATSAPP_PHONE_ID", grupo: "whatsapp", etiqueta: "ID del número de WhatsApp Business",
    ayuda: "Meta for Developers > su app > WhatsApp > Configuración de la API: «Identificador del número de teléfono».", placeholder: "109876543210987",
    validar: (v) => (/^\d{8,}$/.test(v) ? null : "Solo números."),
  },
  {
    clave: "WHATSAPP_TOKEN", grupo: "whatsapp", etiqueta: "Token de acceso permanente", secreto: true,
    ayuda: "Token de un usuario del sistema con permiso whatsapp_business_messaging. No use el token temporal de 24 horas.", validar: noVacio,
  },
  {
    clave: "WHATSAPP_TEMPLATE", grupo: "whatsapp", etiqueta: "Nombre de la plantilla aprobada",
    ayuda: "Plantilla de categoría Utilidad con una variable: «Emergencia nueva en Master Tools: {{1}}. Ábrala en el portal para atenderla.»",
    placeholder: "aviso_emergencia", validar: (v) => (/^[a-z0-9_]{1,512}$/.test(v) ? null : "Solo minúsculas, números y guion bajo."),
  },
  { clave: "WHATSAPP_LANG", grupo: "whatsapp", etiqueta: "Idioma de la plantilla", ayuda: "Código del idioma con el que se aprobó. Por defecto: es.", placeholder: "es", validar: (v) => (/^[a-z]{2}(_[A-Z]{2})?$/.test(v) ? null : "Por ejemplo: es o es_CO.") },
  {
    clave: "WHATSAPP_TO", grupo: "whatsapp", etiqueta: "Números que reciben el aviso",
    ayuda: "Con indicativo de país y sin signos, separados por coma. Cada número debe haber aceptado recibir mensajes.", placeholder: "573001234567, 573009876543",
    validar: (v) => (v.split(",").every((n) => /^\d{10,15}$/.test(n.trim())) ? null : "Solo números con indicativo, por ejemplo 573001234567."),
  },
  { clave: "PORTAL_ALLOWED_DOMAINS", grupo: "acceso", etiqueta: "Dominios permitidos para usuarios", ayuda: "Separados por coma. Solo correos de esos dominios pueden tener usuario.", placeholder: "mastertools.tech", validar: noVacio },
];

export const ajusteDef = (clave: string) => AJUSTES.find((a) => a.clave === clave);

/* ----------------------------- cifrado ----------------------------- */

const key = () => createHash("sha256").update(process.env.SETTINGS_KEY || `mt-ajustes:${process.env.DATABASE_URL ?? ""}`).digest();

function cifrar(texto: string): string {
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", key(), iv);
  const enc = Buffer.concat([c.update(texto, "utf8"), c.final()]);
  return `enc:v1:${Buffer.concat([iv, c.getAuthTag(), enc]).toString("base64")}`;
}

function descifrar(valor: string): string {
  if (!valor.startsWith("enc:v1:")) return valor;
  const raw = Buffer.from(valor.slice(7), "base64");
  const d = createDecipheriv("aes-256-gcm", key(), raw.subarray(0, 12));
  d.setAuthTag(raw.subarray(12, 28));
  return Buffer.concat([d.update(raw.subarray(28)), d.final()]).toString("utf8");
}

/* ------------------------------ lectura ------------------------------ */

type Fila = { clave: string; valor: string | null; secreto: boolean; actualizado_en: Date; actualizado_por_nombre: string | null };
let cache: { at: number; filas: Map<string, Fila> } | null = null;
const TTL = 20_000;

async function filas(): Promise<Map<string, Fila>> {
  if (cache && Date.now() - cache.at < TTL) return cache.filas;
  const map = new Map<string, Fila>();
  if (dbConfigured()) {
    try {
      const rows = await query<Fila>(
        `select a.clave, a.valor, a.secreto, a.actualizado_en, u.nombre as actualizado_por_nombre
           from ajustes a left join usuarios u on u.id = a.actualizado_por`,
      );
      for (const r of rows) map.set(r.clave, r);
    } catch (e) {
      // La tabla puede no existir todavía (falta correr la migración): se usa el entorno.
      console.warn("[ajustes] no se pudo leer la base:", (e as Error).message);
    }
  }
  cache = { at: Date.now(), filas: map };
  return map;
}

export const invalidarAjustes = () => {
  cache = null;
};

const entorno = (clave: string) => {
  const def = ajusteDef(clave);
  return (process.env[def?.env ?? clave] ?? "").trim();
};

/** Valor vigente: la base manda sobre el entorno. */
export async function getSetting(clave: string): Promise<string> {
  const f = (await filas()).get(clave);
  if (f?.valor) {
    try {
      return descifrar(f.valor).trim();
    } catch {
      console.error(`[ajustes] no se pudo descifrar ${clave}: la clave de cifrado cambió. Vuelva a guardar el valor.`);
      return entorno(clave);
    }
  }
  return entorno(clave);
}

export type EstadoAjuste = {
  def: AjusteDef;
  origen: "base" | "entorno" | "vacio";
  /** Valor visible para los no secretos; vacío para los secretos. */
  valor: string;
  actualizado_en: Date | null;
  actualizado_por: string | null;
};

export async function estadoAjustes(): Promise<EstadoAjuste[]> {
  const f = await filas();
  const out: EstadoAjuste[] = [];
  for (const def of AJUSTES) {
    const fila = f.get(def.clave);
    const env = entorno(def.clave);
    const enBase = Boolean(fila?.valor);
    let valor = "";
    if (!def.secreto) valor = enBase ? await getSetting(def.clave) : env;
    out.push({
      def,
      origen: enBase ? "base" : env ? "entorno" : "vacio",
      valor,
      actualizado_en: enBase ? fila!.actualizado_en : null,
      actualizado_por: enBase ? fila!.actualizado_por_nombre : null,
    });
  }
  return out;
}

/* ------------------------------ escritura ------------------------------ */

export async function guardarAjuste(clave: string, valor: string, userId: string): Promise<string | null> {
  const def = ajusteDef(clave);
  if (!def) return "Ajuste desconocido.";
  const v = valor.trim();
  if (!v) return "Escriba un valor o use «Quitar» para volver al valor del servidor.";
  const err = def.validar?.(v);
  if (err) return err;
  await query(
    `insert into ajustes (clave, valor, secreto, actualizado_en, actualizado_por) values ($1, $2, $3, now(), $4)
     on conflict (clave) do update set valor = excluded.valor, secreto = excluded.secreto, actualizado_en = now(), actualizado_por = excluded.actualizado_por`,
    [clave, def.secreto ? cifrar(v) : v, Boolean(def.secreto), userId],
  );
  await query("insert into ajustes_historial (clave, usuario, accion) values ($1, $2, 'guardado')", [clave, userId]);
  invalidarAjustes();
  return null;
}

export async function quitarAjuste(clave: string, userId: string) {
  if (!ajusteDef(clave)) return;
  await query("delete from ajustes where clave = $1", [clave]);
  await query("insert into ajustes_historial (clave, usuario, accion) values ($1, $2, 'quitado')", [clave, userId]);
  invalidarAjustes();
}

export async function historialAjustes(limit = 12) {
  return query<{ clave: string; accion: string; creado_en: Date; nombre: string | null }>(
    `select h.clave, h.accion, h.creado_en, u.nombre from ajustes_historial h left join usuarios u on u.id = h.usuario
      order by h.creado_en desc limit ${Math.max(1, Math.min(50, limit))}`,
  ).catch(() => []);
}
