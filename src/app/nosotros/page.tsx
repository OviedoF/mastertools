import type { Metadata } from "next";
import Image from "next/image";
import { Award, Gauge, HeartHandshake, ShieldCheck, Target, Users } from "lucide-react";
import { getAbout, getProcessSteps, getSettings } from "@/data/content";
import { homeContent } from "@/content/pages";
import { breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageHero } from "@/components/shared/PageHero";
import { Process } from "@/components/home/Process";
import { Stats } from "@/components/home/Stats";
import { ClosingCta } from "@/components/shared/ClosingCta";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Pending } from "@/components/ui/Pending";
import { Reveal } from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: { absolute: "Nosotros | Master Tools & Services S.A.S." },
  description:
    "Empresa de ingeniería eléctrica del Caribe colombiano con personal con matrícula CONTE, equipos calibrados y más de 350 intervenciones ejecutadas.",
  alternates: { canonical: "/nosotros" },
  keywords: ["empresa ingeniería eléctrica Caribe"],
};

const crumbs = [
  { name: "Inicio", href: "/" },
  { name: "Nosotros", href: "/nosotros" },
];

const valueIcons = [ShieldCheck, Award, Gauge, HeartHandshake];

export default async function AboutPage() {
  const [about, site, steps] = await Promise.all([getAbout(), getSettings(), getProcessSteps()]);
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <PageHero
        crumbs={crumbs}
        eyebrow="Quiénes somos"
        title={about.title}
        text={
          <>
            {about.intro}{" "}
            {site.pending.city ? <Pending inline>{site.city}</Pending> : null}
          </>
        }
        photo={{ src: about.photo.src, alt: about.photo.alt, position: "center 30%" }}
      />

      <Section tone="white">
        <div className="grid gap-8 md:grid-cols-2">
          <Reveal className="card p-8">
            <span className="icon-circle">
              <Target className="size-6" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <h2 className="h2 mt-5 text-noche">Misión</h2>
            <p className="prose-mt mt-3">{about.mission}</p>
          </Reveal>
          <Reveal className="card p-8" delay={0.1}>
            <span className="icon-circle">
              <Users className="size-6" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <h2 className="h2 mt-5 text-noche">Visión</h2>
            <p className="prose-mt mt-3">{about.vision}</p>
          </Reveal>
        </div>
      </Section>

      <Stats stats={site.stats} />

      <Section tone="niebla">
        <div className="grid gap-12 lg:grid-cols-2">
          <Reveal>
            <SectionHeading
              eyebrow="Respaldo"
              title="Personal certificado y equipos calibrados"
              text="Personal técnico con matrícula profesional CONTE vigente y procesos conforme a RETIE y NTC 2050, con pautas internacionales IEEE."
            />
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="card p-6">
                <h3 className="font-display text-lg font-bold text-noche">Equipo</h3>
                <p className="mt-2 text-[0.9375rem] text-noche/75">{about.teamText}</p>
                {about.team.length > 0 ? (
                  <ul className="mt-4 grid gap-3">
                    {about.team.map((m) => (
                      <li key={m.name} className="flex items-center gap-3">
                        {m.photo?.src ? (
                          <Image src={m.photo.src} alt={m.photo.alt} width={48} height={48} className="size-12 rounded-full object-cover" />
                        ) : (
                          <span className="icon-circle-claro size-12 font-display text-sm font-bold">{m.name.slice(0, 1)}</span>
                        )}
                        <span>
                          <span className="block font-display text-sm font-semibold text-noche">{m.name}</span>
                          <span className="text-xs text-noche/60">{m.role}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <Pending className="mt-4">Nombre, cargo y foto de cada integrante, si autorizan publicarlos. Alternativa: foto grupal y descripción del equipo.</Pending>
                )}
              </div>
              <div className="card p-6">
                <h3 className="font-display text-lg font-bold text-noche">Instrumentación</h3>
                <p className="mt-2 text-[0.9375rem] text-noche/75">{about.equipmentText}</p>
                {about.equipmentList.length > 0 ? (
                  <ul className="mt-4 grid gap-1.5 text-sm text-noche/80">
                    {about.equipmentList.map((e) => (
                      <li key={e} className="flex items-start gap-2">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-master" aria-hidden="true" />
                        {e}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <Pending className="mt-4">Lista de equipos, con marcas y modelos si quieren mostrarlos.</Pending>
                )}
              </div>
            </div>
          </Reveal>
          <Reveal className="grid gap-4 sm:grid-cols-2" delay={0.1} stagger={0.08}>
            {about.photos.slice(0, 2).map((ph, i) => (
              <div key={ph.src} className={i === 1 ? "relative aspect-[3/4] overflow-hidden rounded-card sm:mt-10" : "relative aspect-[3/4] overflow-hidden rounded-card"}>
                <Image src={ph.src} alt={ph.alt} fill sizes="(min-width: 640px) 25vw, 50vw" className="object-cover" />
              </div>
            ))}
          </Reveal>
        </div>
      </Section>

      <Process steps={steps} title={homeContent.processTitle} text={homeContent.processText} detailed />

      <Section tone="white">
        <SectionHeading eyebrow="Valores" title="Lo que no se negocia" align="center" />
        <Reveal className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4" stagger={0.08}>
          {about.values.map((v, i) => {
            const ValueIcon = valueIcons[i % valueIcons.length];
            return (
              <div key={v.title} className="card p-6">
                <span className="icon-circle-claro">
                  <ValueIcon className="size-6" strokeWidth={1.75} aria-hidden="true" />
                </span>
                <h3 className="h3 mt-4 text-noche">{v.title}</h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-noche/75">{v.text}</p>
              </div>
            );
          })}
        </Reveal>
        <p className="mt-12 text-center text-noche/75">
          ¿Quiere trabajar con nosotros? Escríbanos a{" "}
          {site.pending.careersEmail ? (
            <Pending inline>{site.careersEmail}</Pending>
          ) : (
            <a href={`mailto:${site.careersEmail}`} className="link">
              {site.careersEmail}
            </a>
          )}
          .
        </p>
      </Section>

      <ClosingCta />
    </>
  );
}
