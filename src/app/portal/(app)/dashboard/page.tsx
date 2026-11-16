import Link from "next/link";
import clsx from "clsx";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { PuestaEnMarcha } from "@/components/portal/PuestaEnMarcha";
import { MantaAvatar, tarjeta } from "@/components/portal/ui";
import { requireAdmin } from "@/lib/portal/auth";
import { ga4Configured, trafico, type Trafico } from "@/lib/portal/ga4";
import { ESTADOS, type Estado } from "@/lib/portal/model";
import { PERIODOS, estadisticas, periodoValido, type Conteo, type Dia, type Estadisticas } from "@/lib/portal/stats";

export const metadata = { title: "Dashboard" };

const nf = new Intl.NumberFormat("es-CO");
const n1 = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 1 });
const pct = (a: number, b: number) => (b > 0 ? `${n1.format((a / b) * 100)} %` : "—");

function duracion(seg: number) {
  const m = Math.floor(seg / 60);
  const s = Math.round(seg % 60);
  return m > 0 ? `${m} min ${s} s` : `${s} s`;
}

/** Variación frente al período anterior. Si no había datos antes, no se inventa un porcentaje. */
function Delta({ actual, anterior, invertir }: { actual: number; anterior: number; invertir?: boolean }) {
  if (!anterior && !actual) return <span className="text-xs text-gris">Sin datos</span>;
  if (!anterior) return <span className="text-xs text-gris">Sin período anterior</span>;
  const d = ((actual - anterior) / anterior) * 100;
  if (Math.abs(d) < 0.5) return <span className="inline-flex items-center gap-1 text-xs text-gris"><Minus className="size-3" aria-hidden="true" />Igual que antes</span>;
  const sube = d > 0;
  const bueno = invertir ? !sube : sube;
  const Icon = sube ? ArrowUp : ArrowDown;
  return (
    <span className={clsx("inline-flex items-center gap-1 text-xs font-semibold", bueno ? "text-emerald-700" : "text-red-700")}>
      <Icon className="size-3" aria-hidden="true" />
      {n1.format(Math.abs(d))} % <span className="font-normal text-gris">vs. período anterior</span>
    </span>
  );
}

function Kpi({ titulo, valor, pie, nota }: { titulo: string; valor: string; pie?: React.ReactNode; nota?: string }) {
  return (
    <div className={tarjeta}>
      <p className="text-xs font-semibold tracking-wide text-gris uppercase">{titulo}</p>
      <p className="font-display mt-1 text-3xl font-extrabold text-noche">{valor}</p>
      <div className="mt-1 min-h-5">{pie}</div>
      {nota && <p className="mt-1 text-xs text-gris">{nota}</p>}
    </div>
  );
}

function Seccion({ titulo, descripcion, children }: { titulo: string; descripcion?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="font-display text-lg font-extrabold text-noche">{titulo}</h2>
        {descripcion && <p className="text-sm text-gris">{descripcion}</p>}
      </div>
      {children}
    </section>
  );
}

