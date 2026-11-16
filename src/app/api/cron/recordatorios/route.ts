import { NextResponse, type NextRequest } from "next/server";
import { cronValido, ejecutarRecordatorios } from "@/lib/portal/recordatorios";

/** La llama la función programada de Netlify cada día a las 8:00 (hora de Bogotá). Sin la clave correcta, 401. */
export async function GET(req: NextRequest) {
  if (!cronValido(req.headers.get("authorization"))) return NextResponse.json({ ok: false }, { status: 401 });
  try {
    return NextResponse.json({ ok: true, ...(await ejecutarRecordatorios()) });
  } catch (e) {
    console.error("[recordatorios]", (e as Error).message);
    return NextResponse.json({ ok: false, error: "No se pudo ejecutar." }, { status: 500 });
  }
}
