"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    __gaLoaded?: boolean;
  }
}

/**
 * Etiqueta de Google Analytics 4. El ID de medición se pide a /api/ga-id (se edita en
 * Portal > Ajustes, sin volver a publicar). Si no hay ID, no se carga nada ni se envía nada a Google.
 * Va solo en el sitio público, no en el portal.
 */
export function GoogleAnalytics() {
  useEffect(() => {
    if (window.__gaLoaded) return;
    let cancelado = false;
    fetch("/api/ga-id")
      .then((r) => (r.ok ? r.json() : null))
      .then((j: { id?: string | null } | null) => {
        const id = j?.id;
        if (cancelado || !id || !/^G-[A-Z0-9]+$/.test(id) || window.__gaLoaded) return;
        window.__gaLoaded = true;
        const previos = window.dataLayer ?? [];
        window.dataLayer = window.dataLayer ?? [];
        window.gtag = function gtag(...args: unknown[]) {
          (window.dataLayer as unknown[]).push(arguments);
          void args;
        };
        window.gtag("js", new Date());
        window.gtag("config", id, { anonymize_ip: true });
        // Clics que ocurrieron antes de que cargara la etiqueta
        for (const p of previos) {
          const o = p as { event?: string } & Record<string, unknown>;
          if (o && typeof o === "object" && o.event) {
            const { event, ...params } = o;
            window.gtag("event", event, params);
          }
        }
        const s = document.createElement("script");
        s.async = true;
        s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
        document.head.appendChild(s);
      })
      .catch(() => {});
    return () => {
      cancelado = true;
    };
  }, []);
  return null;
}
