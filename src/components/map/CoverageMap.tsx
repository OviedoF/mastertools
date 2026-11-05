"use client";

import { useRef, useState } from "react";
import clsx from "clsx";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { CITIES, DEPARTMENTS, MAP } from "./colombia";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export type CoverageMapProps = {
  /** Departamentos de la base y zona de emergencias */
  primary: readonly string[];
  /** Otros departamentos con trabajos ejecutados */
  secondary: readonly string[];
  className?: string;
  /** Muestra los puntos de las ciudades atendidas */
  showCities?: boolean;
  /** Leyenda debajo del mapa */
  legend?: boolean;
  /** Versión sobre fondo oscuro */
  dark?: boolean;
};

/**
 * Mapa ilustrado de cobertura: Colombia por departamentos, sin Google Maps.
 * Los departamentos del Caribe se encienden primero, después el resto.
 */
export function CoverageMap({
  primary,
  secondary,
  className,
  showCities = true,
  legend = true,
  dark = false,
}: CoverageMapProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<string | null>(null);

  const tone = (name: string) =>
    primary.includes(name) ? "primary" : secondary.includes(name) ? "secondary" : "none";

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: root, start: "top 75%", once: true },
          defaults: { ease: "power2.out" },
        });
        tl.from(root.querySelectorAll(".dep-none"), { autoAlpha: 0, duration: 0.6, stagger: 0.012 }, 0)
          .from(root.querySelectorAll(".dep-primary"), { autoAlpha: 0, scale: 0.96, transformOrigin: "center", duration: 0.5, stagger: 0.12 }, 0.4)
          .from(root.querySelectorAll(".dep-secondary"), { autoAlpha: 0, duration: 0.5, stagger: 0.08 }, 1.0)
          .from(root.querySelectorAll(".city"), { autoAlpha: 0, scale: 0, transformOrigin: "center", duration: 0.35, stagger: 0.06 }, 1.3)
          .from(root.querySelectorAll(".map-legend > *"), { autoAlpha: 0, y: 8, duration: 0.4, stagger: 0.08 }, 1.2);
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  const activeDep = DEPARTMENTS.find((d) => d.name === active);
  const label = (name: string) =>
    tone(name) === "primary"
      ? "Base y zona de emergencias"
      : tone(name) === "secondary"
        ? "Trabajos ejecutados"
        : "Sin trabajos publicados";

  return (
    <div ref={ref} className={clsx("relative", className)}>
      <svg
        viewBox={`0 0 ${MAP.width} ${MAP.height}`}
        className="h-auto w-full"
        role="img"
        aria-label={`Mapa de Colombia con los departamentos donde trabaja Master Tools: ${[...primary, ...secondary].join(", ")}.`}
      >
        <title>Cobertura de Master Tools en Colombia</title>
        <g onMouseLeave={() => setActive(null)}>
          {DEPARTMENTS.map((d) => {
            const t = tone(d.name);
            const isActive = active === d.name;
            return (
              <path
                key={d.code}
                d={d.d}
                className={clsx(
                  `dep-${t} cursor-default transition-[fill,stroke-width] duration-200`,
                  t === "primary" && "fill-master",
                  t === "secondary" && (dark ? "fill-profundo" : "fill-profundo/80"),
                  t === "none" && (dark ? "fill-white/8" : "fill-noche/8"),
                  isActive && t === "none" && (dark ? "fill-white/15" : "fill-noche/15"),
                  isActive && t !== "none" && "brightness-110",
                )}
                stroke={dark ? "rgb(11 31 77)" : "#fff"}
                strokeWidth={isActive ? 2.2 : 1.1}
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                onMouseEnter={() => setActive(d.name)}
                onFocus={() => setActive(d.name)}
                onBlur={() => setActive(null)}
                tabIndex={t === "none" ? -1 : 0}
                aria-label={`${d.name}: ${label(d.name)}`}
              >
                <title>{`${d.name} · ${label(d.name)}`}</title>
              </path>
            );
          })}
        </g>

        {showCities &&
          CITIES.map((c) => (
            <g key={c.name} className="city" aria-hidden="true">
              <circle cx={c.x} cy={c.y} r={15} className="fill-alerta/30" />
              <circle cx={c.x} cy={c.y} r={7} className="fill-alerta" stroke="#0B1F4D" strokeWidth={2} />
            </g>
          ))}

        {/* San Andrés y Providencia, en recuadro, como en los mapas oficiales */}
        <g aria-hidden="true" transform="translate(24 24)">
          <rect width="230" height="160" rx="14" fill="none" stroke={dark ? "rgb(255 255 255 / 0.3)" : "rgb(11 31 77 / 0.2)"} strokeWidth="1.5" strokeDasharray="6 6" />
          <circle cx="80" cy="104" r="10" className={dark ? "fill-white/20" : "fill-noche/8"} stroke={dark ? "rgb(255 255 255 / 0.5)" : "rgb(11 31 77 / 0.35)"} strokeWidth="1.5" />
          <circle cx="150" cy="52" r="7" className={dark ? "fill-white/20" : "fill-noche/8"} stroke={dark ? "rgb(255 255 255 / 0.5)" : "rgb(11 31 77 / 0.35)"} strokeWidth="1.5" />
          <text x="115" y="144" textAnchor="middle" fontSize="17" fontWeight="500" className={dark ? "fill-white/70" : "fill-noche/60"} fontFamily="var(--font-inter)">
            San Andrés y Providencia
          </text>
        </g>
      </svg>

      {/* Etiqueta flotante del departamento activo */}
      <div
        className={clsx(
          "pointer-events-none absolute top-3 right-3 rounded-xl px-3.5 py-2 text-sm shadow-card transition-opacity duration-150",
          dark ? "bg-white text-noche" : "bg-noche text-white",
          activeDep ? "opacity-100" : "opacity-0",
        )}
        aria-live="polite"
      >
        {activeDep && (
          <>
            <p className="font-display font-bold">{activeDep.name}</p>
            <p className={dark ? "text-noche/70" : "text-white/75"}>{label(activeDep.name)}</p>
          </>
        )}
      </div>

      {legend && (
        <ul className={clsx("map-legend mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm", dark ? "text-white/80" : "text-noche/75")}>
          <li className="flex items-center gap-2">
            <span className="size-3 rounded-sm bg-master" aria-hidden="true" />
            Base y zona de emergencias
          </li>
          <li className="flex items-center gap-2">
            <span className={clsx("size-3 rounded-sm", dark ? "bg-profundo" : "bg-profundo/80")} aria-hidden="true" />
            Trabajos ejecutados
          </li>
          {showCities && (
            <li className="flex items-center gap-2">
              <span className="size-3 rounded-full bg-alerta ring-2 ring-noche/60" aria-hidden="true" />
              Ciudades atendidas
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
