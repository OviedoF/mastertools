import "server-only";
import { getSetting } from "./settings";

/**
 * Aviso de emergencias por WhatsApp con la API oficial (WhatsApp Cloud API de Meta).
 * Los mensajes que inicia la empresa deben usar una plantilla aprobada por Meta; la plantilla
 * lleva una sola variable ({{1}}) con el resumen de la emergencia. Se configura en Portal > Ajustes
 * (ver docs/WHATSAPP.md). Sin esos datos no hace nada.
 */

export async function whatsappConfigurado() {
  const [token, phone, to, plantilla] = await Promise.all(["WHATSAPP_TOKEN", "WHATSAPP_PHONE_ID", "WHATSAPP_TO", "WHATSAPP_TEMPLATE"].map(getSetting));
  return Boolean(token && phone && to && plantilla);
}

const limpio = (s: string) => s.replace(/[\r\n\t]+/g, " ").replace(/ {2,}/g, " ").trim().slice(0, 900);

export async function avisarWhatsApp(resumen: string): Promise<{ enviados: number; errores: string[] }> {
  const [token, phone, to, plantilla, idioma] = await Promise.all(
    ["WHATSAPP_TOKEN", "WHATSAPP_PHONE_ID", "WHATSAPP_TO", "WHATSAPP_TEMPLATE", "WHATSAPP_LANG"].map(getSetting),
  );
  if (!token || !phone || !to || !plantilla) return { enviados: 0, errores: [] };
  const destinos = to.split(",").map((n) => n.replace(/\D/g, "")).filter((n) => n.length >= 10);
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
