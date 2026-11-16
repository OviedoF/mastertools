"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { layout, sendMail } from "@/lib/mail";
import { currentUser, login, logout, requireAdmin, requireManager, setPassword } from "./auth";
import { hashPassword, tempPassword } from "./password";
import { one, query, tx } from "./db";
import { AJUSTES, getSetting, guardarAjuste, quitarAjuste } from "@/lib/settings";
import { ga4Configured, olvidarTrafico, trafico } from "./ga4";
import { crearAvisos } from "./avisos";
import { responderManta } from "./manta-faq";
import type { RespuestaManta } from "./manta-preguntas";
import { ejecutarRecordatorios } from "./recordatorios";
import { avisarWhatsApp, whatsappConfigurado } from "@/lib/whatsapp";
import { CIERRE, FLUJO, ROLES, type Estado, type Rol, type Tipo } from "./model";

const str = (f: FormData, k: string, max = 2000) => String(f.get(k) ?? "").trim().slice(0, max);
const MAX_FILE = 10 * 1024 * 1024;

/* ----------------------------- acceso ----------------------------- */

export type FormState = { error?: string; ok?: string; clave?: string } | undefined;

export async function loginAction(_: FormState, f: FormData): Promise<FormState> {
  const r = await login(str(f, "correo", 200), String(f.get("clave") ?? "").slice(0, 200));
  if (!r.ok) return { error: r.error };
  redirect("/portal");
}

export async function logoutAction() {
  await logout();
  redirect("/portal/acceso");
}

export async function cambiarClaveAction(_: FormState, f: FormData): Promise<FormState> {
  const u = await currentUser();
  if (!u) redirect("/portal/acceso");
  const nueva = String(f.get("nueva") ?? "");
  if (nueva.length < 10) return { error: "Use al menos 10 caracteres." };
  if (nueva !== String(f.get("repetir") ?? "")) return { error: "Las contraseñas no coinciden." };
  await setPassword(u.id, nueva);
  redirect("/portal");
}

/* ----------------------------- casos ----------------------------- */

async function loadCase(id: string) {
  const c = await one<{ id: string; tipo: Tipo; estado: Estado; responsable: string | null; numero: number; nombre: string | null; servicio: string | null }>(
    "select id, tipo, estado, responsable, numero::int as numero, nombre, servicio from solicitudes where id = $1",
    [id],
  );
  if (!c) throw new Error("El caso ya no existe.");
  return c;
}

const refresh = (id: string) => {
  revalidatePath(`/portal/casos/${id}`);
  revalidatePath("/portal");
};

export async function cambiarEstadoAction(f: FormData) {
  const id = str(f, "id");
  const nuevo = str(f, "estado") as Estado;
  const motivo = str(f, "motivo", 500);
  const c = await loadCase(id);
  const u = await requireManager(c.tipo);
  if (!FLUJO[c.tipo].includes(nuevo) || nuevo === c.estado) return;
  await tx(async (db) => {
    await db.query(
      `update solicitudes set estado = $2::text,
         cerrada_en = case when $3::boolean then now() else null end,
         primer_contacto_en = coalesce(primer_contacto_en, case when $2::text <> 'nueva' then now() end)
       where id = $1`,
      [id, nuevo, CIERRE.includes(nuevo)],
    );
    await db.query("insert into eventos (solicitud, usuario, tipo, detalle) values ($1,$2,'estado',$3)", [
      id, u.id, JSON.stringify({ de: c.estado, a: nuevo, motivo: motivo || undefined }),
    ]);
    if (CIERRE.includes(nuevo)) {
      await db.query("update seguimientos set hecho = true, cerrado_en = now() where solicitud = $1 and not hecho", [id]);
    }
  });
  refresh(id);
}

