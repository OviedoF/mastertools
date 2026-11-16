import { NextResponse } from "next/server";
import { getSetting } from "@/lib/settings";

/**
 * Entrega el ID de medición de Google Analytics (es público: va en el código de cualquier
 * sitio que lo use). Se lee de Ajustes para poder cambiarlo sin volver a publicar el sitio.
 */
export async function GET() {
  const id = await getSetting("GA_MEASUREMENT_ID").catch(() => "");
  return NextResponse.json(
    { id: /^G-[A-Z0-9]+$/.test(id) ? id : null },
    { headers: { "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600" } },
  );
}
