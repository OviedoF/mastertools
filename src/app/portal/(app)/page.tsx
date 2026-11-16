import Link from "next/link";
import { AlertTriangle, Search } from "lucide-react";
import { EstadoBadge, MantaAvatar, boton, botonSuave, fechaHora, hace, input, tarjeta } from "@/components/portal/ui";
import { borrarVistaAction, guardarVistaAction } from "@/lib/portal/actions";
import { requireUser } from "@/lib/portal/auth";
import { query } from "@/lib/portal/db";
import { PAGE_SIZE, listCases, opcionesFiltro, resumen, type Filtros } from "@/lib/portal/cases";
import { mantaBrief } from "@/lib/portal/manta";
import { ESTADOS, ORIGENES, TIPOS } from "@/lib/portal/model";

export const metadata = { title: "Solicitudes" };

type SP = Record<string, string | string[] | undefined>;
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;

export default async function Bandeja({ searchParams }: { searchParams: Promise<SP> }) {
  const u = await requireUser();
  const sp = await searchParams;
  const f: Filtros = {
    q: first(sp.q), tipo: first(sp.tipo), estado: first(sp.estado), responsable: first(sp.responsable),
    servicio: first(sp.servicio), ciudad: first(sp.ciudad), desde: first(sp.desde), hasta: first(sp.hasta),
    vencidas: first(sp.vencidas), page: Number(first(sp.page)) || 1,
  };
  const [{ rows, total }, r, opciones, misVistas] = await Promise.all([
    listCases(f, u.id),
    resumen(u.id),
    opcionesFiltro(),
    query<{ id: string; nombre: string; filtros: string }>("select id::text, nombre, filtros from vistas where usuario = $1 order by nombre", [u.id]),
  ]);
  const brief = mantaBrief(r, u.nombre);

  const hayFiltros = Object.entries(f).some(([k, v]) => k !== "page" && v);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = f.page ?? 1;
  const href = (over: Partial<Record<string, string | number>>) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...sp, ...over })) {
      const val = Array.isArray(v) ? v[0] : v;
      if (val !== undefined && val !== "" && val !== 0) p.set(k, String(val));
    }
    const s = p.toString();
    return s ? `/portal?${s}` : "/portal";
  };

  const filtrosActuales = new URLSearchParams(
    Object.entries({ q: f.q, tipo: f.tipo, estado: f.estado, responsable: f.responsable, servicio: f.servicio, ciudad: f.ciudad, desde: f.desde, hasta: f.hasta, vencidas: f.vencidas }).filter(([, v]) => v) as [string, string][],
  ).toString();

  const vistas = [
    { label: "Mis casos", q: "?responsable=mios&estado=abiertas", n: r.mis_casos },
    { label: "Nuevas sin asignar", q: "?responsable=sin&estado=nueva", n: undefined },
    { label: "Emergencias abiertas", q: "?tipo=emergencia&estado=abiertas", n: r.emergencias_nuevas || undefined },
    { label: "Vencidas", q: "?vencidas=1", n: r.vencidas || undefined },
  ];

  return (
    <div className="space-y-6">
      {/* Manta saluda */}
      <section className={`${tarjeta} flex items-start gap-4`} aria-label="Resumen de Manta">
        <MantaAvatar mood={brief.mood} size={56} className="shrink-0" />
        <div className="min-w-0">
          <h1 className="font-display text-xl font-bold">{brief.saludo}</h1>
          <p className="mt-1 text-sm text-noche/80">{brief.resumen}</p>
          {brief.avisos.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-2">
              {brief.avisos.map((a) => (
                <li key={a.texto}>
                  {a.href ? (
                    <Link href={a.href} className={`inline-block rounded-full px-3 py-1.5 text-sm font-medium hover:brightness-95 ${a.tono === "alerta" ? "bg-alerta/90" : "bg-claro"}`}>
                      {a.texto}
                    </Link>
                  ) : (
                    <span className="inline-block rounded-full bg-niebla px-3 py-1.5 text-sm">{a.texto}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Contadores */}
      <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ["Nuevas", r.nuevas],
          ["Abiertas", r.abiertas],
          ["Sin responsable", r.sin_asignar],
          ["Vencidas", r.vencidas],
        ].map(([k, v]) => (
          <div key={k} className="rounded-2xl bg-white p-4 shadow-card">
            <dt className="text-xs font-semibold tracking-wide text-noche/60 uppercase">{k}</dt>
            <dd className="mt-1 font-display text-3xl font-extrabold">{v}</dd>
          </div>
        ))}
      </dl>

      {/* Vistas y filtros */}
      <section className={tarjeta} aria-label="Filtros">
        <div className="mb-4 flex flex-wrap gap-2">
          {vistas.map((v) => (
            <Link key={v.label} href={`/portal${v.q}`} className={botonSuave}>
              {v.label}
              {v.n ? <span className="rounded-full bg-claro px-2 text-xs">{v.n}</span> : null}
            </Link>
          ))}
          {misVistas.map((v) => (
            <span key={v.id} className="inline-flex overflow-hidden rounded-lg border border-profundo/40 bg-white">
              <Link href={`/portal?${v.filtros}`} className="inline-flex min-h-10 items-center px-3 text-sm font-semibold text-profundo hover:bg-claro/60">
                {v.nombre}
              </Link>
              <form action={borrarVistaAction}>
                <input type="hidden" name="id" value={v.id} />
                <button className="inline-flex min-h-10 items-center border-l border-profundo/20 px-2.5 text-noche/50 hover:bg-red-50 hover:text-red-700" aria-label={`Borrar la búsqueda ${v.nombre}`} title="Borrar">
                  ×
                </button>
              </form>
            </span>
          ))}
        </div>
        <form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" action="/portal">
          <label className="relative sm:col-span-2">
            <span className="sr-only">Buscar</span>
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gris" aria-hidden="true" />
            <input name="q" defaultValue={f.q} placeholder="Nombre, empresa, teléfono, correo, mensaje o #número" className={`${input} pl-9`} />
          </label>
          <select name="tipo" defaultValue={f.tipo ?? ""} aria-label="Tipo" className={input}>
            <option value="">Todos los tipos</option>
            {Object.entries(TIPOS).map(([k, l]) => (
              <option key={k} value={k}>{l}</option>
            ))}
          </select>
          <select name="estado" defaultValue={f.estado ?? ""} aria-label="Estado" className={input}>
            <option value="">Todos los estados</option>
            <option value="abiertas">Abiertas</option>
            <option value="cerradas">Cerradas</option>
            {Object.entries(ESTADOS).map(([k, e]) => (
              <option key={k} value={k}>{e.label}</option>
            ))}
          </select>
          <select name="responsable" defaultValue={f.responsable ?? ""} aria-label="Responsable" className={input}>
            <option value="">Todos los responsables</option>
            <option value="mios">Mis casos</option>
            <option value="sin">Sin responsable</option>
            {opciones.usuarios.map((x) => (
              <option key={x.id} value={x.id}>{x.nombre}</option>
            ))}
          </select>
          <select name="servicio" defaultValue={f.servicio ?? ""} aria-label="Servicio" className={input}>
            <option value="">Todos los servicios</option>
            {opciones.servicios.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <input name="ciudad" defaultValue={f.ciudad} placeholder="Ciudad" aria-label="Ciudad" className={input} />
          <label className="flex items-center gap-2 text-sm">
            <span className="w-12 shrink-0 text-noche/70">Desde</span>
            <input type="date" name="desde" defaultValue={f.desde} className={input} />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <span className="w-12 shrink-0 text-noche/70">Hasta</span>
            <input type="date" name="hasta" defaultValue={f.hasta} className={input} />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="vencidas" value="1" defaultChecked={!!f.vencidas} className="size-4" />
            Solo vencidas
          </label>
          <div className="flex gap-2 sm:col-span-2 lg:col-span-3 lg:justify-end">
            {hayFiltros && <Link href="/portal" className={botonSuave}>Limpiar</Link>}
            <button className={boton}>Filtrar</button>
          </div>
        </form>
        {hayFiltros && (
          <form action={guardarVistaAction} className="mt-3 flex flex-wrap items-center gap-2 border-t border-noche/10 pt-3">
            <input type="hidden" name="filtros" value={filtrosActuales} />
            <label className="sr-only" htmlFor="nombre-vista">Nombre de la búsqueda</label>
            <input id="nombre-vista" name="nombre" required maxLength={40} placeholder="Nombre para esta búsqueda" className={`${input} max-w-xs`} />
            <button className={botonSuave}>Guardar esta búsqueda</button>
          </form>
        )}
      </section>

      {/* Lista */}
      <section aria-label="Solicitudes" className="overflow-hidden rounded-2xl bg-white shadow-card">
        {rows.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
            <MantaAvatar mood="pensativo" size={64} />
            <p className="font-semibold">{hayFiltros ? "No encontré solicitudes con esos filtros." : "Todavía no han llegado solicitudes."}</p>
            <p className="max-w-sm text-sm text-noche/70">
              {hayFiltros ? "Pruebe quitando algún filtro o buscando por otra palabra." : "Cuando alguien escriba por el formulario o por el chat, aparecerá aquí."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[56rem] text-left text-sm">
              <thead className="border-b border-noche/10 bg-niebla text-xs tracking-wide text-noche/70 uppercase">
                <tr>
                  <th className="px-4 py-3">N.º</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Tipo / servicio</th>
                  <th className="px-4 py-3">Ciudad</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Responsable</th>
                  <th className="px-4 py-3">Llegó</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-noche/5">
                {rows.map((c) => (
                  <tr key={c.id} className="hover:bg-niebla/60">
                    <td className="px-4 py-3 font-mono text-xs">
                      <Link href={`/portal/casos/${c.id}`} className="font-semibold text-profundo hover:underline">#{c.numero}</Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/portal/casos/${c.id}`} className="font-semibold hover:underline">{c.nombre || "Sin nombre"}</Link>
                      {c.empresa && <span className="block text-xs text-noche/65">{c.empresa}</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5">
                        {c.tipo === "emergencia" && <span className="rounded bg-alerta px-1.5 text-xs font-bold">Emergencia</span>}
                        {c.tipo === "cotizacion" && <span className="text-xs font-semibold text-noche/70">Cotización</span>}
                        <span className="text-xs text-noche/55">· {ORIGENES[c.origen]}</span>
                      </span>
                      <span className="block text-noche/80">{c.servicio || (c.falla ? c.falla.slice(0, 50) : "Sin definir")}</span>
                    </td>
                    <td className="px-4 py-3">{c.ciudad || "—"}</td>
                    <td className="px-4 py-3">
                      <EstadoBadge estado={c.estado} />
                      {c.vencida && (
                        <span className="mt-1 flex items-center gap-1 text-xs font-semibold text-red-700">
                          <AlertTriangle className="size-3.5" aria-hidden="true" /> Vencida
                        </span>
                      )}
                      {c.seguimiento_vencido && <span className="mt-1 block text-xs font-semibold text-red-700">Seguimiento vencido</span>}
                    </td>
                    <td className="px-4 py-3">{c.responsable_nombre || <span className="text-noche/50">Sin asignar</span>}</td>
                    <td className="px-4 py-3 whitespace-nowrap" title={fechaHora(c.creada_en)}>{hace(c.creada_en)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex items-center justify-between gap-3 border-t border-noche/10 px-4 py-3 text-sm">
          <span className="text-noche/70">{total} {total === 1 ? "solicitud" : "solicitudes"}</span>
          {pages > 1 && (
            <span className="flex items-center gap-2">
              {page > 1 && <Link href={href({ page: page - 1 })} className={botonSuave}>Anterior</Link>}
              <span>Página {page} de {pages}</span>
              {page < pages && <Link href={href({ page: page + 1 })} className={botonSuave}>Siguiente</Link>}
            </span>
          )}
        </div>
      </section>
    </div>
  );
}
