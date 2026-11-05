import { NextResponse, type NextRequest } from "next/server";
import { handleLead, type Lead } from "@/lib/leads";
import { SERVICES_LABELS } from "@/components/chat/flows";

/**
 * Recibe las solicitudes de Manta (cotización o emergencia) y las procesa
 * igual que el formulario: aviso, confirmación y webhook.
 */
export async function POST(req: NextRequest) {
  let body: { kind?: string; answers?: Record<string, string>; transcript?: string; page?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 });
  }
  const kind = body.kind === "emergency" ? "emergency" : body.kind === "quote" ? "quote" : null;
  const a = body.answers ?? {};
  if (!kind || !a.nombre) {
    return NextResponse.json({ ok: false, error: "Faltan datos" }, { status: 400 });
  }
  const clean = (v?: string) => (typeof v === "string" ? v.trim().slice(0, 500) : undefined);

  const lead: Lead =
    kind === "emergency"
      ? {
          kind,
          source: "manta",
          nombre: clean(a.nombre),
          telefono: clean(a.telefono),
          ciudad: clean(a.ubicacion),
          falla: [clean(a.falla), clean(a.falla_detalle)].filter(Boolean).join(" · ") || undefined,
          riesgo: clean(a.riesgo),
          transcript: clean(body.transcript)?.slice(0, 4000),
          page: clean(body.page),
        }
      : {
          kind,
          source: "manta",
          nombre: clean(a.nombre),
          telefono: a.canal === "Correo" ? undefined : clean(a.contacto),
          correo: a.canal === "Correo" ? clean(a.contacto) : undefined,
          ciudad: clean(a.ciudad),
          servicio: SERVICES_LABELS[a.service ?? ""] ?? clean(a.service),
          plazo: clean(a.plazo),
          mensaje: [clean(a.detalle), clean(a.detalle2), clean(a.extra), a.canal ? `Prefiere contacto por ${a.canal}` : ""]
            .filter(Boolean)
            .join(" · ") || undefined,
          transcript: clean(body.transcript)?.slice(0, 4000),
          page: clean(body.page),
        };

  const result = await handleLead(lead);
  return NextResponse.json({ ok: true, result });
}
