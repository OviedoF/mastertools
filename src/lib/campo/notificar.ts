import "server-only";
import { one, query } from "@/lib/portal/db";
import { getSetting } from "@/lib/settings";
import { enviarPlantilla } from "@/lib/whatsapp";

/**
 * WhatsApp al técnico cuando cambia algo de un servicio suyo (especificación, sección 8).
 *
 * Plantilla de Meta (categoría Utilidad), nombre en Ajustes > WHATSAPP_TEMPLATE_CAMPO:
 *   Cuerpo:  Hola {{1}}, hay una actualización en su orden de trabajo de campo: {{2}} Toque el botón para abrirlo en la app MT Campo.
 *   Botón:   URL dinámica «Abrir servicio» → https://mastertools.tech/campo/s/{{1}}
 * {{1}} del cuerpo es el primer nombre; {{2}} el aviso armado aquí; el sufijo del botón es el id del servicio.
 * El enlace abre la app en el servicio (pide ingresar si no hay sesión).
 *
 * Nunca lanza: si WhatsApp no está configurado o el técnico no tiene teléfono, queda registrado
 * en campo_notificaciones y el servicio sigue su curso.
 */

export type Motivo = "asignado" | "reprogramado" | "cancelado" | "retirado" | "recordatorio";

type Datos = {
  id: string; codigo: string; actividad: string; cliente: string; ciudad: string; direccion: string;
  fecha_hora: Date; alturas: boolean; vehiculo: boolean; estado: string;
};

const dia = new Intl.DateTimeFormat("es-CO", { weekday: "long", day: "numeric", month: "long", timeZone: "America/Bogota" });
const hora = new Intl.DateTimeFormat("es-CO", { hour: "numeric", minute: "2-digit", timeZone: "America/Bogota" });
/** «domingo 22 de noviembre a las 8:00 a. m.» */
const cuandoTexto = (d: Date) => `${dia.format(d).replace(",", "")} a las ${hora.format(d)}`;
/** Cierra la frase sin duplicar el punto de «a. m.». */
const fin = (t: string) => (t.endsWith(".") ? t : `${t}.`);

/** Texto de {{2}}. Sin saltos de línea (Meta no los acepta en variables). */
export function textoAviso(m: Motivo, s: Datos): string {
  const cuando = cuandoTexto(s.fecha_hora);
  const extra = [s.alturas && "aplica trabajo en alturas", s.vehiculo && "requiere vehículo corporativo"].filter(Boolean).join(" y ");
  const que = `${s.codigo} · ${s.actividad} · ${s.cliente}, ${s.direccion}, ${s.ciudad}`;
  switch (m) {
    case "asignado":
      return `${fin(`le asignamos el servicio ${que}, para el ${cuando}`)}${extra ? ` Atención: ${extra}.` : ""}`;
    case "reprogramado":
      return fin(`el servicio ${que} se reprogramó para el ${cuando}`);
    case "cancelado":
      return `el servicio ${s.codigo} (${s.cliente}, ${s.ciudad}) fue cancelado. No debe ir al sitio.`;
    case "retirado":
      return `el servicio ${s.codigo} (${s.cliente}, ${s.ciudad}) se asignó a otro técnico. Ya no está a su cargo.`;
    case "recordatorio":
      return fin(`le recordamos el servicio ${que}, hoy a las ${hora.format(s.fecha_hora)}`);
  }
}

export async function whatsappCampoConfigurado() {
  const [token, phone, plantilla] = await Promise.all(["WHATSAPP_TOKEN", "WHATSAPP_PHONE_ID", "WHATSAPP_TEMPLATE_CAMPO"].map(getSetting));
  return Boolean(token && phone && plantilla);
}

async function registrar(servicio: string, usuario: string | null, estado: "enviada" | "fallida" | "sin_configurar", detalle: string) {
  await query("insert into campo_notificaciones (servicio, usuario, canal, estado, detalle) values ($1,$2,'whatsapp',$3,$4)", [
    servicio, usuario, estado, detalle.slice(0, 500),
  ]).catch((e) => console.error("[campo] no se pudo registrar la notificación:", (e as Error).message));
}

/**
 * Avisa al técnico. `tecnicoId` permite avisar a uno distinto del asignado (el que pierde el servicio en una reasignación).
 * Al avisar una asignación, un servicio «programado» pasa a «notificado».
 */
