import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, Paperclip } from "lucide-react";
import { EstadoBadge, MantaAvatar, boton, botonSuave, fechaHora, input, tamano, tarjeta } from "@/components/portal/ui";
import {
  agregarNotaAction, asignarAction, cambiarEstadoAction, completarSeguimientoAction,
  programarSeguimientoAction, subirAdjuntoAction,
} from "@/lib/portal/actions";
import { requireUser } from "@/lib/portal/auth";
import { getCase, opcionesFiltro } from "@/lib/portal/cases";
import { AYUDA_ESTADOS } from "@/lib/portal/manta";
import { ESTADOS, FLUJO, ORIGENES, TIPOS, esCerrado, puedeGestionar, type Estado } from "@/lib/portal/model";

type Detalle = Record<string, string | undefined>;

function describir(tipo: string, d: Detalle): string {
  switch (tipo) {
    case "creada": return `Llegó por ${d.origen === "manta" ? "el chat de Manta" : "el formulario"}`;
    case "estado": return `Estado: ${ESTADOS[d.de as Estado]?.label ?? d.de} → ${ESTADOS[d.a as Estado]?.label ?? d.a}${d.motivo ? ` (${d.motivo})` : ""}`;
    case "asignacion": return d.a ? `Asignó el caso a ${d.a}` : "Quitó el responsable";
    case "nota": return `Agregó una nota: “${d.resumen ?? ""}”`;
    case "adjunto": return `Adjuntó ${d.nombre ?? "un archivo"}`;
    case "seguimiento": return `Programó un seguimiento para el ${d.para ? fechaHora(d.para) : ""}${d.motivo ? ` (${d.motivo})` : ""}`;
    case "seguimiento_hecho": return "Marcó un seguimiento como hecho";
    default: return tipo;
  }
}

const Dato = ({ k, v }: { k: string; v?: string | null }) =>
  v ? (
    <div>
      <dt className="text-xs font-semibold tracking-wide text-noche/60 uppercase">{k}</dt>
      <dd className="mt-0.5 break-words">{v}</dd>
    </div>
  ) : null;