export async function asignarAction(f: FormData) {
  const id = str(f, "id");
  const destino = str(f, "responsable") || null;
  const c = await loadCase(id);
  const u = await requireManager(c.tipo);
  if (destino === c.responsable) return;
  let quien: { nombre: string; correo: string } | null = null;
  if (destino) {
    quien = await one<{ nombre: string; correo: string }>("select nombre, correo from usuarios where id = $1 and activo", [destino]);
    if (!quien) return;
  }
  await tx(async (db) => {
    await db.query("update solicitudes set responsable = $2 where id = $1", [id, destino]);
    await db.query("insert into eventos (solicitud, usuario, tipo, detalle) values ($1,$2,'asignacion',$3)", [
      id, u.id, JSON.stringify({ a: quien?.nombre ?? null }),
    ]);
  });
  if (quien && destino && destino !== u.id) {
    await crearAvisos([destino], {
      tipo: "asignacion",
      titulo: `Caso #${c.numero} asignado a usted`,
      detalle: [c.nombre, c.servicio].filter(Boolean).join(" · ") || undefined,
      solicitud: id,
    });
  }
  if (quien && destino !== u.id) {
    const base = process.env.NEXT_PUBLIC_SITE_URL || "";
    const titulo = `Caso #${c.numero} asignado a usted`;
    const intro = `${u.nombre} le asignó el caso #${c.numero}${c.servicio ? ` (${c.servicio})` : ""}${c.nombre ? ` de ${c.nombre}` : ""}.`;
    const enlace = `${base}/portal/casos/${id}`;
    sendMail({
      to: quien.correo,
      subject: titulo,
      text: `${intro}\n\n${enlace}`,
      html: layout(
        titulo,
        `<p style="margin:0 0 12px">${intro.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</p><p style="margin:0"><a href="${enlace}" style="color:#0066B2">Abrir el caso en el portal</a></p>`,
      ),
    }).catch((e) => console.error("[portal] aviso de asignación:", e));
  }
  refresh(id);
}

export async function agregarNotaAction(f: FormData) {
  const id = str(f, "id");
  const texto = str(f, "texto", 4000);
  if (!texto) return;
  const c = await loadCase(id);
  const u = await requireManager(c.tipo);
  await tx(async (db) => {
    await db.query("insert into notas (solicitud, usuario, texto) values ($1,$2,$3)", [id, u.id, texto]);
    await db.query("insert into eventos (solicitud, usuario, tipo, detalle) values ($1,$2,'nota',$3)", [id, u.id, JSON.stringify({ resumen: texto.slice(0, 120) })]);
  });
  refresh(id);
}

export async function programarSeguimientoAction(f: FormData) {
  const id = str(f, "id");
  const cuando = str(f, "cuando");
  const motivo = str(f, "motivo", 300);
  const c = await loadCase(id);
  const u = await requireManager(c.tipo);
  // datetime-local llega sin zona: se interpreta en hora de Colombia (UTC-5)
  const fecha = new Date(`${cuando}:00-05:00`);
  if (!cuando || Number.isNaN(fecha.getTime())) return;
  const resp = str(f, "responsable") || c.responsable || u.id;
  await tx(async (db) => {
    await db.query("insert into seguimientos (solicitud, responsable, programado_para, motivo) values ($1,$2,$3,$4)", [id, resp, fecha, motivo || null]);
    await db.query("insert into eventos (solicitud, usuario, tipo, detalle) values ($1,$2,'seguimiento',$3)", [
      id, u.id, JSON.stringify({ para: fecha.toISOString(), motivo: motivo || undefined }),
    ]);
  });
  refresh(id);
}

export async function completarSeguimientoAction(f: FormData) {
  const id = str(f, "id");
  const sid = Number(str(f, "seguimiento"));
  const c = await loadCase(id);
  const u = await requireManager(c.tipo);
  await tx(async (db) => {
    const r = await db.query("update seguimientos set hecho = true, cerrado_en = now() where id = $1 and solicitud = $2 and not hecho", [sid, id]);
    if (r.rowCount) await db.query("insert into eventos (solicitud, usuario, tipo, detalle) values ($1,$2,'seguimiento_hecho',$3)", [id, u.id, JSON.stringify({})]);
  });
  refresh(id);
}

