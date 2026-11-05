import { createElement } from "react";
import type { LucideProps } from "lucide-react";
import { getIcon, type IconKey } from "./icon-map";

/** Ícono de Lucide elegido por clave de contenido (servicios, pasos). */
export function Icon({ name, ...props }: { name: IconKey | string | null | undefined } & LucideProps) {
  return createElement(getIcon(name), props);
}
