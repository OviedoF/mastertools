import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  Check,
  ClipboardCheck,
  FileText,
  MapPin,
  Ruler,
  Users,
} from "lucide-react";
import { serviceHref } from "@/content/services";
import { site } from "@/content/site";
import { getProjects, getService, getServiceLines, getServices, getSettings } from "@/data/content";
import { waHref } from "@/lib/links";
import { breadcrumbJsonLd, faqJsonLd, serviceJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageHero } from "@/components/shared/PageHero";
import { EmergencyBand } from "@/components/shared/EmergencyBand";
import { ClosingCta } from "@/components/shared/ClosingCta";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { WhatsAppIcon } from "@/components/ui/Icons";
import { Pending } from "@/components/ui/Pending";
import { Reveal } from "@/components/motion/Reveal";
import { ProjectCard } from "@/components/home/ProjectsPreview";

export async function generateStaticParams() {
  return (await getServiceLines({ published: true })).map((s) => ({ slug: s.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const s = await getService(slug);
  if (!s) return {};
  return {
    title: s.seo.title,
    description: s.seo.description,
    keywords: s.seo.keywords,
    alternates: { canonical: `/servicios/${s.slug}` },
    openGraph: {
      title: `${s.seo.title} | Master Tools`,
      description: s.seo.description,
      images: [{ url: s.photo.src, alt: s.photo.alt }],
    },
  };
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const [s, services, projects, settings] = await Promise.all([
    getService(slug),
    getServices(),
    getProjects(),
    getSettings(),
  ]);
  if (!s) notFound();

  const url = `${site.url}/servicios/${s.slug}`;
  const crumbs = [
    { name: "Inicio", href: "/" },
    { name: "Servicios", href: "/servicios" },
    { name: s.shortName, href: `/servicios/${s.slug}` },
  ];
  const related = projects.filter((p) => p.serviceSlug === s.slug).slice(0, 2);
  const others = services.filter((o) => o.slug !== s.slug).slice(0, 8);
  const wa = waHref(s.whatsapp);

  return (
    <>
      <JsonLd data={serviceJsonLd(s, url, settings)} />
      <JsonLd data={faqJsonLd(s.faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs)} />

      <PageHero crumbs={crumbs} eyebrow={s.shortName} title={s.title} text={s.intro} photo={s.photo}>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href={`/contacto?servicio=${s.slug}`} size="lg">
            Solicitar cotización
          </ButtonLink>
          <ButtonLink href={wa} variant="outline" size="lg">
            <WhatsAppIcon />
            Escribir por WhatsApp
          </ButtonLink>
        </div>
      </PageHero>

      <section className="bg-white py-16 md:py-20">
        <div className="container-x grid gap-12 lg:grid-cols-[1fr_340px] lg:gap-16">
          <div className="min-w-0">
            {/* Qué incluye */}
            <Reveal>
              <h2 className="h2 text-noche">Qué incluye</h2>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {s.includes.map((it) => (
                  <li key={it.text} className="flex items-start gap-3 rounded-xl bg-niebla p-4">
                    <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-master/20 text-profundo">
                      <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
                    </span>
                    <span className="text-[0.9375rem] leading-snug text-noche/85">
                      {it.text}{" "}
                      {it.pending && <Pending inline>validar</Pending>}
                    </span>
                  </li>
                ))}
              </ul>
              {s.pendingNotes?.length ? (
                <Pending className="mt-4">
                  <ul className="list-disc pl-4">
                    {s.pendingNotes.map((n) => (
                      <li key={n}>{n}</li>
                    ))}
                  </ul>
                </Pending>
              ) : null}
            </Reveal>

            {/* Para quién / qué entregamos */}
            <Reveal className="mt-14 grid gap-6 md:grid-cols-2" stagger={0.1}>
              <div className="card p-6">
                <span className="icon-circle-claro">
                  <Users className="size-6" strokeWidth={1.75} aria-hidden="true" />
                </span>
                <h3 className="h3 mt-4 text-noche">Para quién</h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-noche/75">{s.forWho}</p>
              </div>
              <div className="card p-6">
                <span className="icon-circle-claro">
                  <FileText className="size-6" strokeWidth={1.75} aria-hidden="true" />
                </span>
                <h3 className="h3 mt-4 text-noche">Qué entregamos</h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-noche/75">
                  Informe técnico con las actividades realizadas, los resultados
                  de las pruebas, el registro fotográfico y las recomendaciones.
                </p>
              </div>
            </Reveal>

            {/* Normas y equipos */}
            <Reveal className="mt-14">
              <h2 className="h2 text-noche">Normas y equipos</h2>
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div className="flex gap-4">
                  <span className="icon-circle">
                    <ClipboardCheck className="size-6" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-bold text-noche">Normas</h3>
                    <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-noche/75">
                      {s.norms ??
                        "Trabajos conforme a RETIE y NTC 2050 (Código Eléctrico Colombiano), con pautas internacionales IEEE y personal con matrícula profesional CONTE vigente."}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="icon-circle">
                    <Ruler className="size-6" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-bold text-noche">Instrumentación</h3>
                    <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-noche/75">
                      {s.equipment ??
                        "Instrumentación calibrada para diagnóstico, medición y puesta en servicio: TTR, medidores de aislamiento y analizadores de red."}
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Caso relacionado */}
            {s.caseStudy && (
              <Reveal className="mt-14">
                <h2 className="h2 text-noche">Caso relacionado</h2>
                <div className="mt-6 flex flex-col gap-5 rounded-card bg-noche p-6 text-white md:flex-row md:items-center md:p-8">
                  <div className="flex-1">
                    <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-master uppercase">
                      <MapPin className="size-3.5" aria-hidden="true" />
                      {s.caseStudy.place}
                    </p>
                    <p className="mt-2 font-display text-xl font-bold">{s.caseStudy.text}</p>
                  </div>
                  <ButtonLink href="/proyectos" variant="white" className="shrink-0">
                    Ver proyectos
                    <ArrowRight className="size-5" aria-hidden="true" />
                  </ButtonLink>
                </div>
                {related.length > 0 && (
                  <div className="mt-6 grid gap-6 sm:grid-cols-2">
                    {related.map((p) => (
                      <ProjectCard key={p.slug} p={p} />
                    ))}
                  </div>
                )}
              </Reveal>
            )}

            {/* Preguntas frecuentes */}
            {s.faqs.length > 0 && (
              <Reveal className="mt-14">
                <h2 className="h2 text-noche">Preguntas frecuentes</h2>
                <div className="mt-6 divide-y divide-noche/10 rounded-card ring-1 ring-noche/10">
                  {s.faqs.map((f) => (
                    <details key={f.q} className="group px-6 py-5 open:bg-niebla/60">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-[1.0625rem] font-semibold text-noche [&::-webkit-details-marker]:hidden">
                        {f.q}
                        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-claro text-profundo transition-transform group-open:rotate-45">
                          <span aria-hidden="true" className="text-xl leading-none">+</span>
                        </span>
                      </summary>
                      <p className="mt-3 max-w-prose text-[0.9375rem] leading-relaxed text-noche/80">
                        {f.a} {f.pending && <Pending inline>validar con el equipo técnico</Pending>}
                      </p>
                    </details>
                  ))}
                </div>
              </Reveal>
            )}
          </div>

          {/* Columna lateral */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="card p-6">
              <h2 className="h3 text-noche">¿Necesita este servicio?</h2>
              <p className="mt-2 text-sm leading-relaxed text-noche/70">
                Cuéntenos qué necesita y un ingeniero se comunicará con usted{" "}
                {settings.pending.responseTime ? <Pending inline>{settings.responseTime}</Pending> : settings.responseTime}.
              </p>
              <div className="mt-5 grid gap-3">
                <ButtonLink href={`/contacto?servicio=${s.slug}`}>Solicitar cotización</ButtonLink>
                <ButtonLink href={wa} variant="outline">
                  <WhatsAppIcon />
                  Escribir por WhatsApp
                </ButtonLink>
              </div>
              <p className="mt-4 text-xs text-noche/60">
                Si es una emergencia, no use el formulario: llame al{" "}
                <a href={`tel:${site.phone.tel}`} className="font-semibold text-noche">
                  {site.phone.display}
                </a>
                .
              </p>
            </div>
            <div className="mt-6 rounded-card bg-niebla p-6">
              <h2 className="eyebrow text-noche/60">Otros servicios</h2>
              <ul className="mt-3 grid gap-1">
                {others.map((o) => (
                  <li key={o.slug}>
                    <Link
                      href={serviceHref(o)}
                      className="flex items-center gap-3 rounded-lg px-2 py-2 text-[0.9375rem] font-medium text-noche/85 hover:bg-white hover:text-profundo"
                    >
                      <Icon name={o.icon} className="size-4 text-master" strokeWidth={1.75} aria-hidden="true" />
                      {o.shortName}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>

      <EmergencyBand />
      <ClosingCta
        title={`Cotice ${s.shortName.toLowerCase()} con un solo aliado técnico`}
        text="Cuéntenos qué necesita y le respondemos con una propuesta técnica, sin compromiso."
        whatsappHref={wa}
      />
    </>
  );
}
