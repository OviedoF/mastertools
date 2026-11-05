"use server";

import { redirect } from "next/navigation";
import { serviceLines } from "@/content/services";
import { handleLead } from "@/lib/leads";

export type QuoteState = {
  errors?: Record<string, string>;
  message?: string;
};

const required = ["nombre", "empresa", "telefono", "correo", "ciudad", "servicio", "autorizacion"] as const;

/**
 * Recibe el formulario de cotización (documento de estructura, 3.3):
 * valida, avisa al área comercial, confirma al cliente por correo y, si está
 * configurado, registra la solicitud en el CRM por webhook.
 */
export async function submitQuote(_prev: QuoteState, formData: FormData): Promise<QuoteState> {
  const data = Object.fromEntries(
    Array.from(formData.entries()).filter(([k]) => !k.startsWith("$")),
  ) as Record<string, FormDataEntryValue>;

  // Trampa para bots: el campo está oculto; si viene lleno, se descarta en silencio.
  if (typeof data.sitio_web === "string" && data.sitio_web.trim()) {
    redirect("/gracias");
  }

  const errors: Record<string, string> = {};
  for (const key of required) {
    const v = data[key];
    if (!v || (typeof v === "string" && !v.trim())) {
      errors[key] = "Falta este dato para poder contactarlo.";
    }
  }
  if (typeof data.correo === "string" && data.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.correo)) {
    errors.correo = "Revise el correo: parece incompleto.";
  }
  if (typeof data.telefono === "string" && data.telefono.replace(/\D/g, "").length < 10) {
    errors.telefono = "Escriba un número con indicativo, por ejemplo +57 300 000 0000.";
  }
  const file = data.adjunto;
  if (file instanceof File && file.size > 10 * 1024 * 1024) {
    errors.adjunto = "El archivo supera los 10 MB.";
  }
  if (Object.keys(errors).length) {
    return { errors, message: "Revise los campos marcados." };
  }

  const str = (k: string) => (typeof data[k] === "string" ? (data[k] as string).trim() : "");
  const servicio = serviceLines.find((s) => s.slug === str("servicio"))?.shortName || str("servicio") || "Otro";

  const attachment =
    file instanceof File && file.size > 0
      ? { filename: file.name, content: Buffer.from(await file.arrayBuffer()), contentType: file.type || undefined }
      : undefined;

  const result = await handleLead({
    kind: "quote",
    source: "form",
    nombre: str("nombre"),
    empresa: str("empresa"),
    telefono: str("telefono"),
    correo: str("correo"),
    ciudad: str("ciudad"),
    servicio,
    plazo: str("plazo") || undefined,
    mensaje: str("mensaje") || undefined,
    page: str("pagina") || undefined,
    attachment,
  });

  // Si había un canal configurado y ninguno funcionó, se lo decimos al cliente.
  const anyChannel = process.env.MAIL_USERNAME || process.env.LEAD_WEBHOOK_URL;
  if (anyChannel && !result.notified && !result.webhook) {
    console.error("[lead] fallo de envío", result.errors);
    return {
      message:
        "No pudimos enviar su solicitud. Revise su conexión e intente de nuevo, o escríbanos por WhatsApp al +57 300 687 3112.",
    };
  }

  redirect(`/gracias?servicio=${encodeURIComponent(str("servicio"))}`);
}
