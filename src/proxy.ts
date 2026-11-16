import { NextResponse, type NextRequest } from "next/server";

/**
 * Primera barrera del portal: sin cookie de sesión se va al inicio de sesión.
 * La verificación real (sesión vigente, rol) la hacen las páginas y las acciones contra la base de datos.
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const publica = pathname === "/portal/acceso";
  const res =
    !publica && !req.cookies.get("mt_portal")
      ? NextResponse.redirect(new URL("/portal/acceso", req.url))
      : NextResponse.next();
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  res.headers.set("Cache-Control", "private, no-store");
  return res;
}

export const config = { matcher: "/portal/:path*" };
