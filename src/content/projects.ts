export type Project = {
  slug: string;
  title: string;
  city: string;
  department: string;
  serviceSlug: string;
  serviceLabel: string;
  clientType?: string;
  year?: number;
  summary: string;
  challenge?: string;
  work?: string;
  result?: string;
  photo: { src: string; alt: string };
  /** La foto es del banco general, no de este caso en particular */
  photoIllustrative?: boolean;
  /** Fotos de la intervención (desde el panel de edición) */
  gallery?: { src: string; alt: string }[];
  pending: string[];
};

/** Casos a publicar en el lanzamiento (documento de estructura, 5.13). */
export const projects: Project[] = [
  {
    slug: "cambio-de-comercializador-nivel-ii-monteria",
    title: "Cambio de comercializador Nivel II en Montería",
    city: "Montería",
    department: "Córdoba",
    serviceSlug: "medida-nivel-ii-cambio-de-comercializador",
    serviceLabel: "Medida",
    summary:
      "Adecuación del sistema de medida para la transición del operador.",
    photo: {
      src: "/fotos/celda-medida-13200.jpg",
      alt: "Celda de medida de 13,2 kV con sus conexiones identificadas",
    },
    photoIllustrative: true,
    pending: ["Tipo de cliente", "Año", "Trabajos realizados", "Resultado"],
  },
  {
    slug: "normalizacion-de-telemedida-cartagena",
    title: "Normalización de telemedida en Cartagena",
    city: "Cartagena",
    department: "Bolívar",
    serviceSlug: "medida-nivel-ii-cambio-de-comercializador",
    serviceLabel: "Medida",
    summary: "Recuperación y normalización del sistema de medición.",
    photo: {
      src: "/fotos/medidor-trifasico.jpg",
      alt: "Medidor trifásico tetrafilar instalado en un sistema de medida",
    },
    photoIllustrative: true,
    pending: ["Qué falló", "Qué se hizo", "Fotos"],
  },
  {
    slug: "puesta-en-servicio-de-transformador-barranquilla",
    title: "Puesta en servicio de transformador en Barranquilla",
    city: "Barranquilla",
    department: "Atlántico",
    serviceSlug: "transformadores-subestaciones",
    serviceLabel: "Ingeniería",
    summary: "Energización y validación operativa.",
    photo: {
      src: "/fotos/prueba-transformador-ttr.jpg",
      alt: "Pruebas a un transformador antes de energizarlo",
    },
    photoIllustrative: true,
    pending: ["Potencia del equipo", "Pruebas realizadas", "Fotos"],
  },
  {
    slug: "certificacion-ssfv-santa-marta",
    title: "Certificación de sistema solar en Santa Marta",
    city: "Santa Marta",
    department: "Magdalena",
    serviceSlug: "energia-solar-certificacion-retie",
    serviceLabel: "Solar",
    summary: "Cumplimiento técnico para la certificación.",
    photo: {
      src: "/fotos/solar-techo.jpg",
      alt: "Paneles solares instalados sobre una cubierta",
    },
    photoIllustrative: true,
    pending: ["Potencia del sistema", "Alcance", "Fotos"],
  },
  {
    slug: "emergencia-en-media-tension-valledupar",
    title: "Atención de emergencia en media tensión en Valledupar",
    city: "Valledupar",
    department: "Cesar",
    serviceSlug: "emergencias",
    serviceLabel: "Emergencias",
    summary: "Restablecimiento oportuno del servicio.",
    photo: {
      src: "/fotos/canasta-arbol.jpg",
      alt: "Técnico en camión canasta interviniendo una red de media tensión",
    },
    photoIllustrative: true,
    pending: ["Qué falló", "Tiempo de restablecimiento", "Fotos"],
  },
];

export const projectFilters = [
  "Medida",
  "Ingeniería",
  "Solar",
  "Mantenimiento",
  "Emergencias",
] as const;
