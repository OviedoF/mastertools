import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { Orbit } from "@/components/ui/Orbit";

export type Crumb = { name: string; href: string };

export function Breadcrumbs({ items, dark }: { items: Crumb[]; dark?: boolean }) {
  return (
    <nav aria-label="Ruta de navegación" className={clsx("text-sm", dark ? "text-white/70" : "text-noche/60")}>
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <li key={c.href} className="flex items-center gap-1">
              {last ? (
                <span aria-current="page" className={dark ? "text-white" : "text-noche"}>
                  {c.name}
                </span>
              ) : (
                <Link href={c.href} className="hover:underline">
                  {c.name}
                </Link>
              )}
              {!last && <ChevronRight className="size-3.5 opacity-60" aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** Portada de páginas interiores. */
export function PageHero({
  eyebrow,
  title,
  text,
  crumbs,
  photo,
  children,
  tone = "niebla",
}: {
  eyebrow?: string;
  title: ReactNode;
  text?: ReactNode;
  crumbs?: Crumb[];
  photo?: { src: string; alt: string; position?: string };
  children?: ReactNode;
  tone?: "niebla" | "noche";
}) {
  const dark = tone === "noche";
  return (
    <section className={clsx("relative overflow-hidden", dark ? "bg-noche text-white" : "bg-niebla text-noche")}>
      {!photo && (
        <Orbit className={clsx("absolute -top-48 -right-40 w-[720px]", dark ? "text-master/15" : "text-master/18")} draw={false} />
      )}
      <div className={clsx("container-x relative grid gap-10 py-12 md:py-16", photo && "lg:grid-cols-[1.1fr_1fr] lg:items-center lg:py-20")}>
        <div className="max-w-2xl">
          {crumbs && <Breadcrumbs items={crumbs} dark={dark} />}
          {eyebrow && <p className={clsx("eyebrow mt-6 mb-3", dark ? "text-master" : "text-profundo")}>{eyebrow}</p>}
          <h1 className={clsx("h1", !eyebrow && crumbs && "mt-6", dark ? "text-white" : "text-noche")}>{title}</h1>
          {text && <p className={clsx("lead mt-5", dark && "text-white/75")}>{text}</p>}
          {children}
        </div>
        {photo && (
          <div className="relative aspect-[4/3] overflow-hidden rounded-card shadow-card-hover ring-1 ring-noche/10 motion-safe:animate-rise lg:aspect-[5/4]" style={{ animationDelay: "0.15s" }}>
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              priority
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
              style={photo.position ? { objectPosition: photo.position } : undefined}
            />
          </div>
        )}
      </div>
    </section>
  );
}
