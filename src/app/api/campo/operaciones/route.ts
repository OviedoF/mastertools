import { NextResponse } from "next/server";
import { ErrorCampo, requiereTecnico, responderError } from "@/lib/campo/auth";
import { aplicarOperacion, type Operacion } from "@/lib/campo/servicios";

export const dynamic = "force-dynamic";

/**
 * Una operación de la app (inicio, ats, preoperacional, alerta, evidencia, documento, finalizar, no_ejecutado).
 * Idempotente por id: si ya se registró, responde 200 sin repetirla.
 */
export async function POST(req: Request) {
  try {
    const u = await requiereTecnico(req);
    const op = (await req.json().catch(() => null)) as Operacion | null;
    if (!op || typeof op !== "object") throw new ErrorCampo("Operación inválida.");
    const nueva = await aplicarOperacion(u, op);
    return NextResponse.json({ ok: true, repetida: !nueva });
  } catch (e) {
    return responderError(e);
  }
}
