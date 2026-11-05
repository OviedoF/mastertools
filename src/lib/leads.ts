import "server-only";
import { site } from "@/content/site";
import { fieldsTable, layout, mailConfigured, sendMail, type Attachment } from "./mail";

/**
 * Una solicitud, venga del formulario o de Manta. Es el contrato que en la
 * etapa 6 se conecta al CRM: un solo lugar para avisar, confirmar y registrar.
 */
export type Lead = {
  kind: "quote" | "emergency";
  source: "form" | "manta";
  nombre?: string;
  empresa?: string;
  telefono?: string;
  correo?: string;
  ciudad?: string;
  direccion?: string;
  servicio?: string;
  plazo?: string;
  mensaje?: string;
  /** Emergencias */
  falla?: string;
  riesgo?: string;
  /** Conversación de Manta, para adjuntarla al registro */
  transcript?: string;
  page?: string;
  attachment?: Attachment;
};

const commercialTo = () => process.env.MAIL_TO || process.env.MAIL_USERNAME || "";
const emergencyTo = () => process.env.EMERGENCY_TO || commercialTo();
const fmtDate = () =>
  new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Bogota" }).format(new Date());

export type LeadResult = {
  notified: boolean;
  confirmed: boolean;
  webhook: boolean;
  errors: string[];
};

/** Procesa una solicitud: aviso interno, confirmación al cliente y webhook opcional. */
export async function handleLead(lead: Lead): Promise<LeadResult> {
  const result: LeadResult = { notified: false, confirmed: false, webhook: false, errors: [] };
  const when = fmtDate();

  console.info(`[lead] ${lead.kind} vía ${lead.source}`, { ...lead, attachment: lead.attachment?.filename, transcript: undefined });

  // 1) Aviso interno
  try {
    if (lead.kind === "emergency") {
      const { text, html } = fieldsTable([
        ["Nombre", lead.nombre],
        ["Empresa", lead.empresa],
        ["Teléfono", lead.telefono],
        ["Dirección", [lead.ciudad, lead.direccion].filter(Boolean).join(" · ")],
        ["Qué pasa", lead.falla],
        ["Personas en riesgo", lead.riesgo],
        ["Recibido", when],
        ["Canal", lead.source === "manta" ? "Manta (chat de la web)" : "Formulario de la web"],
      ]);
      const r = await sendMail({
        to: emergencyTo(),
        subject: `EMERGENCIA – ${lead.ciudad || "sin ciudad"} – ${lead.nombre || "sin nombre"}`,
        text: `EMERGENCIA ELÉCTRICA\n\n${text}\n\nLlamar al cliente para confirmar la atención.${lead.transcript ? `\n\nConversación:\n${lead.transcript}` : ""}`,
        html: layout(
          "Emergencia eléctrica",
          `<p style="margin:0 0 12px"><strong>Llamar al cliente para confirmar la atención.</strong>${lead.telefono ? ` <a href="tel:${lead.telefono.replace(/\s+/g, "")}" style="color:#0066B2">${lead.telefono}</a>` : ""}</p>${html}${lead.transcript ? `<p style="margin:16px 0 4px;color:#8A8F98;font-size:12px;text-transform:uppercase">Conversación</p><pre style="white-space:pre-wrap;font:13px/1.5 Inter,Arial;background:#F4F7FB;padding:12px;border-radius:8px">${lead.transcript}</pre>` : ""}`,
          "alerta",
        ),
        replyTo: lead.correo,
      });
      result.notified = r.sent;
    } else {
      const { text, html } = fieldsTable([
        ["Nombre", lead.nombre],
        ["Empresa", lead.empresa],
        ["Teléfono / WhatsApp", lead.telefono],
        ["Correo", lead.correo],
        ["Ciudad", lead.ciudad],
        ["Servicio", lead.servicio],
        ["Para cuándo", lead.plazo],
        ["Mensaje", lead.mensaje],
        ["Recibido", when],
        ["Canal", lead.source === "manta" ? "Manta (chat de la web)" : "Formulario de la web"],
        ["Página de origen", lead.page],
      ]);
      const r = await sendMail({
        to: commercialTo(),
        subject: `Nueva solicitud de cotización: ${lead.servicio || "servicio sin definir"} – ${lead.ciudad || "sin ciudad"}`,
        text: `Nueva solicitud de cotización\n\n${text}${lead.transcript ? `\n\nConversación:\n${lead.transcript}` : ""}`,
        html: layout(
          "Nueva solicitud de cotización",
          `${html}${lead.transcript ? `<p style="margin:16px 0 4px;color:#8A8F98;font-size:12px;text-transform:uppercase">Conversación</p><pre style="white-space:pre-wrap;font:13px/1.5 Inter,Arial;background:#F4F7FB;padding:12px;border-radius:8px">${lead.transcript}</pre>` : ""}`,
        ),
        replyTo: lead.correo,
        attachments: lead.attachment ? [lead.attachment] : undefined,
      });
      result.notified = r.sent;
    }
  } catch (e) {
    result.errors.push(`aviso: ${(e as Error).message}`);
  }

  // 2) Confirmación automática al cliente (documento de estructura, 3.6)
  if (lead.kind === "quote" && lead.correo) {
    try {
      const nombre = lead.nombre?.trim().split(/\s+/)[0] || "";
      const plazo = site.pending.responseTime ? "a la brevedad" : site.responseTime;
      const text = `Hola${nombre ? `, ${nombre}` : ""}:

Recibimos su solicitud sobre ${lead.servicio || "nuestros servicios"}${lead.ciudad ? ` en ${lead.ciudad}` : ""}. Un ingeniero se comunicará con usted ${plazo}.

Si necesita agregar información, responda este correo o escríbanos por WhatsApp al ${site.phone.display}.

Si se trata de una emergencia, llámenos directamente a ese mismo número.

Equipo Master Tools`;
      const r = await sendMail({
        to: lead.correo,
        subject: "Recibimos su solicitud de cotización",
        text,
        html: layout(
          "Recibimos su solicitud",
          text
            .split("\n\n")
            .map((p) => `<p style="margin:0 0 12px">${p.replace(/\n/g, "<br>")}</p>`)
            .join(""),
        ),
        replyTo: commercialTo() || undefined,
      });
      result.confirmed = r.sent;
    } catch (e) {
      result.errors.push(`confirmación: ${(e as Error).message}`);
    }
  }

  // 3) Webhook opcional (CRM, Make, Zapier, Apps Script de una planilla…)
  const hook = process.env.LEAD_WEBHOOK_URL;
  if (hook) {
    try {
      const res = await fetch(hook, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...lead, attachment: lead.attachment?.filename, receivedAt: new Date().toISOString() }),
        signal: AbortSignal.timeout(8000),
      });
      result.webhook = res.ok;
      if (!res.ok) result.errors.push(`webhook: HTTP ${res.status}`);
    } catch (e) {
      result.errors.push(`webhook: ${(e as Error).message}`);
    }
  }

  if (!mailConfigured() && !hook) {
    console.info("[lead] sin correo ni webhook configurados: la solicitud solo quedó en el registro del servidor.");
  }
  return result;
}
