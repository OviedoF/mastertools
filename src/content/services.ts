import type { IconKey } from "@/components/ui/icon-map";
import { waMessages } from "@/lib/links";

export type Faq = { q: string; a: string; pending?: boolean };

export type Service = {
  slug: string;
  /** H1 de la página */
  title: string;
  /** Nombre corto para menú, tarjetas y chatbot */
  shortName: string;
  /** Nombre de la línea tal como se escribe en el mensaje de WhatsApp */
  lineName: string;
  icon: IconKey;
  cardText: string;
  intro: string;
  includes: { text: string; pending?: boolean }[];
  forWho: string;
  equipment?: string;
  norms?: string;
  caseStudy?: { place: string; text: string };
  faqs: Faq[];
  seo: { title: string; description: string; keywords: string[] };
  photo: { src: string; alt: string; position?: string };
  /** Línea destacada en Inicio */
  featured?: boolean;
  whatsapp: string;
  /** Datos que faltan, para que el prototipo los señale */
  pendingNotes?: string[];
};

export const services: Service[] = [
  {
    slug: "ingenieria-consultoria-proyectos",
    title: "Ingeniería, consultoría y gestión de proyectos eléctricos",
    shortName: "Ingeniería y proyectos",
    lineName: "ingeniería, consultoría y gestión de proyectos",
    icon: "drafting-compass",
    cardText:
      "Estudios, diseño, consultoría normativa y gestión de proyectos eléctricos.",
    intro:
      "Acompañamos su proyecto eléctrico desde la idea hasta la puesta en marcha: estudios, diseño, cumplimiento normativo y gestión de la ejecución, con un solo interlocutor técnico.",
    includes: [
      { text: "Estudios técnicos y diagnóstico de instalaciones." },
      { text: "Diseño de instalaciones eléctricas.", pending: true },
      { text: "Consultoría y acompañamiento para cumplir RETIE y NTC 2050." },
      { text: "Planeación, gestión y supervisión de proyectos.", pending: true },
    ],
    forWho:
      "Industrias, constructoras, proyectos de generación, comercializadoras y operadores de red.",
    faqs: [],
    seo: {
      title: "Ingeniería y gestión de proyectos eléctricos",
      description:
        "Estudios técnicos, diseño, consultoría normativa RETIE y NTC 2050 y gestión de proyectos eléctricos en el Caribe y el resto del país.",
      keywords: [
        "consultoría eléctrica",
        "gestión de proyectos eléctricos",
        "diseño eléctrico RETIE",
      ],
    },
    photo: {
      src: "/fotos/red-rural-camino.jpg",
      alt: "Vista aérea de una red eléctrica rural junto a un camino, con el vehículo del equipo técnico",
    },
    whatsapp: waMessages.service(
      "ingeniería, consultoría y gestión de proyectos",
    ),
    pendingNotes: ["Lista de servicios ejecutados, agrupada por línea."],
  },
  {
    slug: "ingenieria-electrica-industrial",
    title: "Ingeniería eléctrica industrial",
    shortName: "Ingeniería industrial",
    lineName: "ingeniería eléctrica industrial",
    icon: "factory",
    cardText:
      "Instalaciones, adecuaciones y soporte técnico para plantas e industrias.",
    intro:
      "Instalaciones, adecuaciones y soporte técnico para plantas, industrias y grandes comercios, pensados para que la operación no se detenga.",
    includes: [
      {
        text: "Instalaciones y adecuaciones eléctricas industriales.",
        pending: true,
      },
      { text: "Inspecciones técnicas y verificación de equipos." },
      { text: "Soporte técnico especializado en planta." },
    ],
    forWho:
      "Plantas industriales, centros logísticos, grandes comercios y edificios.",
    faqs: [],
    seo: {
      title: "Ingeniería eléctrica industrial",
      description:
        "Instalaciones, adecuaciones, inspecciones y soporte técnico eléctrico para industrias y comercios en el Caribe colombiano.",
      keywords: [
        "ingeniería eléctrica industrial",
        "instalaciones eléctricas industriales Barranquilla",
      ],
    },
    photo: {
      src: "/fotos/celda-mt-terminales.jpg",
      alt: "Terminales de media tensión instalados en una celda industrial",
    },
    whatsapp: waMessages.service("ingeniería eléctrica industrial"),
    pendingNotes: ["Lista de servicios ejecutados, agrupada por línea."],
  },
  {
    slug: "transformadores-subestaciones",
    title: "Transformadores y subestaciones eléctricas",
    shortName: "Transformadores y subestaciones",
    lineName: "transformadores y subestaciones",
    icon: "zap",
    cardText:
      "Revisión, diagnóstico y puesta en servicio, con pruebas antes de energizar.",
    intro:
      "Revisamos, diagnosticamos y ponemos en servicio transformadores, celdas y subestaciones, con pruebas antes de energizar y un informe técnico al final.",
    includes: [
      { text: "Revisión y diagnóstico de transformadores." },
      { text: "Puesta en servicio y energización, con pruebas previas." },
      { text: "Celdas y equipos de media tensión." },
      {
        text: "Montaje, traslado o mantenimiento de subestaciones.",
        pending: true,
      },
    ],
    forWho:
      "Industrias, constructoras, proyectos de generación y empresas con subestación propia.",
    caseStudy: {
      place: "Barranquilla, Atlántico",
      text: "Energización y validación operativa de un transformador de potencia.",
    },
    faqs: [
      {
        q: "¿Cuándo conviene revisar un transformador?",
        a: "Antes de ponerlo en servicio, después de un traslado, una reparación o una falla, y como parte del mantenimiento periódico.",
      },
    ],
    seo: {
      title: "Transformadores y subestaciones",
      description:
        "Revisión, diagnóstico y puesta en servicio de transformadores y subestaciones eléctricas, con pruebas antes de energizar e informe técnico.",
      keywords: [
        "puesta en servicio transformador",
        "mantenimiento subestaciones",
        "diagnóstico de transformadores",
      ],
    },
    photo: {
      src: "/fotos/subestacion-estructura.jpg",
      alt: "Estructura de una subestación eléctrica de alta tensión",
    },
    whatsapp: waMessages.service("transformadores y subestaciones"),
  },
  {
    slug: "pruebas-diagnostico-electrico",
    title: "Pruebas, mediciones y diagnóstico eléctrico",
    shortName: "Pruebas y diagnóstico",
    lineName: "pruebas, mediciones y diagnóstico eléctrico",
    icon: "activity",
    cardText:
      "TTR, resistencia de aislamiento y análisis de respuesta en frecuencia (SFRA).",
    intro:
      "Medimos antes de decidir. Probamos transformadores y equipos con instrumentación calibrada, desde las pruebas de rutina hasta ensayos de alto nivel técnico como el análisis de respuesta en frecuencia (SFRA).",
    includes: [
      { text: "Pruebas de relación de transformación (TTR)." },
      { text: "Pruebas de resistencia de aislamiento." },
      { text: "Análisis de respuesta en frecuencia (SFRA)." },
      { text: "Mediciones con analizadores de red.", pending: true },
      {
        text: "Diagnóstico e informe técnico con resultados y recomendaciones.",
      },
    ],
    equipment:
      "Medidor de relación de transformación (TTR), medidor de resistencia de aislamiento, equipo de SFRA y analizadores de red.",
    norms:
      "Ensayos según RETIE y NTC 2050, con pautas internacionales IEEE.",
    forWho:
      "Industrias, constructoras, proyectos de generación y empresas que instalan, trasladan o mantienen transformadores.",
    faqs: [
      {
        q: "¿Para qué sirve la prueba TTR?",
        a: "Verifica que la relación entre el devanado primario y el secundario del transformador sea la correcta. Permite detectar espiras en cortocircuito, conexiones erradas o fallas del cambiador de derivaciones.",
      },
      {
        q: "¿Qué es el SFRA?",
        a: "Es un ensayo que compara la respuesta del transformador en un rango de frecuencias para detectar deformaciones o desplazamientos de los devanados, por ejemplo después de un traslado o un cortocircuito.",
        pending: true,
      },
      {
        q: "¿Qué recibo al final?",
        a: "Un informe técnico con las pruebas realizadas, los resultados y las recomendaciones.",
      },
    ],
    seo: {
      title: "Pruebas y diagnóstico eléctrico: TTR, aislamiento y SFRA",
      description:
        "Pruebas de relación de transformación, resistencia de aislamiento y análisis de respuesta en frecuencia (SFRA) con equipos calibrados. Informe técnico con resultados.",
      keywords: [
        "prueba TTR transformador",
        "prueba de aislamiento transformador",
        "prueba SFRA transformador",
      ],
    },
    photo: {
      src: "/fotos/prueba-transformador-campo.jpg",
      alt: "Técnico realizando pruebas a un transformador de distribución con un equipo de medición calibrado",
    },
    whatsapp: waMessages.service(
      "pruebas, mediciones y diagnóstico eléctrico",
    ),
    pendingNotes: ["Marcas y modelos de los equipos, si quieren mostrarlos."],
  },
  {
    slug: "medida-nivel-ii-cambio-de-comercializador",
    title: "Medición Nivel II, cambio de comercializador y telemedida",
    shortName: "Medición y telemedida",
    lineName: "medida Nivel II o cambio de comercializador",
    icon: "gauge",
    cardText:
      "Medida Nivel II, cambio de comercializador y recuperación de telemedida.",
    intro:
      "Si su empresa está conectada en media tensión y quiere cambiar de comercializador de energía, o necesita poner su medida en regla, nos encargamos de la instalación, la normalización y las pruebas del sistema de medida.",
    includes: [
      {
        text: "Instalación de sistemas de medida Nivel II: medidores, transformadores de corriente y de tensión, celdas o cajas de medida.",
        pending: true,
      },
      { text: "Normalización de sistemas de medida existentes." },
      {
        text: "Adecuación del sistema de medida para el cambio de comercializador.",
      },
      { text: "Parametrización de medidores." },
      {
        text: "Telemedida: diagnóstico, configuración y recuperación de comunicaciones y datos.",
      },
      { text: "Gestión de energía.", pending: true },
    ],
    forWho:
      "Industrias, comercios, edificios y usuarios conectados en media tensión; comercializadoras y operadores de red que necesitan apoyo técnico en campo.",
    caseStudy: {
      place: "Montería, Córdoba",
      text: "Adecuación del sistema de medida para la transición de comercializador.",
    },
    faqs: [
      {
        q: "¿Qué es la medida Nivel II?",
        a: "Es el sistema de medida de los usuarios conectados en nivel de tensión II, entre 1 kV y menos de 30 kV, como las redes de 13,2 kV habituales en la región.",
        pending: true,
      },
      {
        q: "¿Qué necesito para cambiar de comercializador?",
        a: "Entre otros requisitos, que su sistema de medida cumpla el Código de Medida vigente. Revisamos su instalación y le decimos qué hay que adecuar.",
        pending: true,
      },
      {
        q: "¿Hay que suspender el servicio?",
        a: "Depende de la intervención. Si se requiere un corte, lo coordinamos con el operador de red y le informamos la duración estimada antes de empezar.",
        pending: true,
      },
    ],
    seo: {
      title: "Medida Nivel II y cambio de comercializador",
      description:
        "Instalación, normalización y pruebas de sistemas de medida Nivel II para cambiar de comercializador de energía, y telemedida. Barranquilla, Cartagena, Santa Marta, Montería y todo el Caribe.",
      keywords: [
        "cambio de comercializador de energía",
        "medida nivel II",
        "normalización de medida",
        "telemedida energía",
      ],
    },
    photo: {
      src: "/fotos/celda-medida-13200.jpg",
      alt: "Celda de medida de 13,2 kV con sus conexiones identificadas",
    },
    featured: true,
    whatsapp: waMessages.medida,
    pendingNotes: [
      "Alcance exacto del servicio, referencia normativa, cortes de servicio y plazos.",
    ],
  },
  {
    slug: "energia-solar-certificacion-retie",
    title: "Certificación y puesta en marcha de sistemas solares fotovoltaicos",
    shortName: "Energía solar",
    lineName: "energía solar",
    icon: "sun",
    cardText:
      "Acompañamiento en la certificación RETIE y puesta en marcha de sistemas fotovoltaicos.",
    intro:
      "Un sistema solar tiene que cumplir el RETIE para conectarse a la red. Acompañamos todo el proceso: desde la visita técnica y la verificación de la instalación hasta la certificación y la puesta en marcha.",
    includes: [
      {
        text: "Diseño y acompañamiento técnico de sistemas solares fotovoltaicos (SSFV).",
        pending: true,
      },
      { text: "Visitas técnicas y verificación de instalaciones." },
      { text: "Acompañamiento en la certificación RETIE." },
      { text: "Visitas técnicas para procesos de certificación CIDET." },
      { text: "Parametrización de medidores y puesta en marcha." },
    ],
    forWho:
      "Empresas instaladoras que necesitan certificar sus proyectos, y empresas o comercios que tienen o van a instalar un sistema solar.",
    caseStudy: {
      place: "Santa Marta, Magdalena",
      text: "Cumplimiento técnico para la certificación de un sistema fotovoltaico.",
    },
    faqs: [
      {
        q: "¿Ustedes emiten el certificado RETIE?",
        a: "No. Master Tools no es organismo certificador: dejamos la instalación lista para cumplir la norma y acompañamos el proceso hasta que el organismo acreditado emite el certificado.",
      },
      {
        q: "¿Atienden sistemas que ya están instalados?",
        a: "Sí. Verificamos la instalación, le decimos qué hay que ajustar para cumplir la norma y lo acompañamos hasta la certificación.",
      },
    ],
    seo: {
      title: "Certificación RETIE de sistemas solares",
      description:
        "Visitas técnicas, verificación, acompañamiento en la certificación RETIE y puesta en marcha de sistemas solares fotovoltaicos.",
      keywords: [
        "certificación RETIE paneles solares",
        "certificación sistema fotovoltaico",
      ],
    },
    photo: {
      src: "/fotos/solar-granja-aerea.jpg",
      alt: "Vista aérea de una granja solar fotovoltaica en el Caribe colombiano",
    },
    whatsapp: waMessages.service("energía solar"),
    pendingNotes: ["¿El servicio incluye diseño del sistema?"],
  },
  {
    slug: "redes-baja-media-tension",
    title: "Redes eléctricas de baja y media tensión",
    shortName: "Redes BT y MT",
    lineName: "redes de baja y media tensión",
    icon: "utility-pole",
    cardText:
      "Construcción, normalización y mantenimiento de redes de baja y media tensión.",
    intro:
      "Construcción, normalización y mantenimiento de redes de distribución en baja tensión (BT) y media tensión (MT), con personal con matrícula CONTE y conforme a RETIE.",
    includes: [
      { text: "Trabajos en redes de baja y media tensión." },
      { text: "Normalización de redes y acometidas.", pending: true },
    ],
    forWho:
      "Operadores de red, comercializadoras, industrias, urbanizaciones y comercios.",
    faqs: [],
    seo: {
      title: "Redes eléctricas de baja y media tensión",
      description:
        "Construcción, normalización y mantenimiento de redes eléctricas de baja y media tensión en el Caribe colombiano, conforme a RETIE.",
      keywords: [
        "redes de media tensión",
        "redes eléctricas de baja tensión",
        "normalización de redes",
      ],
    },
    photo: {
      src: "/fotos/redes-rurales-aerea.jpg",
      alt: "Vista aérea de postes y redes de media tensión en zona rural",
    },
    whatsapp: waMessages.service("redes de baja y media tensión"),
    pendingNotes: ["Lista de servicios ejecutados, agrupada por línea."],
  },
  {
    slug: "mantenimiento-industrial",
    title: "Mantenimiento eléctrico industrial",
    shortName: "Mantenimiento",
    lineName: "mantenimiento industrial",
    icon: "wrench",
    cardText:
      "Preventivo, predictivo y correctivo para que su operación no se detenga.",
    intro:
      "Una falla eléctrica detiene la operación. Con un plan de mantenimiento preventivo y predictivo detectamos los problemas antes de que se conviertan en una parada, y cuando algo falla, lo corregimos.",
    includes: [
      { text: "Mantenimiento preventivo: inspección y ajuste programado." },
      { text: "Mantenimiento predictivo: mediciones para anticipar fallas." },
      { text: "Mantenimiento correctivo: reparación y normalización." },
      {
        text: "Equipos que atendemos: subestaciones, transformadores, celdas, tableros.",
        pending: true,
      },
    ],
    forWho:
      "Plantas industriales, comercios grandes, edificios y cualquier empresa que dependa de su infraestructura eléctrica.",
    faqs: [],
    seo: {
      title: "Mantenimiento eléctrico industrial",
      description:
        "Mantenimiento preventivo, predictivo y correctivo de infraestructura eléctrica para industrias y comercios.",
      keywords: [
        "mantenimiento eléctrico industrial",
        "mantenimiento preventivo eléctrico",
      ],
    },
    photo: {
      src: "/fotos/canasta-mantenimiento.jpg",
      alt: "Camión canasta realizando mantenimiento en una red eléctrica urbana",
    },
    whatsapp: waMessages.service("mantenimiento industrial"),
    pendingNotes: [
      "Equipos que atienden y si ofrecen contratos de mantenimiento periódico.",
    ],
  },
  {
    slug: "emergencias",
    title: "Atención de emergencias eléctricas",
    shortName: "Emergencias",
    lineName: "atención de emergencias",
    icon: "triangle-alert",
    cardText:
      "Atención de fallas eléctricas, con confirmación del equipo en cada caso.",
    intro:
      "Reporte su falla y el equipo lo contacta para confirmar la atención.",
    includes: [
      {
        text: "Fallas en instalaciones de media tensión, transformadores, celdas y sistemas de medida.",
      },
      { text: "Fallas eléctricas en industrias y comercios.", pending: true },
    ],
    forWho: "Empresas, industrias y comercios con instalación propia.",
    caseStudy: {
      place: "Valledupar, Cesar",
      text: "Atención de una emergencia en media tensión y restablecimiento del servicio.",
    },
    faqs: [],
    seo: {
      title: "Emergencias eléctricas en el Caribe",
      description:
        "Atención de fallas eléctricas en media tensión, transformadores y sistemas de medida en Barranquilla, Cartagena, Santa Marta, Montería, Valledupar y Sincelejo. Llame al +57 300 687 3112.",
      keywords: [
        "emergencia eléctrica Barranquilla",
        "falla eléctrica media tensión",
        "electricista industrial urgente",
      ],
    },
    photo: {
      src: "/fotos/canasta-calle-aerea.jpg",
      alt: "Cuadrilla con camión canasta atendiendo una red eléctrica en una calle señalizada",
    },
    whatsapp: waMessages.emergency,
  },
];

/** Las ocho líneas con página bajo /servicios/. Emergencias tiene ruta propia. */
export const serviceLines = services.filter((s) => s.slug !== "emergencias");
export const emergencyService = services.find((s) => s.slug === "emergencias")!;

export function serviceHref(s: Service) {
  return s.slug === "emergencias"
    ? "/emergencias-electricas"
    : `/servicios/${s.slug}`;
}

export function getService(slug: string) {
  return serviceLines.find((s) => s.slug === slug);
}
