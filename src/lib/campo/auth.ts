import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { one, query } from "@/lib/portal/db";
import { hashPassword, verifyPassword } from "@/lib/portal/password";

/**
 * Sesiones de la app Master Tools Campo (token Bearer, no cookie).
 * Duran 30 días para que el técnico pueda trabajar varios días sin señal; cada uso las extiende.
 */

const DIAS = 30;
const MAX_INTENTOS = 5;
const BLOQUEO_MIN = 15;

/** Roles que pueden usar la app: el técnico y Operaciones (que también ejecuta la atención técnica). */
export const ROLES_CAMPO = ["tecnico", "operaciones"] as const;

export type UsuarioCampo = { id: string; nombre: string; correo: string; rol: string };

const sha = (s: string) => createHash("sha256").update(s).digest("hex");

export class ErrorCampo extends Error {
  constructor(
    msg: string,
    readonly status = 400,
  ) {
    super(msg);
  }
}

export const error = (msg: string, status = 400) => NextResponse.json({ error: msg }, { status, headers: { "Cache-Control": "no-store" } });

/** Convierte cualquier excepción en una respuesta JSON con mensaje para el técnico. */
export function responderError(e: unknown) {
  if (e instanceof ErrorCampo) return error(e.message, e.status);
  console.error("[campo]", e);
  return error("Error del servidor. Intente de nuevo en unos minutos.", 500);
}

export async function ingresar(correo: string, clave: string): Promise<{ token: string; expira: Date; usuario: UsuarioCampo }> {
  const malo = new ErrorCampo("Correo o contraseña incorrectos.", 401);
  const u = await one<UsuarioCampo & { clave_hash: string; activo: boolean; intentos: number; bloqueado_hasta: Date | null }>(
    "select id, nombre, correo, rol, clave_hash, activo, intentos, bloqueado_hasta from usuarios where lower(correo) = lower($1)",
    [correo.trim()],
  );
  if (!u || !u.activo || !(ROLES_CAMPO as readonly string[]).includes(u.rol)) {
    await hashPassword(clave); // iguala el tiempo de respuesta
    throw malo;
  }
  if (u.bloqueado_hasta && u.bloqueado_hasta > new Date()) throw new ErrorCampo("Demasiados intentos. Espere unos minutos e intente de nuevo.", 429);
  if (!(await verifyPassword(clave, u.clave_hash))) {
    const n = u.intentos + 1;
    await query(
      "update usuarios set intentos = case when $2::int >= $3::int then 0 else $2::int end, bloqueado_hasta = case when $2::int >= $3::int then now() + make_interval(mins => $4::int) else null end where id = $1",
      [u.id, n, MAX_INTENTOS, BLOQUEO_MIN],
    );
    throw malo;
  }
  await query("update usuarios set intentos = 0, bloqueado_hasta = null, ultimo_acceso = now() where id = $1", [u.id]);
  const token = randomBytes(32).toString("base64url");
  const r = await one<{ expira_en: Date }>(
    "insert into campo_sesiones (token_hash, usuario, expira_en) values ($1, $2, now() + make_interval(days => $3)) returning expira_en",
    [sha(token), u.id, DIAS],
  );
  await query("delete from campo_sesiones where expira_en < now()");
  return { token, expira: r!.expira_en, usuario: { id: u.id, nombre: u.nombre, correo: u.correo, rol: u.rol } };
}

function tokenDe(req: Request): string | null {
  const h = req.headers.get("authorization") ?? "";
  const m = /^Bearer\s+([A-Za-z0-9_-]{20,})$/.exec(h);
  return m ? m[1] : null;
}

/** Usuario del token o error 401. Extiende la sesión (ventana deslizante de 30 días). */
export async function requiereTecnico(req: Request): Promise<UsuarioCampo> {
  const t = tokenDe(req);
  if (!t) throw new ErrorCampo("Falta la sesión.", 401);
  const u = await one<UsuarioCampo>(
    `update campo_sesiones s set usada_en = now(), expira_en = greatest(s.expira_en, now() + make_interval(days => $2))
       from usuarios u
      where s.token_hash = $1 and s.usuario = u.id and s.expira_en > now() and u.activo and u.rol = any($3::text[])
      returning u.id, u.nombre, u.correo, u.rol`,
    [sha(t), DIAS, ROLES_CAMPO],
  );
  if (!u) throw new ErrorCampo("Su sesión venció. Ingrese de nuevo.", 401);
  return u;
}

export async function salir(req: Request) {
  const t = tokenDe(req);
  if (t) await query("delete from campo_sesiones where token_hash = $1", [sha(t)]);
}
