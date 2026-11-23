import "server-only";
import { getSetting } from "./settings";
import { isOfficeHours } from "./horario";
import { dbConfigured, query } from "./portal/db";

/**
 * Aviso de emergencias por WhatsApp con la API oficial (WhatsApp Cloud API de Meta).
 * Los mensajes que inicia la empresa deben usar una plantilla aprobada por Meta; la plantilla
 * lleva una sola variable ({{1}}) con el resumen de la emergencia. Se configura en Portal > Ajustes
 * (ver docs/WHATSAPP.md). Sin esos datos no hace nada.
 *
 * Los destinatarios son la lista «Números que reciben el aviso» de Ajustes (tabla whatsapp_destinos):
 * cada número recibe siempre o solo fuera del horario de oficina.
 */

/** Número de WhatsApp Business desde el que salen los avisos (el «bot»). Se registra en Meta; aquí es informativo. */
export const NUMERO_BOT = "+57 312 425 9438";

export type Destino = {
  id: string; nombre: string; numero: string; cuando: "siempre" | "fuera_horario"; activo: boolean;
  hola: boolean; ultimo_envio_en: Date | null; ultimo_envio_ok: boolean | null; ultimo_envio_detalle: string | null;
};

export async function listarDestinos(): Promise<Destino[]> {
  if (!dbConfigured()) return [];
  return query<Destino>(
    "select id::text, nombre, numero, cuando, activo, hola, ultimo_envio_en, ultimo_envio_ok, ultimo_envio_detalle from whatsapp_destinos order by activo desc, nombre",
  );
}

/** Lo que falta para que el aviso por WhatsApp funcione. Vacío = listo para usar. */
export async function faltantesWhatsApp(): Promise<string[]> {
  const [token, phone, plantilla] = await Promise.all(["WHATSAPP_TOKEN", "WHATSAPP_PHONE_ID", "WHATSAPP_TEMPLATE"].map(getSetting));
  const activos = (await listarDestinos()).filter((d) => d.activo);
  const f: string[] = [];
  if (!phone) f.push("ID del número de WhatsApp Business");
  if (!token) f.push("Token de acceso permanente");
  if (!plantilla) f.push("Nombre de la plantilla aprobada por Meta");
  if (!activos.length) f.push("Al menos un número activo en la lista");
  else if (!activos.some((d) => d.ultimo_envio_ok)) f.push("Un mensaje de prueba que llegue bien (botón «Enviar mensaje de prueba»)");
  return f;
}

/** Guarda el resultado del último envío a ese número (para el estado que se ve en Ajustes). */
async function registrarEnvio(numero: string, ok: boolean, detalle: string | null) {
  await query("update whatsapp_destinos set ultimo_envio_en = now(), ultimo_envio_ok = $2, ultimo_envio_detalle = $3 where numero = $1", [
    numero, ok, detalle?.slice(0, 300) ?? null,
  ]).catch((e) => console.error("[whatsapp] no se pudo registrar el envío:", (e as Error).message));
}

/** Números activos a los que corresponde avisar ahora (o todos los activos, para la prueba). */
async function destinosAhora(todos: boolean): Promise<string[]> {
  const fuera = !isOfficeHours();
  return (await listarDestinos()).filter((d) => d.activo && (todos || d.cuando === "siempre" || fuera)).map((d) => d.numero);
}

export async function whatsappConfigurado() {
  const [token, phone, plantilla] = await Promise.all(["WHATSAPP_TOKEN", "WHATSAPP_PHONE_ID", "WHATSAPP_TEMPLATE"].map(getSetting));
  return Boolean(token && phone && plantilla && (await listarDestinos()).some((d) => d.activo));
}

export const limpio = (s: string) => s.replace(/[\r\n\t]+/g, " ").replace(/ {2,}/g, " ").trim().slice(0, 900);

export type Envio = { ok: true; id?: string } | { ok: false; error: string };

/**
 * Envía una plantilla aprobada a un número (solo dígitos, con indicativo).
 * `cuerpo` son las variables {{1}}, {{2}}… del texto; `boton` es el sufijo de un botón de URL dinámico.
 * Usa el número, el token y el idioma de Ajustes > WhatsApp. Nunca lanza.
 */
export async function enviarPlantilla(
  to: string,
  plantilla: string,
  { cuerpo = [], boton }: { cuerpo?: string[]; boton?: string } = {},
): Promise<Envio> {
  const [token, phone, idioma] = await Promise.all(["WHATSAPP_TOKEN", "WHATSAPP_PHONE_ID", "WHATSAPP_LANG"].map(getSetting));
  if (!token || !phone || !plantilla) return { ok: false, error: "WhatsApp sin configurar (ID del número, token o plantilla)." };
  const components: unknown[] = [];
  if (cuerpo.length) components.push({ type: "body", parameters: cuerpo.map((t) => ({ type: "text", text: limpio(t) || "-" })) });
  if (boton) components.push({ type: "button", sub_type: "url", index: "0", parameters: [{ type: "text", text: boton }] });
  try {
    // WHATSAPP_API_URL solo para pruebas (servidor simulado); en producción es la Graph API de Meta.
    const base = process.env.WHATSAPP_API_URL || "https://graph.facebook.com/v21.0";
    const res = await fetch(`${base}/${encodeURIComponent(phone)}/messages`, {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: { name: plantilla, language: { code: idioma || "es" }, components },
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status} ${(await res.text()).slice(0, 160)}` };
    const j = (await res.json().catch(() => null)) as { messages?: { id?: string }[] } | null;
    return { ok: true, id: j?.messages?.[0]?.id };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function avisarWhatsApp(resumen: string, { todos = false } = {}): Promise<{ enviados: number; errores: string[] }> {
  const plantilla = await getSetting("WHATSAPP_TEMPLATE");
  if (!plantilla) return { enviados: 0, errores: [] };
  const destinos = await destinosAhora(todos);
  const errores: string[] = [];
  let enviados = 0;
  for (const n of destinos) {
    const r = await enviarPlantilla(n, plantilla, { cuerpo: [resumen] });
    await registrarEnvio(n, r.ok, r.ok ? null : r.error);
    if (r.ok) enviados++;
    else errores.push(`${n.slice(0, 5)}…: ${r.error}`);
  }
  return { enviados, errores };
}