export async function subirAdjuntoAction(f: FormData) {
  const id = str(f, "id");
  const file = f.get("archivo");
  if (!(file instanceof File) || file.size === 0 || file.size > MAX_FILE) return;
  const c = await loadCase(id);
  const u = await requireManager(c.tipo);
  const buf = Buffer.from(await file.arrayBuffer());
  const nombre = file.name.replace(/[^\w.\- ()áéíóúñÁÉÍÓÚÑ]/g, "_").slice(0, 120);
  await tx(async (db) => {
    await db.query("insert into adjuntos (solicitud, usuario, nombre, tipo, tamano, datos) values ($1,$2,$3,$4,$5,$6)", [id, u.id, nombre, file.type || null, buf.length, buf]);
    await db.query("insert into eventos (solicitud, usuario, tipo, detalle) values ($1,$2,'adjunto',$3)", [id, u.id, JSON.stringify({ nombre })]);
  });
  refresh(id);
}

/* ----------------------------- usuarios ----------------------------- */

export async function crearUsuarioAction(_: FormState, f: FormData): Promise<FormState> {
  await requireAdmin();
  const nombre = str(f, "nombre", 120);
  const correo = str(f, "correo", 200).toLowerCase();
  const rol = str(f, "rol") as Rol;
  if (!nombre || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correo) || !(rol in ROLES)) return { error: "Revise el nombre, el correo y el rol." };
  const dominios = (await getSetting("PORTAL_ALLOWED_DOMAINS")).split(",").map((d) => d.trim().toLowerCase()).filter(Boolean);
  if (dominios.length && !dominios.includes(correo.split("@")[1])) return { error: `Solo se admiten correos de ${dominios.join(", ")}.` };
  if (await one("select 1 from usuarios where lower(correo) = $1", [correo])) return { error: "Ya existe un usuario con ese correo." };
  const clave = tempPassword();
  await query("insert into usuarios (nombre, correo, rol, clave_hash) values ($1,$2,$3,$4)", [nombre, correo, rol, await hashPassword(clave)]);
  revalidatePath("/portal/usuarios");
  return { ok: `Usuario creado: ${correo}`, clave };
}

export async function actualizarUsuarioAction(f: FormData) {
  const admin = await requireAdmin();
  const id = str(f, "id");
  const rol = str(f, "rol") as Rol;
  const activo = f.get("activo") === "on";
  if (!(rol in ROLES)) return;
  if (id === admin.id && (!activo || rol !== "gerencia")) return; // no puede quitarse el acceso a sí mismo
  await query("update usuarios set rol = $2, activo = $3 where id = $1", [id, rol, activo]);
  if (!activo) await query("delete from sesiones where usuario = $1", [id]);
  revalidatePath("/portal/usuarios");
}

export async function reiniciarClaveAction(_: FormState, f: FormData): Promise<FormState> {
  await requireAdmin();
  const id = str(f, "id");
  const clave = tempPassword();
  await query("update usuarios set clave_hash = $2, debe_cambiar = true, intentos = 0, bloqueado_hasta = null where id = $1", [id, await hashPassword(clave)]);
  await query("delete from sesiones where usuario = $1", [id]);
  return { ok: "Contraseña temporal generada. Entréguela por un canal privado.", clave };
}

/* ----------------------------- ajustes ----------------------------- */

export async function guardarAjusteAction(_: FormState, f: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const clave = str(f, "clave", 80);
  if (!AJUSTES.some((a) => a.clave === clave)) return { error: "Ajuste desconocido." };
  // Las claves privadas llevan saltos de línea: no se recortan por dentro ni se limitan a 2000 caracteres.
  const err = await guardarAjuste(clave, String(f.get("valor") ?? "").slice(0, 8000), admin.id);
  if (err) return { error: err };
  olvidarTrafico();
  revalidatePath("/portal/ajustes");
  revalidatePath("/portal/dashboard");
  return { ok: "Guardado." };
}

export async function quitarAjusteAction(f: FormData) {
  const admin = await requireAdmin();
  await quitarAjuste(str(f, "clave", 80), admin.id);
  olvidarTrafico();
  revalidatePath("/portal/ajustes");
  revalidatePath("/portal/dashboard");
}

