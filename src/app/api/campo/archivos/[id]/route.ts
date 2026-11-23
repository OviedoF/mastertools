import { NextResponse } from "next/server";
import { ErrorCampo, requiereTecnico, responderError } from "@/lib/campo/auth";
import { esArchivo } from "@/lib/campo/servicios";
import { currentUser } from "@/lib/portal/auth";
import { one } from "@/lib/portal/db";

export const dynamic = "force-dynamic";

/**
 * Descarga un archivo de campo (PDF, foto o firma).
 * Pueden verlo el técnico del servicio (token de la app) y cualquier usuario del portal (cookie).
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!esArchivo(id)) throw new ErrorCampo("No encontrado.", 404);
    const portal = req.headers.has("authorization") ? null : await currentUser();
    const tecnico = portal ? null : await requiereTecnico(req);
    const a = await one<{ nombre: string; tipo: string; datos: Buffer }>(
      `select a.nombre, a.tipo, a.datos from campo_archivos a join campo_servicios s on s.id = a.servicio
        where a.id = $1 and ($2::uuid is null or s.tecnico = $2::uuid)`,
      [id, tecnico?.id ?? null],
    );
    if (!a) throw new ErrorCampo("No encontrado.", 404);
    const descargar = new URL(req.url).searchParams.has("descargar");
    return new NextResponse(new Uint8Array(a.datos), {
      headers: {
        "Content-Type": a.tipo,
        "Content-Disposition": `${descargar ? "attachment" : "inline"}; filename*=UTF-8''${encodeURIComponent(a.nombre)}`,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, no-store",
      },
    });
  } catch (e) {
    return responderError(e);
  }
}
