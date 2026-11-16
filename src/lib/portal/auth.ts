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
