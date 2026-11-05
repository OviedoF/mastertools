import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import type { Project } from "@/content/projects";
import { Section, SectionHeading } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";

export function ProjectCard({ p }: { p: Project }) {
  return (
    <Link
      href={`/proyectos/${p.slug}`}
      className="card card-hover group flex flex-col overflow-hidden"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={p.photo.src}
          alt={p.photo.alt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-(--ease-out-expo) group-hover:scale-[1.04]"
        />
        <span className="chip chip-claro absolute top-4 left-4">{p.serviceLabel}</span>
        {p.photoIllustrative && (
          <span className="absolute right-3 bottom-3 rounded-md bg-noche/70 px-2 py-0.5 text-[0.6875rem] font-medium text-white backdrop-blur-sm">
            Foto ilustrativa
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-noche/60 uppercase">
          <MapPin className="size-3.5 text-master" aria-hidden="true" />
          {p.city}, {p.department}
        </p>
        <h3 className="h3 mt-2 text-noche group-hover:text-profundo">{p.title}</h3>
        <p className="mt-2 flex-1 text-[0.9375rem] leading-relaxed text-noche/70">{p.summary}</p>
        <span className="mt-5 inline-flex items-center gap-1.5 font-display text-sm font-semibold text-profundo">
          Ver caso
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}

/** Proyectos destacados (Inicio, bloque 6). */
export function ProjectsPreview({
  projects,
  title,
  text,
}: {
  projects: Project[];
  title: string;
  text: string;
}) {
  const featured = projects.slice(0, 3);
  return (
    <Section tone="niebla">
      <Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <SectionHeading eyebrow="Casos reales" title={title} text={text} />
        <ButtonLink href="/proyectos" variant="outline" className="shrink-0">
          Ver todos los proyectos
          <ArrowRight className="size-5" aria-hidden="true" />
        </ButtonLink>
      </Reveal>
      <Reveal className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" stagger={0.1} y={32}>
        {featured.map((p) => (
          <ProjectCard key={p.slug} p={p} />
        ))}
      </Reveal>
    </Section>
  );
}