export async function probarConexionAction(_: FormState, f: FormData): Promise<FormState> {
  await requireAdmin();
  const que = str(f, "que", 20);
  try {
    if (que === "analytics") {
      if (!(await ga4Configured())) return { error: "Faltan datos de Google Analytics (propiedad, correo o clave)." };
      olvidarTrafico();
      const t = await trafico(7);
      return { ok: `Conexión correcta. Últimos 7 días: ${t.usuarios} visitantes y ${t.sesiones} sesiones.` };
    }
    if (que === "correo") {
      const { probarCorreo } = await import("@/lib/mail");
      const r = await probarCorreo();
      return r.ok ? { ok: r.detalle } : { error: r.detalle };
    }
    if (que === "whatsapp") {
      if (!(await whatsappConfigurado())) return { error: "Faltan datos de WhatsApp (número, token, plantilla o destinatarios)." };
      const r = await avisarWhatsApp("Mensaje de prueba desde el portal de Master Tools. No requiere ninguna acción.");
      if (r.errores.length) return { error: `Se enviaron ${r.enviados}; fallaron: ${r.errores.join(" | ")}` };
      return { ok: `Mensaje de prueba enviado a ${r.enviados} ${r.enviados === 1 ? "número" : "números"}.` };
    }
    if (que === "recordatorio") {
      const r = await ejecutarRecordatorios({ forzar: true });
      return { ok: r.ejecutado ? `Listo: ${r.seguimientos} seguimientos vencidos, ${r.correos} correos enviados.` : (r.motivo ?? "No se ejecutó.") };
    }
  } catch (e) {
    return { error: (e as Error).message };
  }
  return { error: "Prueba desconocida." };
}

/* ----------------------------- avisos ----------------------------- */

export async function marcarAvisosLeidosAction() {
  const u = await currentUser();
  if (!u) redirect("/portal/acceso");
  await query("update avisos set leido = true where usuario = $1 and not leido", [u.id]);
  revalidatePath("/portal", "layout");
}

/* ----------------------------- puesta en marcha ----------------------------- */

export async function marcarPasoAction(f: FormData) {
  const u = await requireAdmin();
  const paso = str(f, "paso", 40);
  if (!/^[a-z0-9-]+$/.test(paso)) return;
  if (str(f, "hecho") === "1") {
    await query(
      "insert into puesta_en_marcha (paso, hecho_por) values ($1,$2) on conflict (paso) do update set hecho_por = $2, hecho_en = now()",
      [paso, u.id],
    );
  } else {
    await query("delete from puesta_en_marcha where paso = $1", [paso]);
  }
  revalidatePath("/portal/dashboard");
}

/* ----------------------------- vistas guardadas ----------------------------- */

const CLAVES_VISTA = ["q", "tipo", "estado", "responsable", "servicio", "ciudad", "desde", "hasta", "vencidas"];

export async function guardarVistaAction(f: FormData) {
  const u = await currentUser();
  if (!u) redirect("/portal/acceso");
  const nombre = str(f, "nombre", 40);
  const origen = new URLSearchParams(str(f, "filtros", 600));
  const limpio = new URLSearchParams();
  for (const k of CLAVES_VISTA) {
    const v = origen.get(k);
    if (v) limpio.set(k, v.slice(0, 120));
  }
  const filtros = limpio.toString();
  if (!nombre || !filtros) return;
  const { count } = (await one<{ count: string }>("select count(*) from vistas where usuario = $1", [u.id])) ?? { count: "0" };
  if (Number(count) >= 12) return;
  await query(
    `insert into vistas (usuario, nombre, filtros) values ($1, $2, $3)
     on conflict (usuario, nombre) do update set filtros = excluded.filtros`,
    [u.id, nombre, filtros],
  );
  revalidatePath("/portal");
}

export async function borrarVistaAction(f: FormData) {
  const u = await currentUser();
  if (!u) redirect("/portal/acceso");
  await query("delete from vistas where id = $1 and usuario = $2", [Number(str(f, "id")), u.id]);
  revalidatePath("/portal");
}

/* ----------------------------- Manta: preguntas predefinidas ----------------------------- */

export async function preguntarMantaAction(id: string): Promise<RespuestaManta> {
  const u = await currentUser();
  if (!u) return { texto: "Su sesión venció. Vuelva a ingresar." };
  try {
    return await responderManta(id, { id: u.id, rol: u.rol });
  } catch (e) {
    console.error("[manta]", (e as Error).message);
    return { texto: "No pude consultar la información en este momento. Intente de nuevo en un momento." };
  }
}
