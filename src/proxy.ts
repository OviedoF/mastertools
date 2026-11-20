import { NextResponse, type NextRequest } from "next/server";

/**
 * Primera barrera del portal: sin cookie de sesión se va al inicio de sesión.
 * La verificación real (sesión vigente, rol) la hacen las páginas y las acciones contra la base de datos.
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const recuperar = pathname === "/portal/recuperar" || pathname.startsWith("/portal/recuperar/");
  const publica = pathname === "/portal/acceso" || recuperar;
  const res =
    !publica && !req.cookies.get("mt_portal")
      ? NextResponse.redirect(new URL("/portal/acceso", req.url))
      : NextResponse.next();
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  res.headers.set("Cache-Control", "private, no-store");
  if (recuperar) res.headers.set("Referrer-Policy", "no-referrer"); // el enlace lleva el token
  return res;
}

export const config = { matcher: "/portal/:path*" };