/** Barras horizontales con etiqueta y cantidad. */
function Barras({ datos, vacio = "Sin datos en este período.", format = (n: number) => nf.format(n), color = "bg-profundo" }: {
  datos: { etiqueta: string; n: number }[]; vacio?: string; format?: (n: number) => string; color?: string;
}) {
  if (!datos.length) return <p className="text-sm text-gris">{vacio}</p>;
  const max = Math.max(...datos.map((d) => d.n), 1);
  return (
    <ul className="space-y-2">
      {datos.map((d) => (
        <li key={d.etiqueta} className="text-sm">
          <div className="flex items-baseline justify-between gap-3">
            <span className="min-w-0 truncate text-noche">{d.etiqueta}</span>
            <span className="font-semibold text-noche tabular-nums">{format(d.n)}</span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-niebla" aria-hidden="true">
            <div className={clsx("h-2 rounded-full", color)} style={{ width: `${Math.max(3, (d.n / max) * 100)}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Columnas por día. Las emergencias se apilan en amarillo (el amarillo es solo para emergencias). */
function Columnas({ dias }: { dias: Dia[] }) {
  const max = Math.max(...dias.map((d) => d.cotizaciones + d.emergencias), 1);
  const total = dias.reduce((a, d) => a + d.cotizaciones + d.emergencias, 0);
  const w = 720;
  const h = 160;
  const gap = dias.length > 45 ? 1 : 3;
  const bw = (w - gap * (dias.length - 1)) / dias.length;
  const etiquetas = [0, Math.floor((dias.length - 1) / 2), dias.length - 1];
  return (
    <figure>
      <svg viewBox={`0 0 ${w} ${h + 22}`} className="w-full" role="img"
        aria-label={`Solicitudes por día, ${total} en total. El día con más solicitudes tuvo ${max}.`}>
        <line x1="0" y1={h} x2={w} y2={h} stroke="#cfd6e4" />
        {dias.map((d, i) => {
          const hc = (d.cotizaciones / max) * (h - 8);
          const he = (d.emergencias / max) * (h - 8);
          const x = i * (bw + gap);
          return (
            <g key={d.dia}>
              <title>{`${d.dia}: ${d.cotizaciones} cotizaciones, ${d.emergencias} emergencias`}</title>
              {hc > 0 && <rect x={x} y={h - hc} width={bw} height={hc} rx="2" fill="#0066b2" />}
              {he > 0 && <rect x={x} y={h - hc - he} width={bw} height={he} rx="2" fill="#ffc21a" />}
            </g>
          );
        })}
        {etiquetas.map((i) => (
          <text key={i} x={Math.min(w, Math.max(0, i * (bw + gap) + bw / 2))} y={h + 16} textAnchor={i === 0 ? "start" : i === dias.length - 1 ? "end" : "middle"} fontSize="11" fill="#8a8f98">
            {dias[i]?.dia.slice(5).split("-").reverse().join("/")}
          </text>
        ))}
      </svg>
      <figcaption className="mt-1 flex flex-wrap gap-4 text-xs text-gris">
        <span className="inline-flex items-center gap-1.5"><i className="inline-block size-2.5 rounded-sm bg-profundo" />Cotizaciones</span>
        <span className="inline-flex items-center gap-1.5"><i className="inline-block size-2.5 rounded-sm bg-alerta" />Emergencias</span>
      </figcaption>
    </figure>
  );
}

function Linea({ datos, etiqueta }: { datos: { dia: string; sesiones: number }[]; etiqueta: string }) {
  if (datos.length < 2) return <p className="text-sm text-gris">Sin datos en este período.</p>;
  const w = 720;
  const h = 140;
  const max = Math.max(...datos.map((d) => d.sesiones), 1);
  const pts = datos.map((d, i) => [(i / (datos.length - 1)) * w, h - 6 - (d.sesiones / max) * (h - 16)] as const);
  const path = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h + 20}`} className="w-full" role="img" aria-label={`${etiqueta}. Máximo diario: ${max}.`}>
      <line x1="0" y1={h} x2={w} y2={h} stroke="#cfd6e4" />
      <path d={`${path} L${w} ${h} L0 ${h} Z`} fill="#00aeef" opacity="0.12" />
      <path d={path} fill="none" stroke="#0066b2" strokeWidth="2" strokeLinejoin="round" />
      {[0, datos.length - 1].map((i) => (
        <text key={i} x={i === 0 ? 0 : w} y={h + 16} textAnchor={i === 0 ? "start" : "end"} fontSize="11" fill="#8a8f98">
          {datos[i].dia.slice(5).split("-").reverse().join("/")}
        </text>
      ))}
    </svg>
  );
}

const PASOS: Record<string, string> = {
  start: "Saludo: no eligió una opción",
  other: "Menú de otros servicios",
  notsure: "No supo qué elegir",
  q_privacy: "Cotización: ciudad",
  q2: "Cotización: pregunta técnica",
  q2_otra: "Cotización: ciudad",
  q2b: "Cotización: dato adicional",
  q3: "Cotización: para cuándo",
  q4: "Cotización: nombre y empresa",
  q5: "Cotización: cómo contactarlo",
  q5_tel: "Cotización: teléfono",
  q5_mail: "Cotización: correo",
  q6: "Cotización: confirmación",
  em1: "Emergencia: riesgo inmediato",
  em2: "Emergencia: ubicación",
  em3: "Emergencia: qué pasa",
  em3_alcance: "Emergencia: alcance del corte",
  em3_otro: "Emergencia: descripción",
  em4: "Emergencia: nombre",
  em5: "Emergencia: teléfono",
  faq: "Preguntas frecuentes (consulta)",
  faq_servicios: "Preguntas frecuentes (consulta)",
  faq_horario: "Preguntas frecuentes (consulta)",
  faq_cobertura: "Preguntas frecuentes (consulta)",
  faq_cotizar: "Preguntas frecuentes (consulta)",
  faq_personal: "Preguntas frecuentes (consulta)",
  faq_falla: "Preguntas frecuentes (consulta)",
  price: "Preguntó por el precio",
  human: "Pidió hablar con una persona",
};
const paso = (id: string) => PASOS[id] ?? `Servicio: ${id.replace(/_/g, " ")}`;

function lectura(e: Estadisticas, t: Trafico | null): { mood: "feliz" | "contento" | "pensativo" | "serio"; texto: string } {
  const { actual: a, anterior: p } = e;
  const partes: string[] = [];
  if (e.vencidasAhora > 0) partes.push(`Hay ${e.vencidasAhora} ${e.vencidasAhora === 1 ? "solicitud vencida" : "solicitudes vencidas"} sin primer contacto.`);
  if (!a.total) partes.push(`No llegaron solicitudes en los últimos ${e.dias} días.`);
  else if (!p.total) partes.push(`Llegaron ${a.total} ${a.total === 1 ? "solicitud" : "solicitudes"} en los últimos ${e.dias} días.`);
  else {
    const d = Math.round(((a.total - p.total) / p.total) * 100);
    partes.push(
      d === 0
        ? `Las solicitudes se mantienen en ${a.total}.`
        : `Las solicitudes ${d > 0 ? "subieron" : "bajaron"} ${Math.abs(d)} % (${a.total} frente a ${p.total}).`,
    );
  }
  if (t && t.sesiones > 0 && a.total) partes.push(`Convirtieron ${pct(a.total, t.sesiones)} de las visitas.`);
  return { mood: e.vencidasAhora ? "serio" : a.total ? "contento" : "pensativo", texto: partes.join(" ") };
}

export default async function Dashboard({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin();
  const sp = await searchParams;
  const raw = Array.isArray(sp.dias) ? sp.dias[0] : sp.dias;
  const dias = periodoValido(raw);

  const configurado = await ga4Configured();
  const [e, t] = await Promise.all([
    estadisticas(dias),
    configurado ? trafico(dias).then((data) => ({ data, error: null as string | null })).catch((err: Error) => ({ data: null, error: err.message })) : Promise.resolve(null),
  ]);
  const web = t?.data ?? null;
  const { actual: a, anterior: p } = e;
  const brief = lectura(e, web);
  const cerradas = a.ganadas + a.perdidas;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-noche">Dashboard</h1>
          <p className="text-sm text-gris">Últimos {dias} días, comparados con los {dias} anteriores.</p>
        </div>
        <nav aria-label="Período" className="flex gap-1 rounded-xl bg-white p-1 shadow-card">
          {PERIODOS.map((d) => (
            <Link key={d} href={`/portal/dashboard?dias=${d}`} aria-current={d === dias ? "page" : undefined}
              className={clsx("rounded-lg px-3 py-1.5 text-sm font-semibold", d === dias ? "bg-profundo text-white" : "text-noche hover:bg-niebla")}>
              {d} días
            </Link>
          ))}
        </nav>
      </div>

      <PuestaEnMarcha />

      <section className={`${tarjeta} flex items-start gap-4`} aria-label="Lectura de Manta">
        <MantaAvatar mood={brief.mood} size={48} className="shrink-0" />
        <div>
          <p className="font-semibold text-noche">Así va el período</p>
          <p className="text-sm text-noche/80">{brief.texto}</p>
        </div>
      </section>

      <Seccion titulo="Solicitudes" descripcion="Conversión real: cada solicitud que llegó por el formulario o por Manta.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi titulo="Solicitudes" valor={nf.format(a.total)} pie={<Delta actual={a.total} anterior={p.total} />} nota={`${a.cotizaciones} cotizaciones · ${a.emergencias} emergencias`} />
          <Kpi titulo="Por Manta" valor={a.total ? pct(a.por_manta, a.total) : "—"} nota={`${a.por_manta} por el chat · ${a.por_formulario} por el formulario`} />
          <Kpi
            titulo="Primer contacto"
            valor={a.horas_primer_contacto == null ? "—" : a.horas_primer_contacto < 1 ? `${Math.round(a.horas_primer_contacto * 60)} min` : `${n1.format(a.horas_primer_contacto)} h`}
            pie={a.horas_primer_contacto != null && p.horas_primer_contacto != null ? <Delta actual={a.horas_primer_contacto} anterior={p.horas_primer_contacto} invertir /> : undefined}
            nota="Tiempo medio desde que llega hasta que se atiende"
          />
          <Kpi titulo="Vencidas ahora" valor={nf.format(e.vencidasAhora)} nota={`${e.abiertasAhora} casos abiertos en total`} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi titulo="Ganadas" valor={nf.format(a.ganadas)} pie={<Delta actual={a.ganadas} anterior={p.ganadas} />} />
          <Kpi titulo="Perdidas" valor={nf.format(a.perdidas)} pie={<Delta actual={a.perdidas} anterior={p.perdidas} invertir />} />
          <Kpi titulo="Tasa de cierre ganado" valor={cerradas ? pct(a.ganadas, cerradas) : "—"} nota="Ganadas sobre ganadas más perdidas" />
          <Kpi titulo="Días hasta el cierre" valor={a.dias_cierre == null ? "—" : n1.format(a.dias_cierre)} nota="Promedio de los casos cerrados" />
        </div>

        <div className={tarjeta}>
          <h3 className="mb-3 font-semibold text-noche">Solicitudes por día</h3>
          <Columnas dias={e.porDia} />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className={tarjeta}>
            <h3 className="mb-3 font-semibold text-noche">Servicio más pedido</h3>
            <Barras datos={e.porServicio} vacio="Sin cotizaciones en este período." />
          </div>
          <div className={tarjeta}>
            <h3 className="mb-3 font-semibold text-noche">Ciudades</h3>
            <Barras datos={e.porCiudad} />
          </div>
          <div className={tarjeta}>
            <h3 className="mb-3 font-semibold text-noche">Estado actual de los casos</h3>
            <Barras datos={e.porEstado.map((x: Conteo) => ({ etiqueta: ESTADOS[x.etiqueta as Estado]?.label ?? x.etiqueta, n: x.n }))} />
          </div>
        </div>

        <div className={tarjeta}>
          <h3 className="mb-3 font-semibold text-noche">Casos por responsable</h3>
          {e.porResponsable.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs text-gris uppercase">
                  <tr><th className="py-1 pr-4 font-semibold">Responsable</th><th className="py-1 pr-4 text-right font-semibold">Asignados</th><th className="py-1 pr-4 text-right font-semibold">Abiertos</th><th className="py-1 text-right font-semibold">Ganados o facturados</th></tr>
                </thead>
                <tbody>
                  {e.porResponsable.map((r) => (
                    <tr key={r.nombre} className="border-t border-noche/10">
                      <td className="py-2 pr-4">{r.nombre}</td>
                      <td className="py-2 pr-4 text-right tabular-nums">{r.asignados}</td>
                      <td className="py-2 pr-4 text-right tabular-nums">{r.abiertas}</td>
                      <td className="py-2 text-right tabular-nums">{r.ganadas}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gris">Aún no hay casos asignados en este período.</p>
          )}
        </div>
      </Seccion>

      <Seccion titulo="Chat de Manta" descripcion="Conversaciones iniciadas por los visitantes y dónde se quedan.">
        <div className="grid gap-4 lg:grid-cols-3">
          <Kpi titulo="Conversaciones" valor={nf.format(e.chat.iniciadas)} />
          <Kpi titulo="Terminaron en solicitud" valor={nf.format(e.chat.completas)} nota={e.chat.iniciadas ? `${pct(e.chat.completas, e.chat.iniciadas)} de las conversaciones` : undefined} />
          <Kpi titulo="Abandonadas" valor={nf.format(e.chat.abandonadas)} />
        </div>
        <div className={tarjeta}>
          <h3 className="mb-3 font-semibold text-noche">En qué paso abandonan</h3>
          <Barras datos={e.chat.porPaso.map((x) => ({ etiqueta: paso(x.etiqueta), n: x.n }))} vacio="Todavía no hay conversaciones abandonadas registradas." />
        </div>
      </Seccion>

      <Seccion titulo="Tráfico del sitio" descripcion="Datos de Google Analytics 4, actualizados cada 30 minutos.">
        {!configurado && (
          <div className={tarjeta}>
            <p className="font-semibold text-noche">Google Analytics 4 aún no está conectado</p>
            <p className="mt-1 text-sm text-noche/80">
              Para ver visitantes, tiempo de permanencia, páginas más vistas y fuentes de tráfico hay que crear la propiedad de Google Analytics a nombre de la empresa
              y cargar sus datos en el portal. Gerencia puede cargar los datos en <Link href="/portal/ajustes" className="font-semibold text-profundo underline">Ajustes</Link>; la guía paso a paso está en <code className="rounded bg-niebla px-1">docs/GA4.md</code>.
            </p>
          </div>
        )}
        {t?.error && (
          <div className={clsx(tarjeta, "border-l-4 border-alerta")}>
            <p className="font-semibold text-noche">No se pudo leer Google Analytics</p>
            <p className="mt-1 text-sm break-words text-noche/80">{t.error}</p>
          </div>
        )}
        {web && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Kpi titulo="Visitantes únicos" valor={nf.format(web.usuarios)} pie={<Delta actual={web.usuarios} anterior={web.usuariosAnt} />} nota={`${nf.format(web.nuevos)} nuevos`} />
              <Kpi titulo="Sesiones" valor={nf.format(web.sesiones)} pie={<Delta actual={web.sesiones} anterior={web.sesionesAnt} />} />
              <Kpi titulo="Tiempo de permanencia" valor={duracion(web.duracion)} pie={<Delta actual={web.duracion} anterior={web.duracionAnt} />} nota="Promedio por sesión" />
              <Kpi titulo="Tasa de conversión" valor={web.sesiones ? pct(a.total, web.sesiones) : "—"} nota="Solicitudes sobre sesiones" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Kpi titulo="Páginas vistas" valor={nf.format(web.vistas)} pie={<Delta actual={web.vistas} anterior={web.vistasAnt} />} />
              <Kpi titulo="Interacción" valor={`${n1.format(web.interaccion * 100)} %`} nota="Sesiones con interacción real" />
              <Kpi titulo="Clics de conversión" valor={nf.format(web.clics.reduce((s, c) => s + c.n, 0))} nota="Llamar, WhatsApp, cotizar, chat" />
              <Kpi titulo="Visitas por solicitud" valor={a.total ? nf.format(Math.round(web.sesiones / a.total)) : "—"} />
            </div>
            <div className={tarjeta}>
              <h3 className="mb-3 font-semibold text-noche">Sesiones por día</h3>
              <Linea datos={web.porDia} etiqueta="Sesiones por día" />
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className={tarjeta}>
                <h3 className="mb-3 font-semibold text-noche">Páginas más visitadas</h3>
                <Barras datos={web.paginas.map((x) => ({ etiqueta: x.ruta, n: x.vistas }))} />
              </div>
              <div className={tarjeta}>
                <h3 className="mb-3 font-semibold text-noche">Fuentes de tráfico</h3>
                <Barras datos={web.fuentes.map((x) => ({ etiqueta: x.canal, n: x.sesiones }))} />
              </div>
              <div className={tarjeta}>
                <h3 className="mb-3 font-semibold text-noche">Interacciones por botón</h3>
                <Barras datos={web.clics.map((x) => ({ etiqueta: x.cta.replace(/_/g, " "), n: x.n }))} vacio="Todavía no hay clics registrados." />
              </div>
              <div className={tarjeta}>
                <h3 className="mb-3 font-semibold text-noche">Dispositivos y ciudades</h3>
                <Barras datos={web.dispositivos.map((x) => ({ etiqueta: x.tipo, n: x.sesiones }))} />
                <hr className="my-4 border-noche/10" />
                <Barras datos={web.ciudades.map((x) => ({ etiqueta: x.ciudad, n: x.usuarios }))} />
              </div>
            </div>
          </>
        )}
      </Seccion>
    </div>
  );
}
