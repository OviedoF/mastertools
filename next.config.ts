import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Con el CMS las páginas se renderizan por pedido con datos en caché por
  // etiquetas (next-sanity). Cache Components queda desactivado: su API de
  // borradores no es compatible con el prerender total.
  cacheComponents: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
  async redirects() {
    return [
      // Emergencias es la novena línea pero tiene ruta propia, fuera de /servicios
      { source: "/servicios/emergencias", destination: "/emergencias-electricas", permanent: true },
      { source: "/emergencias", destination: "/emergencias-electricas", permanent: true },
      { source: "/cotizar", destination: "/contacto", permanent: true },
    ];
  },
};

export default nextConfig;
