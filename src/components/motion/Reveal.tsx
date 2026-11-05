"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Revela el contenido al entrar en pantalla. El HTML llega visible desde el
 * servidor (SEO y sin JavaScript); GSAP solo agrega el movimiento.
 */
export function Reveal({
  as: Tag = "div",
  children,
  className,
  delay = 0,
  y = 28,
  /** Anima los hijos directos de forma escalonada */
  stagger,
  start = "top 86%",
  id,
}: {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  stagger?: number;
  start?: string;
  id?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const targets = stagger ? Array.from(el.children) : el;
        gsap.from(targets, {
          autoAlpha: 0,
          y,
          duration: 0.9,
          delay,
          ease: "power3.out",
          stagger: stagger ?? 0,
          clearProps: "transform",
          scrollTrigger: { trigger: el, start, once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} className={className} id={id} data-reveal="">
      {children}
    </Tag>
  );
}
