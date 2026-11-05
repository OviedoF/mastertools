import { ArrowRight, MapPin } from "lucide-react";
import type { SiteSettings } from "@/content/site";
import { Section, SectionHeading } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { CountUp } from "@/components/motion/CountUp";
import { CoverageMap } from "@/components/map/CoverageMap";

/** Dónde trabajamos (Inicio, bloque 7). */
export function Coverage({
  settings,
  title,
  text,
}: {
  settings: SiteSettings;
  title: string;
  text: string;
}) {
  const caribe = settings.emergencyDepartments;
  const others = settings.allDepartments.filter((d) => !caribe.includes(d));
  return (
    <Section tone="white">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <SectionHeading eyebrow="Cobertura" title={title} text={text} />
          <div className="mt-8 flex items-baseline gap-3">
            <CountUp
              value={settings.allDepartments.length}
              className="font-display text-6xl font-extrabold leading-none tracking-tight text-profundo"
            />
            <span className="text-noche/70">departamentos con trabajos ejecutados</span>
          </div>
          <div className="mt-8">
            <p className="eyebrow text-noche/60">Base y zona de emergencias</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {caribe.map((d) => (
                <li key={d} className="chip chip-noche gap-1.5 px-3.5 py-1.5 text-[0.8125rem]">
                  <MapPin className="size-3.5 text-master" aria-hidden="true" />
                  {d}
                </li>
              ))}
            </ul>
            {others.length > 0 && (
              <>
                <p className="eyebrow mt-6 text-noche/60">También hemos trabajado en</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {others.map((d) => (
                    <li key={d} className="chip chip-claro px-3.5 py-1.5 text-[0.8125rem]">
                      {d}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
          <div className="mt-8">
            <ButtonLink href="/cobertura" variant="outline">
              Ver cobertura
              <ArrowRight className="size-5" aria-hidden="true" />
            </ButtonLink>
          </div>
        </Reveal>
        <div className="relative rounded-card bg-niebla p-5 ring-1 ring-noche/5 md:p-8">
          <CoverageMap primary={caribe} secondary={others} className="mx-auto max-w-[460px]" />
        </div>
      </div>
    </Section>
  );
}
