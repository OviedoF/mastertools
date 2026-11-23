import { NextResponse } from "next/server";

/**
 * Android App Links: autoriza a la app MT Campo a abrir https://mastertools.tech/campo/s/<id> sin preguntar.
 * ANDROID_CERT_SHA256 = huella SHA-256 del certificado con que se firma la app (una o varias, separadas por coma).
 * Ver docs/CAMPO.md.
 */
export const dynamic = "force-dynamic";

export function GET() {
  const huellas = (process.env.ANDROID_CERT_SHA256 ?? "")
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);
  const cuerpo = huellas.length
    ? [
        {
          relation: ["delegate_permission/common.handle_all_urls"],
          target: { namespace: "android_app", package_name: "tech.mastertools.master_tools_campo", sha256_cert_fingerprints: huellas },
        },
      ]
    : [];
  return NextResponse.json(cuerpo, { headers: { "Cache-Control": "public, max-age=3600" } });
}
