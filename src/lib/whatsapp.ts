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

export type Destino = { id: string; nombre: string; numero: string; cuando: "siempre" | "fuera_horario"; activo: boolean };

export async function listarDestinos(): Promise<Destino[]> {
  if (!dbConfigured()) return [];
  return query<Destino>("select id::text, nombre, numero, cuando, activo from whatsapp_destinos order by activo desc, nombre");
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

const limpio = (s: string) => s.replace(/[\r\n\t]+/g, " ").replace(/ {2,}/g, " ").trim().slice(0, 900);

export async function avisarWhatsApp(resumen: string, { todos = false } = {}): Promise<{ enviados: number; errores: string[] }> {
  const [token, phone, plantilla, idioma] = await Promise.all(
    ["WHATSAPP_TOKEN", "WHATSAPP_PHONE_ID", "WHATSAPP_TEMPLATE", "WHATSAPP_LANG"].map(getSetting),
  );
  if (!token || !phone || !plantilla) return { enviados: 0, errores: [] };
  const destinos = await destinosAhora(todos);
  const errores: string[] = [];
  let enviados = 0;
  for (const n of destinos) {
    try {
      const res = await fetch(`https://graph.facebook.com/v21.0/${encodeURIComponent(phone)}/messages`, {
        method: "POST",
        headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: n,
          type: "template",
          template: {
            name: plantilla,
            language: { code: idioma || "es" },
            components: [{ type: "body", parameters: [{ type: "text", text: limpio(resumen) }] }],
          },
        }),
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) enviados++;
      else errores.push(`${n.slice(0, 5)}…: HTTP ${res.status} ${(await res.text()).slice(0, 160)}`);
    } catch (e) {
      errores.push(`${n.slice(0, 5)}…: ${(e as Error).message}`);
    }
  }
  return { enviados, errores };
}
