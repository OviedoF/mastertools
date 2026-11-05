"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import type { ProcessStep } from "@/content/process";
import { Icon } from "@/components/ui/Icon";
import { Section, SectionHeading } from "@/components/ui/Section";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * "Así trabajamos" (Inicio, bloque 5). Los seis pasos forman un circuito:
 * la línea se traza con el scroll y cada nodo se enciende al pasar.
 */
export function Process({
  steps,
  title,
  text,
  detailed = false,
}: {
  steps: ProcessStep[];
  title: string;
  text: string;
  detailed?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const line = root.querySelector<SVGPathElement>(".process-line");
        const vline = root.querySelector<HTMLElement>(".process-vline");
        const nodes = root.querySelectorAll<HTMLElement>(".process-node");
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root,
            start: "top 70%",
            end: "bottom 60%",
            scrub: 0.6,
          },
        });
        if (line) tl.fromTo(line, { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: "none" }, 0);
        if (vline) tl.fromTo(vline, { scaleY: 0 }, { scaleY: 1, ease: "none", transformOrigin: "top" }, 0);
        nodes.forEach((n, i) => {
          tl.to(
            n,
            { backgroundColor: "#00aeef", color: "#0b1f4d", borderColor: "#00aeef", duration: 0.05 },
            i / Math.max(1, nodes.length - 1),
          );
        });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <Section tone="white" id="como-trabajamos">
      <SectionHeading eyebrow="Metodología" title={title} text={text} />
      <div ref={ref} className="relative mt-12 md:mt-16">
        {/* Línea horizontal (escritorio) */}
        <svg
          className="pointer-events-none absolute top-6 right-0 left-0 hidden h-2 w-full lg:block"
          viewBox="0 0 1200 8"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <line x1="0" y1="4" x2="1200" y2="4" stroke="#CFEFFF" strokeWidth="3" />
          <path
            className="process-line"
            d="M0 4 H1200"
            stroke="#00AEEF"
            strokeWidth="3"
            fill="none"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1}
          />
        </svg>
        {/* Línea vertical (celular y tablet) */}
        <div className="absolute top-0 bottom-0 left-6 w-0.5 bg-claro lg:hidden" aria-hidden="true">
          <div className="process-vline h-full w-full origin-top bg-master" />
        </div>

        <ol className="grid gap-8 lg:grid-cols-6 lg:gap-4">
          {steps.map((step) => (
            <li key={step.n} className="relative flex gap-5 lg:block">
              <div className="process-node relative z-10 inline-flex size-12 shrink-0 items-center justify-center rounded-full border-2 border-claro bg-white font-display text-base font-extrabold text-profundo shadow-sm transition-colors lg:mb-6">
                {step.n}
              </div>
              <div className="pt-1 lg:pt-0">
                <div className="flex items-center gap-2">
                  <Icon name={step.icon} className="size-5 text-master" strokeWidth={1.75} aria-hidden="true" />
                  <h3 className="font-display text-lg font-bold text-noche">{step.title}</h3>
                </div>
                <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-noche/70">{step.text}</p>
                {detailed && step.detail && (
                  <p className="mt-2 text-sm leading-relaxed text-noche/60">{step.detail}</p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
