"use client";

import type { ReactNode } from "react";

/**
 * Abre la burbuja de Manta desde cualquier botón de la página.
 * Se comunica por un evento del documento para no acoplar componentes.
 */
export function OpenMantaButton({
  children,
  className,
  flow,
}: {
  children: ReactNode;
  className?: string;
  flow?: "emergency" | "quote";
}) {
  return (
    <button
      type="button"
      className={className}
      onClick={() =>
        document.dispatchEvent(new CustomEvent("manta:open", { detail: { flow } }))
      }
    >
      {children}
    </button>
  );
}
