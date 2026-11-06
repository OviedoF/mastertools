import Link from "next/link";
import clsx from "clsx";
import { ArrowRight } from "lucide-react";
import { serviceHref, type Service } from "@/content/services";
import { Icon } from "@/components/ui/Icon";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";

export function ServiceCard({ s, className }: { s: Service; className?: string }) {
  const emergency = s.slug === "emergencias";
  return (
    <Link
      href={serviceHref(s)}
      className={clsx(
        "card card-hover group relative flex flex-col p-6",
        s.featured && "bg-claro/40 ring-master/30",
        emergency && "ring-alerta/50",
        className,
      )}
    >
      <span className={clsx(emergency ? "inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-alerta text-noche" : "icon-circle")}>
        <Icon name={s.icon} className="size-6" strokeWidth={1.75} aria-hidden="true" />
      </span>
      <h3 className="h3 mt-5 text-noche group-hover:text-profundo">{s.shortName}</h3>
      <p className="mt-2 flex-1 text-[0.9375rem] leading-relaxed text-noche/70">{s.cardText}</p>
      <span className="mt-5 inline-flex items-center gap-1.5 font-display text-sm font-semibold text-profundo">
        Ver servicio
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
      </span>
      {s.featured && (
        <span className="chip chip-noche absolute top-5 right-5">Alto nivel técnico</span>
      )}
    </Link>
  );
}

/** La amplitud como diferencial (Inicio, bloque 3). */
export function ServicesGrid({
  services,
  title,
  text,
}: {
  services: Service[];
  title: string;
  text: string;
}) {
  return (
    <Section tone="niebla" id="servicios">
      <Reveal>
        <SectionHeading eyebrow={`${services.length === 12 ? "Doce" : services.length} líneas de servicio`} title={title} text={text} />
      </Reveal>
      <Reveal className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" stagger={0.07} y={32}>
        {services.map((s) => (
          <ServiceCard key={s.slug} s={s} />
        ))}
      </Reveal>
    </Section>
  );
}
