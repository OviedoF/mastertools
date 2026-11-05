import Image from "next/image";
import { ArrowRight, Check } from "lucide-react";
import type { HomeContent } from "@/content/pages";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";

/** Servicio destacado: cambio de comercializador (Inicio, bloque 4). */
export function FeaturedService({ home }: { home: HomeContent }) {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="container-x">
        <div className="grid items-center gap-10 overflow-hidden rounded-card bg-noche text-white lg:grid-cols-2">
          <Reveal className="p-8 md:p-12 lg:p-14">
            <p className="eyebrow text-master">{home.featuredEyebrow}</p>
            <h2 className="h2 mt-3 text-white">{home.featuredTitle}</h2>
            <p className="lead mt-5 text-white/75">{home.featuredText}</p>
            <ul className="mt-6 grid gap-2.5 text-[0.9375rem] text-white/90">
              {home.featuredPoints.map((p) => (
                <li key={p} className="flex items-center gap-2.5">
                  <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-master/20 text-master">
                    <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <ButtonLink href={`/servicios/${home.featuredServiceSlug}`} variant="white" size="lg">
                Conocer el servicio
                <ArrowRight className="size-5" aria-hidden="true" />
              </ButtonLink>
            </div>
          </Reveal>
          <Reveal className="relative min-h-[320px] self-stretch lg:min-h-[480px]" delay={0.1}>
            <Image
              src={home.featuredPhoto.src}
              alt={home.featuredPhoto.alt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-noche/40 to-transparent lg:from-noche/60" />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
