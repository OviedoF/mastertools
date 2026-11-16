import { NextResponse, type NextRequest } from "next/server";
import { dbConfigured, query } from "@/lib/portal/db";

/**
 * Registra el paso en que va (o quedó) una conversación de Manta, para medir el abandono.
 * No guarda lo que escribió la persona: las conversaciones que terminan en solicitud
 * ya quedan completas en la solicitud. Responde siempre 204 para no afectar al chat.
 */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PASO = /^[a-z0-9_]{1,40}$/i;

export async function POST(req: NextRequest) {
  try {
    if (!dbConfigured()) return new NextResponse(null, { status: 204 });
    const b = (await req.json()) as { id?: string; paso?: string; completa?: boolean; pagina?: string };
    if (!b.id || !UUID.test(b.id) || !b.paso || !PASO.test(b.paso)) return new NextResponse(null, { status: 204 });
    const pagina = typeof b.pagina === "string" && b.pagina.startsWith("/") ? b.pagina.slice(0, 200) : null;
    await query(
      `insert into conversaciones (id, paso, completa, pagina) values ($1, $2, $3, $4)
       on conflict (id) do update set paso = excluded.paso, completa = conversaciones.completa or excluded.completa`,
      [b.id, b.paso, b.completa === true, pagina],
    );
  } catch (e) {
    console.error("[portal] conversación no registrada:", (e as Error).message);
  }
  return new NextResponse(null, { status: 204 });
}