export default async function Ficha({ params }: { params: Promise<{ id: string }> }) {
  const u = await requireUser();
  const { id } = await params;
  const data = await getCase(id);
  if (!data) notFound();
  const { caso: c, notas, eventos, adjuntos, seguimientos } = data;
  const { usuarios } = await opcionesFiltro();
  const gestiona = puedeGestionar(u.rol, c.tipo);
  const cerrado = esCerrado(c.estado);
  const emergencia = c.tipo === "emergencia";

  return (
    <div className="space-y-5">
      <Link href="/portal" className="inline-flex items-center gap-1.5 text-sm font-semibold text-profundo hover:underline">
        <ArrowLeft className="size-4" aria-hidden="true" /> Volver a solicitudes
      </Link>

      <header className={`${tarjeta} flex flex-wrap items-start gap-4 ${emergencia ? "border-l-8 border-alerta" : ""}`}>
        <div className="min-w-0 flex-1">
          <p className="eyebrow text-profundo">
            #{c.numero} · {TIPOS[c.tipo]} · {ORIGENES[c.origen]}
          </p>
          <h1 className="mt-1 font-display text-2xl font-extrabold">{c.nombre || "Sin nombre"}</h1>
          <p className="text-sm text-noche/75">{[c.empresa, c.ciudad].filter(Boolean).join(" · ")}</p>
          <p className="mt-1 text-xs text-noche/60">Llegó el {fechaHora(c.creada_en)}{c.cerrada_en ? ` · Cerrado el ${fechaHora(c.cerrada_en)}` : ""}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <EstadoBadge estado={c.estado} />
          {c.vencida && <span className="text-xs font-semibold text-red-700">Pasó el plazo de primer contacto</span>}
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-5">
          <section className={tarjeta} aria-label="Datos">
            <h2 className="h3 mb-3">Datos de la solicitud</h2>
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <Dato k="Teléfono" v={c.telefono} />
              <Dato k="Correo" v={c.correo} />
              <Dato k="Ciudad" v={c.ciudad} />
              <Dato k="Dirección" v={c.direccion} />
              <Dato k="Servicio" v={c.servicio} />
              <Dato k="Para cuándo" v={c.plazo} />
              <Dato k="Qué pasa" v={c.falla} />
              <Dato k="Personas en riesgo" v={c.riesgo} />
              <Dato k="Página de origen" v={c.pagina} />
            </dl>
            {c.mensaje && <p className="mt-4 rounded-lg bg-niebla p-3 text-sm whitespace-pre-wrap">{c.mensaje}</p>}
            {(c.telefono || c.correo) && (
              <div className="mt-4 flex flex-wrap gap-2">
                {c.telefono && <a href={`tel:${c.telefono.replace(/\s+/g, "")}`} className={botonSuave}>Llamar</a>}
                {c.telefono && <a href={`https://wa.me/${c.telefono.replace(/\D/g, "").replace(/^(?=\d{10}$)/, "57")}`} target="_blank" rel="noreferrer" className={botonSuave}>WhatsApp</a>}
                {c.correo && <a href={`mailto:${c.correo}`} className={botonSuave}>Escribir</a>}
              </div>
            )}
          </section>

          {c.conversacion && (
            <section className={tarjeta} aria-label="Conversación con Manta">
              <h2 className="h3 mb-3 flex items-center gap-2"><MantaAvatar mood="feliz" size={28} /> Conversación con Manta</h2>
              <div className="space-y-2 text-sm">
                {c.conversacion.split("\n").map((l, i) => {
                  const cliente = l.startsWith("Cliente:");
                  return (
                    <p key={i} className={`max-w-[85%] rounded-2xl px-3 py-2 ${cliente ? "ml-auto bg-claro" : "bg-niebla"}`}>
                      {l.replace(/^(Cliente|Manta):\s*/, "")}
                    </p>
                  );
                })}
              </div>
            </section>
          )}

          <section className={tarjeta} aria-label="Notas">
            <h2 className="h3 mb-3">Notas</h2>
            {gestiona && (
              <form action={agregarNotaAction} className="mb-4 space-y-2">
                <input type="hidden" name="id" value={c.id} />
                <textarea name="texto" required rows={3} maxLength={4000} placeholder="Qué se habló, qué falta, acuerdos…" className={`${input} py-2`} />
                <button className={boton}>Agregar nota</button>
              </form>
            )}
            {notas.length === 0 ? (
              <p className="text-sm text-noche/60">Aún no hay notas.</p>
            ) : (
              <ul className="space-y-3">
                {notas.map((n) => (
                  <li key={n.id} className="rounded-lg bg-niebla p-3 text-sm">
                    <p className="whitespace-pre-wrap">{n.texto}</p>
                    <p className="mt-1 text-xs text-noche/60">{n.autor} · {fechaHora(n.creada_en)}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className={tarjeta} aria-label="Historial">
            <h2 className="h3 mb-3">Historial</h2>
            <ol className="space-y-3 border-l-2 border-claro pl-4 text-sm">
              {eventos.map((e) => (
                <li key={e.id} className="relative">
                  <span className="absolute top-1.5 -left-[1.4rem] size-2.5 rounded-full bg-profundo" aria-hidden="true" />
                  <p>{describir(e.tipo, e.detalle)}</p>
                  <p className="text-xs text-noche/60">{e.autor ?? "Sistema"} · {fechaHora(e.creado_en)}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside className="space-y-5">
          <section className={tarjeta} aria-label="Gestión">
            <h2 className="h3 mb-3">Gestión</h2>
            {gestiona ? (
              <div className="space-y-5">
                <form action={cambiarEstadoAction} className="space-y-2">
                  <input type="hidden" name="id" value={c.id} />
                  <label className="block text-sm font-semibold">
                    Estado
                    <select key={c.estado} name="estado" defaultValue={c.estado} className={`${input} mt-1`}>
                      {FLUJO[c.tipo].map((s) => (
                        <option key={s} value={s}>{ESTADOS[s].label}</option>
                      ))}
                    </select>
                  </label>
                  <input name="motivo" maxLength={500} placeholder="Motivo (opcional)" aria-label="Motivo del cambio" className={input} />
                  <button className={boton}>Cambiar estado</button>
                </form>

                <form action={asignarAction} className="space-y-2">
                  <input type="hidden" name="id" value={c.id} />
                  <label className="block text-sm font-semibold">
                    Responsable
                    <select key={c.responsable ?? "sin"} name="responsable" defaultValue={c.responsable ?? ""} className={`${input} mt-1`}>
                      <option value="">Sin asignar</option>
                      {usuarios.map((x) => (
                        <option key={x.id} value={x.id}>{x.nombre}</option>
                      ))}
                    </select>
                  </label>
                  <button className={botonSuave}>Asignar</button>
                </form>
              </div>
            ) : (
              <dl className="space-y-2 text-sm">
                <Dato k="Responsable" v={c.responsable_nombre ?? "Sin asignar"} />
                <p className="text-noche/60">Su rol solo permite consultar este tipo de caso.</p>
              </dl>
            )}
          </section>

          <section className="rounded-2xl bg-noche p-5 text-white shadow-card" aria-label="Manta sugiere">
            <div className="flex items-center gap-3">
              <MantaAvatar mood={emergencia && !cerrado ? "serio" : "feliz"} size={40} className="ring-2 ring-master/60" />
              <p className="font-display font-bold">Manta</p>
            </div>
            <p className="mt-3 text-sm text-white/90">{AYUDA_ESTADOS[c.estado]}</p>
            {c.vencida && <p className="mt-2 text-sm font-semibold text-alerta">Este caso pasó el plazo de primer contacto.</p>}
          </section>

          <section className={tarjeta} aria-label="Seguimientos">
            <h2 className="h3 mb-3">Seguimientos</h2>
            {seguimientos.length === 0 && <p className="mb-3 text-sm text-noche/60">No hay seguimientos.</p>}
            <ul className="space-y-2">
              {seguimientos.map((s) => (
                <li key={s.id} className={`flex items-start gap-2 rounded-lg p-3 text-sm ${s.hecho ? "bg-niebla text-noche/60" : !s.hecho && s.programado_para < new Date() ? "bg-red-50" : "bg-claro/60"}`}>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{fechaHora(s.programado_para)}</p>
                    <p>{s.motivo || "Seguimiento"} · {s.responsable_nombre}</p>
                  </div>
                  {s.hecho ? (
                    <span className="text-xs">Hecho</span>
                  ) : gestiona ? (
                    <form action={completarSeguimientoAction}>
                      <input type="hidden" name="id" value={c.id} />
                      <input type="hidden" name="seguimiento" value={s.id} />
                      <button className="rounded-lg border border-noche/20 bg-white p-1.5 hover:bg-niebla" aria-label="Marcar como hecho" title="Marcar como hecho">
                        <Check className="size-4" aria-hidden="true" />
                      </button>
                    </form>
                  ) : null}
                </li>
              ))}
            </ul>
            {gestiona && !cerrado && (
              <form action={programarSeguimientoAction} className="mt-3 space-y-2">
                <input type="hidden" name="id" value={c.id} />
                <input type="datetime-local" name="cuando" required aria-label="Fecha y hora" className={input} />
                <input name="motivo" maxLength={300} placeholder="Motivo (ej. enviar cotización)" aria-label="Motivo" className={input} />
                <button className={botonSuave}>Programar seguimiento</button>
              </form>
            )}
          </section>

          <section className={tarjeta} aria-label="Adjuntos">
            <h2 className="h3 mb-3">Adjuntos</h2>
            {adjuntos.length === 0 && <p className="mb-3 text-sm text-noche/60">No hay archivos.</p>}
            <ul className="space-y-2 text-sm">
              {adjuntos.map((a) => (
                <li key={a.id} className="flex items-center gap-2">
                  <Paperclip className="size-4 shrink-0 text-gris" aria-hidden="true" />
                  <a href={`/portal/adjuntos/${a.id}`} className="min-w-0 flex-1 truncate font-semibold text-profundo hover:underline">{a.nombre}</a>
                  <span className="text-xs text-noche/60">{tamano(a.tamano)}</span>
                </li>
              ))}
            </ul>
            {gestiona && (
              <form action={subirAdjuntoAction} className="mt-3 space-y-2">
                <input type="hidden" name="id" value={c.id} />
                <input type="file" name="archivo" required aria-label="Archivo (máx. 10 MB)" className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-claro file:px-3 file:py-2 file:font-semibold" />
                <button className={botonSuave}>Subir archivo</button>
              </form>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
