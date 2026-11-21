import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { getSetting } from "./settings";

/**
 * Envío de correo. Con MAIL_HOST se usa cualquier servidor SMTP (por ejemplo
 * Zoho: smtp.zoho.com, puerto 465) con MAIL_USERNAME y MAIL_PASSWORD. Sin
 * MAIL_HOST se asume Gmail: primero la API (OAuth2, con OAUTH_*) y, si falla
 * o no está configurada, SMTP con contraseña de aplicación (MAIL_PASSWORD).
 * Sin credenciales, no envía y lo informa.
 */
type Candidate = { name: "oauth2" | "smtp"; transporter: Transporter };
let candidates: { firma: string; list: Candidate[] } | undefined;
/** Si OAuth2 falló una vez (token vencido), se salta en los envíos siguientes. */
let oauthBroken = false;

/** Credenciales de correo vigentes: lo guardado en el portal (Ajustes) manda sobre las variables del servidor. */
async function mailEnv() {
  const [MAIL_USERNAME, MAIL_PASSWORD, MAIL_HOST, MAIL_PORT, MAIL_FROM_NAME] = await Promise.all(
    ["MAIL_USERNAME", "MAIL_PASSWORD", "MAIL_HOST", "MAIL_PORT", "MAIL_FROM_NAME"].map(getSetting),
  );
  const { OAUTH_CLIENTID, OAUTH_CLIENT_SECRET, OAUTH_REFRESH_TOKEN, MAIL_SECURE } = process.env;
  return { MAIL_USERNAME, MAIL_PASSWORD, MAIL_HOST, MAIL_PORT, MAIL_FROM_NAME, OAUTH_CLIENTID, OAUTH_CLIENT_SECRET, OAUTH_REFRESH_TOKEN, MAIL_SECURE };
}

export async function mailConfigured() {
  const e = await mailEnv();
  return !!e.MAIL_USERNAME && !!(e.OAUTH_REFRESH_TOKEN || e.MAIL_PASSWORD);
}

async function buildCandidates(): Promise<Candidate[]> {
  const e = await mailEnv();
  const firma = JSON.stringify(e);
  if (candidates && candidates.firma === firma) return candidates.list; // se reconstruye si cambió algún ajuste
  const user = e.MAIL_USERNAME;
  const list: Candidate[] = [];
  if (user) {
    const { OAUTH_CLIENTID, OAUTH_CLIENT_SECRET, OAUTH_REFRESH_TOKEN, MAIL_PASSWORD } = e;
    if (OAUTH_CLIENTID && OAUTH_CLIENT_SECRET && OAUTH_REFRESH_TOKEN) {
      list.push({
        name: "oauth2",
        transporter: nodemailer.createTransport({
          service: "gmail",
          auth: { type: "OAuth2", user, clientId: OAUTH_CLIENTID, clientSecret: OAUTH_CLIENT_SECRET, refreshToken: OAUTH_REFRESH_TOKEN },
        }),
      });
    }
    if (MAIL_PASSWORD) {
      const pass = MAIL_PASSWORD.replace(/^["']|["']$/g, "");
      const host = e.MAIL_HOST?.trim();
      const port = Number(e.MAIL_PORT) || 465;
      list.push({
        name: "smtp",
        transporter: host
          ? nodemailer.createTransport({
              host,
              port,
              // 465 es SSL directo; 587 negocia STARTTLS. MAIL_SECURE fuerza uno u otro.
              secure: e.MAIL_SECURE ? e.MAIL_SECURE === "true" : port === 465,
              auth: { user, pass },
            })
          : nodemailer.createTransport({ service: "gmail", auth: { user, pass } }),
      });
    }
  }
  candidates = { firma, list };
  return list;
}

export type Attachment = { filename: string; content: Buffer; contentType?: string };

export async function sendMail(opts: {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
  attachments?: Attachment[];
}) {
  const list = await buildCandidates();
  if (!list.length) {
    console.info("[mail] sin credenciales; no se envía:", opts.subject, "→", opts.to);
    return { sent: false as const, reason: "not-configured" as const };
  }
  const env = await mailEnv();
  const fromName = env.MAIL_FROM_NAME || "Master Tools";
  const message = {
    from: `"${fromName}" <${env.MAIL_USERNAME}>`,
    to: opts.to,
    subject: opts.subject,
    text: opts.text,
    html: opts.html,
    replyTo: opts.replyTo,
    attachments: opts.attachments,
  };
  let lastError: Error | null = null;
  for (const c of list) {
    if (c.name === "oauth2" && oauthBroken) continue;
    try {
      const info = await c.transporter.sendMail(message);
      return { sent: true as const, id: info.messageId, via: c.name };
    } catch (e) {
      lastError = e as Error;
      console.warn(`[mail] falló ${c.name}: ${lastError.message}`);
      if (c.name === "oauth2") oauthBroken = true;
    }
  }
  throw lastError ?? new Error("No se pudo enviar el correo");
}

/* ------------------------------ Plantillas ------------------------------ */

const esc = (s: string) =>
  s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] ?? c);

/** Envoltorio HTML sobrio, con los colores de marca. */
export function layout(title: string, bodyHtml: string, accent: "profundo" | "alerta" = "profundo") {
  const bar = accent === "alerta" ? "#FFC21A" : "#0066B2";
  const barText = accent === "alerta" ? "#0B1F4D" : "#FFFFFF";
  return `<!doctype html><html lang="es"><body style="margin:0;background:#F4F7FB;font-family:Inter,Arial,Helvetica,sans-serif;color:#0B1F4D">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4F7FB;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:16px;overflow:hidden">
<tr><td style="background:${bar};color:${barText};padding:16px 24px;font-family:Montserrat,Arial,sans-serif;font-weight:700;font-size:18px">${esc(title)}</td></tr>
<tr><td style="padding:24px;font-size:15px;line-height:1.6">${bodyHtml}</td></tr>
<tr><td style="padding:16px 24px;background:#0B1F4D;color:#CFEFFF;font-size:12px">Master Tools &amp; Services S.A.S. · mastertools.tech · +57 321 473 0384<br>Ingeniería que conecta, soluciones que transforman.</td></tr>
</table></td></tr></table></body></html>`;
}

/** Tabla clave: valor para los avisos internos. */
export function fieldsTable(rows: [string, string | undefined | null][]) {
  const items = rows.filter(([, v]) => v && String(v).trim());
  const text = items.map(([k, v]) => `${k}: ${v}`).join("\n");
  const html =
    `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse">` +
    items
      .map(
        ([k, v]) =>
          `<tr><td style="padding:8px 10px;border-bottom:1px solid #E6ECF4;color:#8A8F98;font-size:12px;text-transform:uppercase;letter-spacing:.04em;white-space:nowrap;vertical-align:top">${esc(k)}</td><td style="padding:8px 10px;border-bottom:1px solid #E6ECF4">${esc(String(v)).replace(/\n/g, "<br>")}</td></tr>`,
      )
      .join("") +
    `</table>`;
  return { text, html };
}

/** Comprueba que el servidor de correo acepta las credenciales, sin enviar nada. */
export async function probarCorreo(): Promise<{ ok: boolean; detalle: string }> {
  const list = await buildCandidates();
  const smtp = list.find((c) => c.name === "smtp");
  if (!smtp) return { ok: false, detalle: "Faltan el usuario o la contraseña del correo." };
  try {
    await smtp.transporter.verify();
    return { ok: true, detalle: "El servidor aceptó las credenciales." };
  } catch (e) {
    return { ok: false, detalle: (e as Error).message };
  }
}
