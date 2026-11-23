import { NextResponse } from "next/server";
import { ErrorCampo, requiereTecnico, responderError } from "@/lib/campo/auth";
import { query } from "@/lib/portal/db";

export const dynamic = "force-dynamic";

/** Registra el token de notificaciones push del celular (Firebase Cloud Messaging). */
export async function POST(req: Request) {
  try {
    const u = await requiereTecnico(req);
    const b = (await req.json().catch(() => null)) as { token?: unknown; plataforma?: unknown } | null;
    if (typeof b?.token !== "string" || b.token.length < 20 || b.token.length > 4096) throw new ErrorCampo("Token inválido.");
    const plataforma = b.plataforma === "ios" ? "ios" : b.plataforma === "web" ? "web" : "android";
    await query(
      `insert into campo_dispositivos (token, usuario, plataforma) values ($1,$2,$3)
       on conflict (token) do update set usuario = excluded.usuario, plataforma = excluded.plataforma, actualizado_en = now()`,
      [b.token, u.id, plataforma],
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    return responderError(e);
  }
}
