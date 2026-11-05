import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import type { HomeContent } from "@/content/pages";
import { ButtonLink } from "@/components/ui/Button";
import { Orbit } from "@/components/ui/Orbit";

/**
 * Portada de Inicio (bloque 1). La entrada se anima con CSS para que el
 * texto esté visible antes de que cargue JavaScript.
 */
export function Hero({ home }: { home: HomeContent }) {
  return (
    <section className="relative overflow-hidden bg-white">
      <Orbit
        className="pointer-events-none absolute -top-32 right-[-18%] hidden w-[min(72vw,980px)] text-master/20 lg:block"
        delay={0.2}
        duration={1.8}
      />
      <div className="container-x relative grid items-center gap-10 py-12 md:py-20 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:py-24">
        <div className="max-w-2xl">
          <p
            className="eyebrow mb-4 flex items-center gap-2 text-profundo motion-safe:animate-rise"
            style={{ animationDelay: "0.05s" }}
          >
            <span className="inline-block h-px w-8 bg-master" aria-hidden="true" />
            {home.heroEyebrow}
          </p>
          <h1
            className="h1 text-noche motion-safe:animate-rise"
            style={{ animationDelay: "0.15s" }}
          >
            {home.heroTitle}
          </h1>
          <p
            className="lead mt-6 max-w-xl motion-safe:animate-rise"
            style={{ animationDelay: "0.28s" }}
          >
            {home.heroSubtitle}
          </p>
          <div
            className="mt-8 flex flex-col gap-3 sm:flex-row motion-safe:animate-rise"
            style={{ animationDelay: "0.4s" }}
          >
            <ButtonLink href="/contacto" size="lg">
              Solicitar cotización
            </ButtonLink>
            <ButtonLink href="/emergencias-electricas" variant="emergency" size="lg">
              Reportar emergencia
            </ButtonLink>
          </div>
          <ul
            className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-noche/70 motion-safe:animate-rise"
            style={{ animationDelay: "0.52s" }}
          >
            {home.trust.map((t) => (
              <li key={t} className="flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-master" aria-hidden="true" />
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div
          className="relative motion-safe:animate-rise"
          style={{ animationDelay: "0.3s" }}
        >
          <div className="relative aspect-[16/11] overflow-hidden rounded-card shadow-card-hover ring-1 ring-noche/10 lg:aspect-[5/4]">
            <Image
              src={home.heroPhoto.src}
              alt={home.heroPhoto.alt}
              fill
              priority
              sizes="(min-width: 1024px) 48vw, 100vw"
              className="object-cover"
            />
            {(home.heroCaption || home.heroCaptionNote) && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-noche/70 to-transparent p-5 pt-16 text-white">
                <p className="font-display text-sm font-semibold">{home.heroCaption}</p>
                <p className="text-xs text-white/80">{home.heroCaptionNote}</p>
              </div>
            )}
          </div>
          <div className="absolute -top-5 -right-3 hidden rounded-2xl bg-noche px-5 py-4 text-white shadow-card-hover sm:block md:-right-6">
            <p className="font-display text-3xl font-extrabold leading-none text-master">+350</p>
            <p className="mt-1 text-xs text-white/80">intervenciones en 12 departamentos</p>
          </div>
        </div>
      </div>
    </section>
  );
}
