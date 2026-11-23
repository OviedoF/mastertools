import { NextResponse } from "next/server";
import { ErrorCampo, requiereTecnico, responderError } from "@/lib/campo/auth";
import { esArchivo, servicioPropio } from "@/lib/campo/servicios";
import { query } from "@/lib/portal/db";

export const dynamic = "force-dynamic";

const MAX = 12 * 1024 * 1024;
const CLASES = ["evidencia", "firma", "preoperacional", "documento"];
const TIPOS = ["image/jpeg", "image/png", "application/pdf"];

/** Sube una foto, firma o PDF con id generado en el celular. Reenviarlo no lo duplica. */
export async function POST(req: Request) {
  try {
    const u = await requiereTecnico(req);
    const f = await req.formData().catch(() => null);
    if (!f) throw new ErrorCampo("Archivo inválido.");
    const id = f.get("id");
    const clase = f.get("clase");
    const tipo = f.get("tipo");
    const archivo = f.get("archivo");
    if (!esArchivo(id) || typeof clase !== "string" || !CLASES.includes(clase) || typeof tipo !== "string" || !TIPOS.includes(tipo)) {
      throw new ErrorCampo("Archivo inválido.");
    }
    if (!(archivo instanceof File) || archivo.size === 0) throw new ErrorCampo("Falta el archivo.");
    if (archivo.size > MAX) throw new ErrorCampo("El archivo supera 12 MB.", 413);
    const s = await servicioPropio(u, f.get("servicio"));
    const datos = Buffer.from(await archivo.arrayBuffer());
    await query(
      `insert into campo_archivos (id, servicio, clase, nombre, tipo, tamano, datos, usuario)
       values ($1,$2,$3,$4,$5,$6,$7,$8) on conflict (id) do nothing`,
      [id, s.id, clase, archivo.name.slice(0, 200) || id, tipo, archivo.size, datos, u.id],
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    return responderError(e);
  }
}
