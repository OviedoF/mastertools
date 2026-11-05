import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Master Tools & Services S.A.S.",
    short_name: "Master Tools",
    description:
      "Ingeniería eléctrica, sistemas de medida y atención de emergencias para empresas del Caribe colombiano.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0b1f4d",
    lang: "es-CO",
    icons: [
      { src: "/marca/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/marca/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
