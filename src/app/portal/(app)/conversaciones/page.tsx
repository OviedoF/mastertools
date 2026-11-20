import Link from "next/link";
import clsx from "clsx";
import { MessageSquare } from "lucide-react";
import { EnVivo } from "@/components/portal/EnVivo";
import { MantaAvatar, botonSuave, fechaHora, hace, tarjeta } from "@/components/portal/ui";
import { requireUser } from "@/lib/portal/auth";
import { MINUTOS_EN_CURSO, PAGE_SIZE_CONV, VERES, getConversacion, listConversaciones, mensajes, verValido, type ConvRow, type Ver } from "@/lib/portal/conversaciones";
import { paso } from "@/lib/portal/manta-pasos";

export const metadata = { title: "Conversaciones" };

type SP = Record<string, string | string[] | undefined>;
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;

function Estado({ c }: { c: ConvRow }) {
  if (c.en_curso)
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-900">
        <span className="size-1.5 rounded-full bg-emerald-600" aria-hidden="true" />
        En curso
      </span>
    );
  if (c.completa) return <span className="rounded-full bg-claro px-2.5 py-0.5 text-xs font-semibold text-noche">{c.numero ? `Solicitud #${c.numero}` : "Terminó en solicitud"}</span>;
  return <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-700">Abandonada</span>;
}

