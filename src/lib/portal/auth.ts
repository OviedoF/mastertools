import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { one, query } from "./db";
import { puedeAdministrar, puedeGestionar, type Rol, type Tipo } from "./model";
import { hashPassword, verifyPassword } from "./password";

export const COOKIE = "mt_portal";
const SESSION_HOURS = 12;
const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

export type PortalUser = {
  id: string;
  nombre: string;
  correo: string;
  rol: Rol;
  debe_cambiar: boolean;
};

const sha = (s: string) => createHash("sha256").update(s).digest("hex");

export type LoginResult = { ok: true } | { ok: false; error: string };

export async function login(correo: string, clave: string): Promise<LoginResult> {
  const generic = { ok: false as const, error: "Correo o contraseña incorrectos." };
  const u = await one<{
    id: string; clave_hash: string; activo: boolean; intentos: number; bloqueado_hasta: Date | null;
  }>("select id, clave_hash, activo, intentos, bloqueado_hasta from usuarios where lower(correo) = lower($1)", [correo.trim()]);
  if (!u || !u.activo) {
    await hashPassword(clave); // iguala el tiempo de respuesta
    return generic;
  }
  if (u.bloqueado_hasta && u.bloqueado_hasta > new Date()) {
    return { ok: false, error: "Demasiados intentos. Espere unos minutos e intente de nuevo." };
  }
  if (!(await verifyPassword(clave, u.clave_hash))) {
    const intentos = u.intentos + 1;
    await query(
      "update usuarios set intentos = case when $2::int >= $3::int then 0 else $2::int end, bloqueado_hasta = case when $2::int >= $3::int then now() + make_interval(mins => $4::int) else null end where id = $1",
      [u.id, intentos, MAX_ATTEMPTS, LOCK_MINUTES],
    );
    return generic;
  }
  await query("update usuarios set intentos = 0, bloqueado_hasta = null, ultimo_acceso = now() where id = $1", [u.id]);
  const token = randomBytes(32).toString("base64url");
  await query("insert into sesiones (token_hash, usuario, expira_en) values ($1,$2, now() + make_interval(hours => $3))", [
    sha(token), u.id, SESSION_HOURS,
  ]);
  await query("delete from sesiones where expira_en < now()");
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/portal",
    maxAge: SESSION_HOURS * 3600,
  });
  return { ok: true };
}

export async function logout() {
  const jar = await cookies();
  const t = jar.get(COOKIE)?.value;
  if (t) await query("delete from sesiones where token_hash = $1", [sha(t)]);
  jar.set(COOKIE, "", { path: "/portal", maxAge: 0 });
}

/** Usuario de la sesión actual, o null. Una consulta por petición. */
export const currentUser = cache(async (): Promise<PortalUser | null> => {
  const t = (await cookies()).get(COOKIE)?.value;
  if (!t) return null;
  return one<PortalUser>(
    `select u.id, u.nombre, u.correo, u.rol, u.debe_cambiar
       from sesiones s join usuarios u on u.id = s.usuario
      where s.token_hash = $1 and s.expira_en > now() and u.activo`,
    [sha(t)],
  );
});

export async function requireUser(): Promise<PortalUser> {
  const u = await currentUser();
  if (!u) redirect("/portal/acceso");
  return u;
}

export async function requireAdmin(): Promise<PortalUser> {
  const u = await requireUser();
  if (!puedeAdministrar(u.rol)) redirect("/portal");
  return u;
}

/** Para Server Actions: lanza si el usuario no puede gestionar ese tipo de caso. */
export async function requireManager(tipo: Tipo): Promise<PortalUser> {
  const u = await currentUser();
  if (!u) throw new Error("Sesión vencida. Vuelva a ingresar.");
  if (!puedeGestionar(u.rol, tipo)) throw new Error("Su rol no permite gestionar este tipo de caso.");
  return u;
}

export async function setPassword(userId: string, clave: string) {
  await query("update usuarios set clave_hash = $2, debe_cambiar = false where id = $1", [userId, await hashPassword(clave)]);
}

/* ----------------------- recuperar la contraseña ----------------------- */

const RECUPERAR_MINUTOS = 60;
const RECUPERAR_MAX_POR_HORA = 3;

/**
 * Crea un enlace de un solo uso para elegir una contraseña nueva y devuelve el token, o null si
 * el correo no corresponde a un usuario activo o ya pidió demasiados enlaces en la última hora.
 * Quien llama no debe revelar cuál de los dos casos ocurrió.
 */
export async function crearRecuperacion(correo: string): Promise<{ token: string; nombre: string; correo: string; minutos: number } | null> {
  const u = await one<{ id: string; nombre: string; correo: string; recientes: string }>(
    `select u.id, u.nombre, u.correo,
            (select count(*) from recuperaciones r where r.usuario = u.id and r.creada_en > now() - interval '1 hour') as recientes
       from usuarios u where lower(u.correo) = lower($1) and u.activo`,
    [correo.trim()],
  );
  if (!u || Number(u.recientes) >= RECUPERAR_MAX_POR_HORA) return null;
  const token = randomBytes(32).toString("base64url");
  await query("delete from recuperaciones where expira_en < now() - interval '1 day'");
  await query("insert into recuperaciones (token_hash, usuario, expira_en) values ($1, $2, now() + make_interval(mins => $3))", [
    sha(token), u.id, RECUPERAR_MINUTOS,
  ]);
  return { token, nombre: u.nombre, correo: u.correo, minutos: RECUPERAR_MINUTOS };
}

/** Usuario dueño de un enlace de recuperación vigente y sin usar, o null. */
export async function recuperacionVigente(token: string) {
  if (!/^[A-Za-z0-9_-]{20,100}$/.test(token)) return null;
  return one<{ usuario: string; nombre: string }>(
    `select r.usuario, u.nombre from recuperaciones r join usuarios u on u.id = r.usuario
      where r.token_hash = $1 and r.usado_en is null and r.expira_en > now() and u.activo`,
    [sha(token)],
  );
}

/** Usa el enlace: guarda la contraseña nueva, invalida los demás enlaces y cierra las sesiones abiertas. */
export async function usarRecuperacion(token: string, clave: string): Promise<boolean> {
  const r = await recuperacionVigente(token);
  if (!r) return false;
  const marcado = await query("update recuperaciones set usado_en = now() where token_hash = $1 and usado_en is null returning 1", [sha(token)]);
  if (!marcado.length) return false; // otro envío lo usó primero
  await query(
    "update usuarios set clave_hash = $2, debe_cambiar = false, intentos = 0, bloqueado_hasta = null where id = $1",
    [r.usuario, await hashPassword(clave)],
  );
  await query("update recuperaciones set usado_en = now() where usuario = $1 and usado_en is null", [r.usuario]);
  await query("delete from sesiones where usuario = $1", [r.usuario]);
  return true;
}
