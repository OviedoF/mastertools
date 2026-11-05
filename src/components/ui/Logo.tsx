/* eslint-disable @next/next/no-img-element -- los logos son SVG: next/image no aporta optimización */
import Link from "next/link";
import clsx from "clsx";

type Variant = "color" | "negativo" | "monocromo";

/**
 * Logotipo completo sin descriptor S.A.S. (se omite por debajo de 240 px).
 * El manual pide mínimo 160 px de ancho en el encabezado móvil.
 */
export function Logo({
  variant = "color",
  className,
  width = 176,
  withLink = true,
  priority,
}: {
  variant?: Variant;
  className?: string;
  width?: number;
  withLink?: boolean;
  priority?: boolean;
}) {
  const img = (
    <img
      src={`/marca/logo/logo_master_tools_${variant}_sin_SAS.svg`}
      alt="Master Tools"
      width={width}
      height={Math.round(width * (610 / 1437))}
      className={clsx("h-auto", className)}
      style={{ width }}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
    />
  );
  if (!withLink) return img;
  return (
    <Link
      href="/"
      aria-label="Master Tools, ir al inicio"
      className="inline-flex shrink-0 items-center rounded-md"
    >
      {img}
    </Link>
  );
}

/** Isotipo M+T dentro de la elipse, para espacios chicos o cuadrados. */
export function Isotipo({
  variant = "color",
  size = 40,
  className,
}: {
  variant?: "color" | "negativo" | "negativo_bicolor" | "monocromo";
  size?: number;
  className?: string;
}) {
  return (
    <img
      src={`/marca/logo/isotipo_master_tools_${variant}.svg`}
      alt=""
      aria-hidden="true"
      width={size}
      height={Math.round(size * (627 / 874))}
      className={clsx("h-auto", className)}
      style={{ width: size }}
      decoding="async"
    />
  );
}