export default async function Conversaciones({ searchParams }: { searchParams: Promise<SP> }) {
  await requireUser();
  const sp = await searchParams;
  const ver = verValido(first(sp.ver));
  const page = Math.max(1, Number(first(sp.page)) || 1);
  const id = first(sp.id);
  const [{ rows, total, conteos }, sel] = await Promise.all([listConversaciones(ver, page), id ? getConversacion(id) : Promise.resolve(null)]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE_CONV));
  const href = (over: { ver?: Ver; page?: number; id?: string | null }) => {
    const p = new URLSearchParams();
    const v = over.ver ?? ver;
    if (v !== "todas") p.set("ver", v);
    const pg = over.page ?? (over.ver ? 1 : page);
    if (pg > 1) p.set("page", String(pg));
    const i = over.id === undefined ? id : over.id;
    if (i) p.set("id", i);
    const s = p.toString();
    return s ? `/portal/conversaciones?${s}` : "/portal/conversaciones";
  };
  const burbujas = mensajes(sel?.transcripcion ?? null);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-noche">Conversaciones de Manta</h1>
          <p className="text-sm text-gris">
            Lo que los visitantes hablan con Manta en el sitio, incluidas las que no terminan en solicitud. Una conversación sigue «en curso» hasta {MINUTOS_EN_CURSO} minutos sin actividad.
          </p>
        </div>
        <EnVivo />
      </div>

      <nav aria-label="Filtrar conversaciones" className="flex flex-wrap gap-2">
        {(Object.keys(VERES) as Ver[]).map((k) => (
          <Link key={k} href={href({ ver: k, id: null })} aria-current={k === ver ? "page" : undefined}
            className={clsx(
              "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-semibold",
              k === ver ? "border-profundo bg-profundo text-white" : "border-noche/20 bg-white text-noche hover:bg-niebla",
            )}>
            {VERES[k]}
            <span className={clsx("rounded-full px-2 text-xs", k === ver ? "bg-white/20" : k === "en_curso" && conteos.en_curso ? "bg-emerald-100 text-emerald-900" : "bg-claro")}>{conteos[k]}</span>
          </Link>
        ))}
      </nav>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
        {/* Lista */}
        <section aria-label="Lista de conversaciones" className="overflow-hidden rounded-2xl bg-white shadow-card">
          {rows.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
              <MantaAvatar mood="pensativo" size={64} />
              <p className="font-semibold">{ver === "en_curso" ? "Nadie está hablando con Manta en este momento." : "Todavía no hay conversaciones aquí."}</p>
              <p className="max-w-sm text-sm text-noche/70">Cuando alguien abra el chat en el sitio, aparecerá en esta lista mientras escribe.</p>
            </div>
          ) : (
            <ul className="divide-y divide-noche/5">
              {rows.map((c) => (
                <li key={c.id}>
                  <Link href={`${href({ id: c.id })}#detalle`} aria-current={c.id === id ? "true" : undefined}
                    className={clsx("block px-4 py-3 hover:bg-niebla/60", c.id === id && "bg-claro/40")}>
                    <span className="flex flex-wrap items-center justify-between gap-2">
                      <Estado c={c} />
                      <span className="text-xs text-gris" title={fechaHora(c.actualizada_en)}>{hace(c.actualizada_en)}</span>
                    </span>
                    <span className="mt-1.5 block truncate text-sm font-semibold text-noche">
                      {c.nombre || c.vista_previa || "Abrió el chat sin escribir"}
                    </span>
                    <span className="block truncate text-xs text-noche/60">
                      {c.mensajes ? `${c.mensajes} mensajes · ` : ""}
                      {c.completa ? "Completó la solicitud" : `Último paso: ${paso(c.paso ?? "start")}`}
                      {c.pagina ? ` · ${c.pagina}` : ""}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <div className="flex items-center justify-between gap-3 border-t border-noche/10 px-4 py-3 text-sm">
            <span className="text-noche/70">{total} {total === 1 ? "conversación" : "conversaciones"}</span>
            {pages > 1 && (
              <span className="flex items-center gap-2">
                {page > 1 && <Link href={href({ page: page - 1, id: null })} className={botonSuave}>Anterior</Link>}
                <span>{page} de {pages}</span>
                {page < pages && <Link href={href({ page: page + 1, id: null })} className={botonSuave}>Siguiente</Link>}
              </span>
            )}
          </div>
        </section>

        {/* Detalle */}
        <section id="detalle" aria-label="Conversación seleccionada" className={clsx(tarjeta, "scroll-mt-4 lg:sticky lg:top-4")}>
          {!sel ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center text-sm text-noche/70">
              <MessageSquare className="size-8 text-gris" aria-hidden="true" />
              {id ? "Esa conversación ya no existe." : "Elija una conversación de la lista para leerla completa."}
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-noche/10 pb-3">
                <div className="space-y-1">
                  <Estado c={sel} />
                  <p className="text-xs text-gris">
                    Empezó {fechaHora(sel.creada_en)} · última actividad {hace(sel.actualizada_en)}
                    {sel.pagina ? <> · desde <span className="font-mono">{sel.pagina}</span></> : null}
                  </p>
                  {!sel.completa && <p className="text-xs text-gris">Último paso: {paso(sel.paso ?? "start")}</p>}
                </div>
                {sel.solicitud && (
                  <Link href={`/portal/casos/${sel.solicitud}`} className={botonSuave}>Abrir la solicitud{sel.numero ? ` #${sel.numero}` : ""}</Link>
                )}
              </div>
              {burbujas.length === 0 ? (
                <p className="py-8 text-center text-sm text-noche/70">
                  Esta conversación se registró antes de que el portal guardara el texto, o la persona abrió el chat y no escribió nada.
                </p>
              ) : (
                <ol className="mt-4 max-h-[65vh] space-y-2 overflow-y-auto pr-1">
                  {burbujas.map((m, i) => (
                    <li key={i} className={clsx("flex items-end gap-2", m.de === "cliente" && "justify-end")}>
                      {m.de === "manta" && <MantaAvatar size={24} className="shrink-0" />}
                      <p className={clsx(
                        "max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap",
                        m.de === "manta" ? "rounded-bl-sm bg-niebla text-noche" : "rounded-br-sm bg-profundo text-white",
                      )}>
                        <span className="sr-only">{m.de === "manta" ? "Manta: " : "Visitante: "}</span>
                        {m.texto}
                      </p>
                    </li>
                  ))}
                  {sel.en_curso && <li className="pt-1 text-center text-xs text-emerald-800">La persona sigue en el chat…</li>}
                </ol>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
