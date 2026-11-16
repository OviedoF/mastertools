import { NextResponse, type NextRequest } from "next/server";
import { currentUser } from "@/lib/portal/auth";
import { one } from "@/lib/portal/db";

/** Marca un aviso como leído y lleva al caso (o a la lista de avisos si no tiene caso). Solo sirve para avisos propios. */
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const u = await currentUser();
  if (!u) return NextResponse.redirect(new URL("/portal/acceso", req.url));
  const { id } = await ctx.params;
  const n = Number(id);
  if (!Number.isInteger(n)) return NextResponse.redirect(new URL("/portal/avisos", req.url));
  const a = await one<{ solicitud: string | null }>("update avisos set leido = true where id = $1 and usuario = $2 returning solicitud", [n, u.id]);
  return NextResponse.redirect(new URL(a?.solicitud ? `/portal/casos/${a.solicitud}` : "/portal/avisos", req.url));
}