export async function notificarServicio(servicioId: string, motivo: Motivo, tecnicoId?: string): Promise<{ ok: boolean; detalle: string }> {
  try {
    const s = await one<Datos & { tecnico: string | null }>(
      "select id, codigo, actividad, cliente, ciudad, direccion, fecha_hora, alturas, vehiculo, estado, tecnico from campo_servicios where id = $1",
      [servicioId],
    );
    if (!s) return { ok: false, detalle: "El servicio no existe." };
    const para = tecnicoId ?? s.tecnico;
    if (!para) return { ok: false, detalle: "El servicio no tiene técnico asignado." };
    const t = await one<{ nombre: string; telefono: string | null }>("select nombre, telefono from usuarios where id = $1", [para]);
    if (!t) return { ok: false, detalle: "El técnico no existe." };

    const plantilla = await getSetting("WHATSAPP_TEMPLATE_CAMPO");
    if (!(await whatsappCampoConfigurado())) {
      const d = "WhatsApp para técnicos sin configurar (Ajustes).";
      await registrar(s.id, para, "sin_configurar", d);
      return { ok: false, detalle: d };
    }
    if (!t.telefono) {
      const d = `${t.nombre} no tiene teléfono cargado (Usuarios).`;
      await registrar(s.id, para, "sin_configurar", d);
      return { ok: false, detalle: d };
    }

    const r = await enviarPlantilla(t.telefono, plantilla, {
      cuerpo: [t.nombre.trim().split(/\s+/)[0], textoAviso(motivo, s)],
      boton: s.id,
    });
    if (!r.ok) {
      await registrar(s.id, para, "fallida", `${motivo}: ${r.error}`);
      return { ok: false, detalle: r.error };
    }
    await registrar(s.id, para, "enviada", `${motivo}${r.id ? ` · ${r.id}` : ""}`);
    if (motivo === "asignado" && para === s.tecnico) {
      await query("update campo_servicios set estado = 'notificado', actualizado_en = now() where id = $1 and estado = 'programado'", [s.id]);
    }
    return { ok: true, detalle: `WhatsApp enviado a ${t.nombre}.` };
  } catch (e) {
    console.error("[campo] notificar:", (e as Error).message);
    return { ok: false, detalle: (e as Error).message };
  }
}

/**
 * Para el módulo del administrador: llamar después de guardar un cambio de servicio.
 * Decide a quién avisar según lo que cambió.
 */
export async function avisarCambio(
  servicioId: string,
  cambio: { antes: { tecnico: string | null; fecha_hora: Date; estado: string } | null; despues: { tecnico: string | null; fecha_hora: Date; estado: string } },
) {
  const { antes, despues } = cambio;
  if (despues.estado === "cancelado" && antes?.estado !== "cancelado") {
    if (despues.tecnico) await notificarServicio(servicioId, "cancelado");
    return;
  }
  if (!despues.tecnico) return;
  if (!antes || antes.tecnico !== despues.tecnico) {
    if (antes?.tecnico) await notificarServicio(servicioId, "retirado", antes.tecnico);
    await notificarServicio(servicioId, "asignado");
    return;
  }
  if (antes.fecha_hora.getTime() !== despues.fecha_hora.getTime()) await notificarServicio(servicioId, "reprogramado");
}

/** Prueba desde Ajustes: un mensaje real a cada técnico activo con teléfono. */
export async function probarWhatsAppCampo(): Promise<{ ok: boolean; detalle: string }> {
  if (!(await whatsappCampoConfigurado())) return { ok: false, detalle: "Falta el nombre de la plantilla para técnicos, el ID del número o el token." };
  const tecnicos = await query<{ nombre: string; telefono: string }>(
    "select nombre, telefono from usuarios where activo and rol in ('tecnico','operaciones') and telefono is not null",
  );
  if (!tecnicos.length) return { ok: false, detalle: "Ningún técnico activo tiene teléfono cargado en Usuarios." };
  const plantilla = await getSetting("WHATSAPP_TEMPLATE_CAMPO");
  const errores: string[] = [];
  for (const t of tecnicos) {
    const r = await enviarPlantilla(t.telefono, plantilla, {
      cuerpo: [t.nombre.trim().split(/\s+/)[0], "este es un mensaje de prueba del portal de Master Tools. No requiere ninguna acción."],
      boton: "prueba",
    });
    if (!r.ok) errores.push(`${t.nombre}: ${r.error}`);
  }
  const enviados = tecnicos.length - errores.length;
  return errores.length
    ? { ok: false, detalle: `Se enviaron ${enviados}; fallaron: ${errores.join(" | ")}` }
    : { ok: true, detalle: `Mensaje de prueba enviado a ${enviados} ${enviados === 1 ? "técnico" : "técnicos"}.` };
}
