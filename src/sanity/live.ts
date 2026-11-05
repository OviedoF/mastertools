import { defineLive } from "next-sanity/live";
import { client } from "./client";

const token = process.env.SANITY_API_READ_TOKEN;

/**
 * sanityFetch: consulta con caché por etiquetas; se invalida sola cuando el
 * cliente publica. SanityLive: escucha los cambios y refresca la página.
 * Con draft mode activo (Presentation en el Studio) devuelve borradores con
 * marcas de edición.
 */
export const { sanityFetch, SanityLive } = defineLive({
  client,
  serverToken: token || false,
  browserToken: token || false,
});
