import { NextResponse } from "next/server";
import { ErrorCampo, ingresar, responderError, salir } from "@/lib/campo/auth";
import { dbConfigured } from "@/lib/portal/db";

export const dynamic = "force-dynamic";

/** Ingreso desde la app de campo: { correo, clave } → { token, expira, usuario }. */
export async function POST(req: Request) {
  try {
    if (!dbConfigured()) throw new ErrorCampo("El portal todavía no tiene base de datos configurada.", 503);
    const b = (await req.json().catch(() => null)) as { correo?: unknown; clave?: unknown } | null;
    if (typeof b?.correo !== "string" || typeof b?.clave !== "string" || !b.correo || !b.clave) throw new ErrorCampo("Escriba su correo y su contraseña.");
    const r = await ingresar(b.correo, b.clave);
    return NextResponse.json({ token: r.token, expira: r.expira.toISOString(), usuario: r.usuario }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return responderError(e);
  }
}

export async function DELETE(req: Request) {
  try {
    await salir(req);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return responderError(e);
  }
}
