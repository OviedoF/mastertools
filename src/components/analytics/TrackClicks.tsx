"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Registra como evento cada clic en los caminos de conversión
 * (documento de estructura, 3.2 y 4.2): llamadas, WhatsApp, cotización,
 * chat. Envía el evento a Google Analytics 4 (gtag) o, si no está la
 * etiqueta, lo empuja al dataLayer para Tag Manager. En desarrollo también lo
 * muestra en consola.
 */
export function TrackClicks() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>("a[href], button, [data-track]");
      if (!el) return;
      const href = el.getAttribute("href") ?? "";
      let cta = el.dataset.track;
      if (!cta) {
        if (href.startsWith("tel:")) cta = href === "tel:123" ? "llamar_123" : "llamar";
        else if (href.includes("wa.me")) cta = "whatsapp";
        else if (href.startsWith("/contacto")) cta = "solicitar_cotizacion";
        else if (href.startsWith("/emergencias-electricas")) cta = "reportar_emergencia";
      }
      if (!cta) return;
      const payload = {
        event: "cta_click",
        cta,
        href: href || undefined,
        page: window.location.pathname,
        label: el.textContent?.trim().slice(0, 60) || undefined,
      };
      // Con la etiqueta de GA4 cargada se envía como evento; si no, queda en el dataLayer (Tag Manager).
      if (window.gtag) {
        const { event, ...params } = payload;
        window.gtag("event", event, params);
      } else {
        window.dataLayer = window.dataLayer ?? [];
        window.dataLayer.push(payload);
      }
      if (process.env.NODE_ENV !== "production") console.debug("[track]", payload);
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);
  return null;
}
