import { NextResponse } from "next/server";
import { requiereTecnico, responderError } from "@/lib/campo/auth";
import { serviciosDe } from "@/lib/campo/servicios";

export const dynamic = "force-dynamic";

/** Servicios asignados al técnico de la sesión (solo los suyos). */
export async function GET(req: Request) {
  try {
    const u = await requiereTecnico(req);
    return NextResponse.json({ servicios: await serviciosDe(u) }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (e) {
    return responderError(e);
  }
}
