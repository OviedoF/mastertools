import { NextResponse, type NextRequest } from "next/server";
import { dbConfigured, query } from "@/lib/portal/db";

/**
 * Registra cada conversación de Manta mientras ocurre: paso actual, si terminó en solicitud
 * y la transcripción, para verla en el portal (Conversaciones), incluso en vivo, y medir el abandono.
 * Responde siempre 204 para no afectar al chat.
 */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PASO = /^[a-z0-9_]{1,40}$/i;
const MAX_TEXTO = 8000;

export async function POST(req: NextRequest) {
  try {
    if (!dbConfigured()) return new NextResponse(null, { status: 204 });
    const b = (await req.json()) as { id?: string; paso?: string; completa?: boolean; pagina?: string; texto?: string; mensajes?: number };
    if (!b.id || !UUID.test(b.id) || !b.paso || !PASO.test(b.paso)) return new NextResponse(null, { status: 204 });
    const pagina = typeof b.pagina === "string" && b.pagina.startsWith("/") ? b.pagina.slice(0, 200) : null;
    const texto = typeof b.texto === "string" && b.texto.trim() ? b.texto.slice(0, MAX_TEXTO) : null;
    const mensajes = Number.isInteger(b.mensajes) ? Math.min(Math.max(b.mensajes as number, 0), 500) : 0;
    await query(
      `insert into conversaciones (id, paso, completa, pagina, transcripcion, mensajes) values ($1, $2, $3, $4, $5, $6)
       on conflict (id) do update set
         paso = excluded.paso,
         completa = conversaciones.completa or excluded.completa,
         transcripcion = coalesce(excluded.transcripcion, conversaciones.transcripcion),
         mensajes = greatest(conversaciones.mensajes, excluded.mensajes),
         actualizada_en = now()`,
      [b.id, b.paso, b.completa === true, pagina, texto, mensajes],
    );
  } catch (e) {
    console.error("[portal] conversación no registrada:", (e as Error).message);
  }
  return new NextResponse(null, { status: 204 });
}
