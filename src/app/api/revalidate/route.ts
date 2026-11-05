import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Regenera todo el sitio a pedido. Respaldo manual por si la conexión en vivo
 * con Sanity no está disponible; también sirve como destino de un webhook.
 * Uso: POST /api/revalidate?secret=SANITY_REVALIDATE_SECRET
 */
export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret || req.nextUrl.searchParams.get("secret") !== secret) {
    return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true, revalidated: "all", at: new Date().toISOString() });
}
