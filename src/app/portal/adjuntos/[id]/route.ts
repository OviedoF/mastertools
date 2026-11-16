import { NextResponse } from "next/server";
import { currentUser } from "@/lib/portal/auth";
import { one } from "@/lib/portal/db";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await currentUser())) return new NextResponse("No autorizado", { status: 401 });
  const { id } = await params;
  if (!/^\d+$/.test(id)) return new NextResponse("No encontrado", { status: 404 });
  const a = await one<{ nombre: string; tipo: string | null; datos: Buffer }>("select nombre, tipo, datos from adjuntos where id = $1", [id]);
  if (!a) return new NextResponse("No encontrado", { status: 404 });
  return new NextResponse(new Uint8Array(a.datos), {
    headers: {
      "Content-Type": a.tipo || "application/octet-stream",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(a.nombre)}`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    },
  });
}
