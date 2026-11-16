import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { getServiceLines, getSettings } from "@/data/content";
import { telHref, waGeneralHref } from "@/lib/links";
import { breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageHero } from "@/components/shared/PageHero";
import { QuoteForm } from "@/components/forms/QuoteForm";
import { WhatsAppIcon } from "@/components/ui/Icons";
import { Pending } from "@/components/ui/Pending";
import { OpenMantaButton } from "@/components/chat/OpenMantaButton";

export const metadata: Metadata = {
  title: "Contacto y cotizaciones",
  description:
    "Solicite una cotización de servicios de ingeniería eléctrica o reporte una emergencia. WhatsApp +57 300 687 3112.",
  alternates: { canonical: "/contacto" },
  keywords: ["cotización servicios eléctricos"],
};

const crumbs = [
  { name: "Inicio", href: "/" },
  { name: "Contacto", href: "/contacto" },
];

export default async function ContactPage() {
  const [site, services] = await Promise.all([getSettings(), getServiceLines()]);
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <PageHero
        crumbs={crumbs}
        title="Contacto y cotizaciones"
        text="Escríbanos por el medio que le quede más cómodo. Para emergencias, llame directamente."
      />
      <section className="bg-white py-12 md:py-16">
        <div className="container-x grid gap-10 lg:grid-cols-[1fr_360px] lg:gap-14">
          <Suspense fallback={<div className="card min-h-[600px] p-8" aria-busy="true" />}>
            <QuoteForm
              cities={site.cities}
              services={services.map((s) => ({ slug: s.slug, shortName: s.shortName }))}
              responseTime={site.responseTime}
              responseTimePending={site.pending.responseTime}
            />
          </Suspense>

          <aside className="grid content-start gap-6">
            <div className="card p-6">
              <h2 className="h3 text-noche">Canales</h2>
              <ul className="mt-5 grid gap-4 text-[0.9375rem]">
                <li>
                  <a href={waGeneralHref} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 text-noche hover:text-profundo">
                    <span className="icon-circle-claro size-10">
                      <WhatsAppIcon className="size-5" />
                    </span>
                    <span>
                      <span className="block text-xs font-semibold tracking-wide text-noche/55 uppercase">WhatsApp</span>
                      <span className="font-medium tabular-nums">{site.phone.display}</span>
                    </span>
                  </a>
                </li>
                <li>
                  <a href={`mailto:${site.email}`} className="flex items-start gap-3 text-noche hover:text-profundo">
                    <span className="icon-circle-claro size-10">
                      <Mail className="size-5" aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block text-xs font-semibold tracking-wide text-noche/55 uppercase">Correo</span>
                      <span className="font-medium">{site.email}</span>{" "}
                      {site.pending.email && <Pending inline>validar</Pending>}
                    </span>
                  </a>
                </li>
                <li>
                  <a href={telHref} className="flex items-start gap-3 text-noche hover:text-profundo">
                    <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-alerta text-noche">
                      <Phone className="size-5" aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block text-xs font-semibold tracking-wide text-noche/55 uppercase">Emergencias</span>
                      <span className="font-medium tabular-nums">{site.phone.display}</span>
                    </span>
                  </a>
                </li>
                <li className="flex items-start gap-3 text-noche">
                  <span className="icon-circle-claro size-10">
                    <Clock className="size-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-xs font-semibold tracking-wide text-noche/55 uppercase">Horario de oficina</span>
                    {site.pending.officeHours ? <Pending inline>{site.officeHours}</Pending> : <span className="font-medium">{site.officeHours}</span>}
                  </span>
                </li>
                <li className="flex items-start gap-3 text-noche">
                  <span className="icon-circle-claro size-10">
                    <MapPin className="size-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-xs font-semibold tracking-wide text-noche/55 uppercase">Dirección</span>
                    {site.pending.address ? <Pending inline>{site.address}</Pending> : <span className="font-medium">{site.address}</span>}
                  </span>
                </li>
              </ul>
            </div>

            <div className="relative overflow-hidden rounded-card bg-noche p-6 text-white">
              <div className="relative z-10 max-w-[60%]">
                <h2 className="font-display text-lg font-bold">¿Prefiere que lo guíe Manta?</h2>
                <p className="mt-2 text-sm text-white/75">
                  Responde cuatro o cinco preguntas cortas y registra su solicitud.
                </p>
                <OpenMantaButton className="btn btn-white btn-sm mt-4" flow="quote">
                  Hablar con Manta
                </OpenMantaButton>
              </div>
              <Image
                src="/marca/manta/manta_asistencia.png"
                alt=""
                width={1000}
                height={750}
                sizes="220px"
                className="absolute -right-6 -bottom-4 w-[200px] motion-safe:animate-float"
              />
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
