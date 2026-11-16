import type { Metadata } from "next";
import { MapPin, Siren } from "lucide-react";
import { CoverageMap } from "@/components/map/CoverageMap";
import { getSettings } from "@/data/content";
import { waGeneralHref } from "@/lib/links";
import { breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageHero } from "@/components/shared/PageHero";
import { EmergencyBand } from "@/components/shared/EmergencyBand";
import { ButtonLink } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/Icons";
import { Pending } from "@/components/ui/Pending";
import { Reveal } from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "Cobertura: Atlántico, Bolívar, Magdalena, Cesar, Córdoba y Sucre",
  description:
    "Servicios de ingeniería eléctrica y emergencias en Barranquilla, Cartagena, Santa Marta, Montería, Valledupar, Sincelejo y la región Caribe.",
  alternates: { canonical: "/cobertura" },
  keywords: ["servicios eléctricos Barranquilla", "Cartagena", "Santa Marta", "Montería", "Valledupar", "Sincelejo"],
};

const crumbs = [
  { name: "Inicio", href: "/" },
  { name: "Cobertura", href: "/cobertura" },
];

const NUMBERS = ["", "Un", "Dos", "Tres", "Cuatro", "Cinco", "Seis", "Siete", "Ocho", "Nueve", "Diez", "Once", "Doce", "Trece", "Catorce", "Quince", "Dieciséis", "Diecisiete", "Dieciocho", "Diecinueve", "Veinte"];
const inWords = (n: number) => NUMBERS[n] ?? String(n);

export default async function CoveragePage() {
  const site = await getSettings();
  const caribe = site.emergencyDepartments;
  const others = site.allDepartments.filter((d) => !caribe.includes(d));
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <PageHero
        crumbs={crumbs}
        title="Cobertura"
        text={`Nuestra base está en el Caribe colombiano y hemos trabajado en ${site.allDepartments.length} departamentos, en zonas urbanas y rurales. Nuestra meta es llegar a todo el país.`}
        photo={{ src: "/fotos/redes-rurales-aerea.jpg", alt: "Vista aérea de redes de media tensión en zona rural del Caribe" }}
      />

      <section className="bg-white py-16 md:py-20">
        <div className="container-x grid gap-12 lg:grid-cols-2">
          <Reveal>
            <div className="flex items-center gap-3">
              <span className="inline-flex size-10 items-center justify-center rounded-full bg-alerta text-noche">
                <Siren className="size-5" aria-hidden="true" />
              </span>
              <h2 className="h2 text-noche">Base y zona de emergencias</h2>
            </div>
            <p className="lead mt-4">
              Departamentos del Caribe donde tenemos presencia permanente y
              atendemos emergencias, con confirmación del equipo en cada caso.
            </p>
            <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {caribe.map((d) => (
                <li key={d} className="flex items-center gap-2 rounded-xl bg-noche px-4 py-3 font-display text-sm font-semibold text-white">
                  <MapPin className="size-4 text-master" aria-hidden="true" />
                  {d}
                </li>
              ))}
            </ul>
            <h3 className="h3 mt-10 text-noche">Ciudades</h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {site.cities.map((c) => (
                <li key={c} className="chip chip-claro px-3.5 py-1.5 text-[0.8125rem]">
                  {c}
                </li>
              ))}
              <li>
                <Pending inline>otras ciudades por completar</Pending>
              </li>
            </ul>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="h2 text-noche">También hemos trabajado en</h2>
            <p className="lead mt-4">
              Del Pacífico al centro del país. Si su proyecto está en otra zona,
              lo evaluamos.
            </p>
            <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {others.map((d) => (
                <li key={d} className="flex items-center gap-2 rounded-xl bg-niebla px-4 py-3 font-display text-sm font-semibold text-noche">
                  <MapPin className="size-4 text-profundo" aria-hidden="true" />
                  {d}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="bg-noche bg-grid-noche py-16 text-white md:py-24">
        <div className="container-x grid items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
          <Reveal>
            <p className="eyebrow text-master">Mapa de cobertura</p>
            <h2 className="h2 mt-3 text-white">{inWords(site.allDepartments.length)} departamentos, una sola base</h2>
            <p className="lead mt-4 text-white/75">
              Pase el cursor por el mapa para ver cada departamento. En celeste,
              la base en el Caribe donde atendemos emergencias. En azul, los
              departamentos donde ya ejecutamos trabajos.
            </p>
            <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-1.5 text-[0.9375rem] text-white/85 sm:grid-cols-3">
              {site.cities.map((c) => (
                <li key={c} className="flex items-center gap-2">
                  <span className="size-2 shrink-0 rounded-full bg-alerta" aria-hidden="true" />
                  {c}
                </li>
              ))}
            </ul>
          </Reveal>
          <CoverageMap primary={caribe} secondary={others} dark className="mx-auto w-full max-w-[560px]" />
        </div>
      </section>

      <section className="bg-niebla py-14">
        <div className="container-x flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="h2 text-noche">¿Su proyecto está en otra zona?</h2>
            <p className="lead mt-2">Escríbanos y lo evaluamos.</p>
          </div>
          <ButtonLink href={waGeneralHref} size="lg">
            <WhatsAppIcon />
            Escribir por WhatsApp
          </ButtonLink>
        </div>
      </section>
      <EmergencyBand />
    </>
  );
}
