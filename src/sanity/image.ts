import { createImageUrlBuilder } from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url";
import { dataset, projectId } from "./env";

const builder = createImageUrlBuilder({ projectId, dataset });

/** URL del CDN de Sanity con recorte por punto focal y formato automático. */
export function urlFor(source: SanityImageSource) {
  return builder.image(source).auto("format");
}

export type SanityPhoto = {
  asset?: { _ref?: string; url?: string } | null;
  hotspot?: unknown;
  crop?: unknown;
  alt?: string | null;
} | null;

/** Convierte una imagen de Sanity al formato { src, alt } que usan los componentes. */
export function photoFrom(img: SanityPhoto, fallback: { src: string; alt: string }, width = 2000) {
  if (!img?.asset) return fallback;
  return { src: urlFor(img).width(width).url(), alt: img.alt ?? fallback.alt };
}
