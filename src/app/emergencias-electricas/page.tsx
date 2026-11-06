import type { Metadata } from "next";
import Image from "next/image";
import { Ban, Flame, MapPin, Phone, ShieldAlert, Siren } from "lucide-react";
import { site } from "@/content/site";
import { getEmergencyService, getProjects, getSettings } from "@/data/content";
import { telHref, waEmergencyHref } from "@/lib/links";
import { breadcrumbJsonLd, serviceJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/shared/PageHero";
import { ButtonLink } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/Icons";
import { Pending } from "@/components/ui/Pending";
import { Reveal } from "@/components/motion/Reveal";
import { ProjectCard } from "@/components/home/ProjectsPreview";
import { OpenMantaButton } from "@/components/chat/OpenMantaButton";

export const metadata: Metadata = {
  title: "Emergencias eléctricas en el Caribe",
  description:
    "Atención de fallas eléctricas en baja y media tensión, transformadores y sistemas de medida en todo el país, con respuesta más rápida en Barranquilla, Cartagena, Santa Marta, Montería, Valledupar y Sincelejo. Llame al +57 300 687 3112.",
  alternates: { canonical: "/emergencias-electricas" },
  keywords: ["emergencia eléctrica Barranquilla", "falla eléctrica media tensión", "electricista industrial urgente"],
};

const crumbs = [
  { name: "Inicio", href: "/" },
  { name: "Emergencias eléctricas", href: "/emergencias-electricas" },
];

const steps = [
  "Llámenos o escríbanos.",
  "Díganos dónde está y qué está pasando.",
  "El equipo lo llama para confirmar si puede atenderlo y en qué plazo.",
  "Si se confirma, restablecemos el servicio y le entregamos un informe de lo que encontramos.",
];

export default async function EmergencyPage() {
  const [service, projects, settings] = await Promise.all([getEmergencyService(), getProjects(), getSettings()]);
  const related = projects.find((p) => p.serviceSlug === "emergencias");
  return (
    <>
      <JsonLd data={serviceJsonLd(service, `${site.url}/emergencias-electricas`, settings)} />
      <JsonLd data={breadcrumbJsonLd(crumbs)} />

      {/* Portada: los botones van antes que cualquier explicación */}
      <section className="relative overflow-hidden bg-noche text-white">
        <div className="absolute inset-0">
          <Image
            src={service.photo.src}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-noche/70 via-noche/85 to-noche" />
        </div>
        <div className="container-x relative py-10 md:py-16">
          <Breadcrumbs items={crumbs} dark />
          <div className="mt-6 flex items-center gap-3">
            <span className="inline-flex size-12 items-center justify-center rounded-full bg-alerta text-noche">
              <Siren className="size-6" aria-hidden="true" />
            </span>
            <p className="eyebrow text-alerta">Línea de emergencias</p>
          </div>
          <h1 className="h1 mt-4 max-w-3xl text-white">{service.title}</h1>
          <p className="lead mt-4 max-w-2xl text-white/80">{service.intro}</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3 sm:gap-4">
            <ButtonLink href={telHref} variant="emergency" size="lg" className="w-full">
              <Phone className="size-5" aria-hidden="true" />
              Llamar ahora
            </ButtonLink>
            <ButtonLink href={waEmergencyHref} variant="white" size="lg" className="w-full">
              <WhatsAppIcon />
              Escribir por WhatsApp
            </ButtonLink>
            <OpenMantaButton className="btn btn-outline-white btn-lg w-full" flow="emergency">
              Reportar con Manta
            </OpenMantaButton>
          </div>
          <p className="mt-4 text-sm text-white/70">
            <a href={telHref} className="font-display text-lg font-bold text-white tabular-nums">
              {site.phone.display}
            </a>{" "}
            · La atención se confirma en cada caso, según la disponibilidad del equipo.
          </p>
        </div>
      </section>

      {/* Seguridad primero */}
      <section className="bg-alerta/15">
        <div className="container-x py-8 md:py-10">
          <div className="flex flex-col gap-5 rounded-card border-l-4 border-alerta bg-white p-6 shadow-card md:flex-row md:items-start md:gap-8 md:p-8">
            <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-alerta text-noche">
              <ShieldAlert className="size-6" aria-hidden="true" />
            </span>
            <div className="flex-1">
              <h2 className="h3 text-noche">Seguridad primero</h2>
              <p className="mt-1 text-noche/80">Si hay fuego, personas lesionadas o cables en el suelo:</p>
              <ol className="mt-4 grid gap-3 sm:grid-cols-3">
                {[
                  { icon: Flame, text: "Aléjese del área y mantenga a otros lejos." },
                  { icon: Ban, text: "No toque la instalación ni los equipos." },
                  { icon: Phone, text: "Llame al 123." },
                ].map(({ icon: StepIcon, text }, i) => (
                  <li key={text} className="flex items-start gap-3 rounded-xl bg-niebla p-4">
                    <span className="font-display text-2xl font-extrabold leading-none text-alerta">{i + 1}</span>
                    <span className="flex items-start gap-2 text-[0.9375rem] leading-snug text-noche/85">
                      <StepIcon className="mt-0.5 size-4 shrink-0 text-noche/60" aria-hidden="true" />
                      {text}
                    </span>
                  </li>
                ))}
              </ol>
              <ButtonLink href="tel:123" variant="outline" size="sm" className="mt-4">
                <Phone className="size-4" aria-hidden="true" />
                Llamar al 123
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-20">
        <div className="container-x grid gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <h2 className="h2 text-noche">Qué atendemos</h2>
            <ul className="mt-4 grid gap-2">
              {service.includes.map((it) => (
                <li key={it.text} className="lead flex items-start gap-2">
                  <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-master" aria-hidden="true" />
                  <span>
                    {it.text} {it.pending && <Pending inline>validar</Pending>}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-6 rounded-card bg-niebla p-6">
              <h3 className="font-display text-base font-bold text-noche">Qué no atendemos</h3>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-noche/75">
                Si el corte afecta a todo su barrio o sector, se trata de una
                falla de la red pública: comuníquese con su operador de red.
                Master Tools atiende fallas en las instalaciones eléctricas de
                empresas, industrias y comercios, y también en residencias como
                servicio al particular, por ejemplo cuando el operador de red no
                responde.
              </p>
            </div>
            <h2 className="h2 mt-12 text-noche">Dónde</h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {settings.emergencyDepartments.map((d) => (
                <li key={d} className="chip chip-noche gap-1.5 px-3.5 py-1.5 text-[0.8125rem]">
                  <MapPin className="size-3.5 text-master" aria-hidden="true" />
                  {d}
                </li>
              ))}
            </ul>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-noche/65">
              Atendemos emergencias en todo el país, con tiempos de respuesta más
              cortos en estos departamentos, donde está nuestra base.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <h2 className="h2 text-noche">Cómo funciona</h2>
            <ol className="mt-6 grid gap-4">
              {steps.map((t, i) => (
                <li key={t} className="flex items-start gap-4 rounded-card bg-white p-5 shadow-card ring-1 ring-noche/5">
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-noche font-display font-extrabold text-master">
                    {i + 1}
                  </span>
                  <p className="pt-2 text-[0.9375rem] leading-relaxed text-noche/85">{t}</p>
                </li>
              ))}
            </ol>
            <p className="mt-5 text-sm leading-relaxed text-noche/65">
              Fuera del horario de oficina el reporte se recibe igual y el equipo
              lo contacta para confirmar si puede atender. Si hay riesgo para
              personas, llame primero al 123.
            </p>
            {related && (
              <div className="mt-10">
                <h2 className="h3 text-noche">Caso relacionado</h2>
                <div className="mt-4 max-w-md">
                  <ProjectCard p={related} />
                </div>
              </div>
            )}
          </Reveal>
        </div>
      </section>

      <section className="bg-noche text-white">
        <div className="container-x flex flex-col items-start gap-6 py-12 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="h2 text-white">¿Tiene la falla ahora?</h2>
            <p className="mt-2 text-white/75">Llámenos y díganos dónde está y qué está pasando.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={telHref} variant="emergency" size="lg">
              <Phone className="size-5" aria-hidden="true" />
              Llamar ahora
            </ButtonLink>
            <ButtonLink href={waEmergencyHref} variant="outline-white" size="lg">
              <WhatsAppIcon />
              WhatsApp
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
