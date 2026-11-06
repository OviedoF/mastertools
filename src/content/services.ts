import type { IconKey } from "@/components/ui/icon-map";
import { waMessages } from "@/lib/links";

/**
 * Las doce líneas de servicio. Fuente: "Estructura y contenidos web" v1.2 con
 * las observaciones de Master Tools (noviembre de 2026). Es el respaldo
 * cuando no hay CMS y la semilla del panel de edición.
 */
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

const NORMS_DEFAULT =
  "Trabajos conforme a RETIE y NTC 2050 (Código Eléctrico Colombiano) y al Código de Medida (Resolución CREG 038), con pautas internacionales IEEE y personal con matrícula profesional CONTE vigente.";

export const services: Service[] = [
  {
    slug: "ingenieria-consultoria-proyectos",
    title: "Ingeniería, consultoría y gestión de proyectos eléctricos",
    shortName: "Ingeniería y proyectos",
    lineName: "ingeniería, consultoría y gestión de proyectos",
    icon: "drafting-compass",
    cardText:
      "Estudios, diseño, consultoría normativa, interventoría y gestión de proyectos eléctricos.",
    intro:
      "Acompañamos su proyecto eléctrico desde la idea hasta la puesta en marcha: estudios, diseño, cumplimiento normativo, interventoría y gestión de la ejecución, con un solo interlocutor técnico.",
    includes: [
      { text: "Estudios técnicos y diagnóstico de instalaciones." },
      { text: "Diseño de instalaciones eléctricas." },
      { text: "Consultoría y acompañamiento para cumplir RETIE." },
      { text: "Planeación, gestión y supervisión de proyectos." },
      { text: "Interventoría de servicios existentes." },
    ],
    forWho:
      "Industrias, constructoras, proyectos de generación, comercializadoras y profesionales independientes.",
    faqs: [],
    seo: {
      title: "Ingeniería y gestión de proyectos eléctricos",
      description:
        "Estudios técnicos, diseño, consultoría normativa RETIE, interventoría y gestión de proyectos eléctricos en el Caribe y el resto del país.",
      keywords: ["consultoría eléctrica", "gestión de proyectos eléctricos", "diseño eléctrico RETIE", "interventoría eléctrica"],
    },
    photo: {
      src: "/fotos/red-rural-camino.jpg",
      alt: "Vista aérea de una red eléctrica rural junto a un camino, con el vehículo del equipo técnico",
    },
    whatsapp: waMessages.service("ingeniería, consultoría y gestión de proyectos"),
    pendingNotes: ["Lista de servicios ejecutados, agrupada por línea."],
  },
  {
    slug: "ingenieria-electrica-industrial",
    title: "Ingeniería eléctrica",
    shortName: "Ingeniería eléctrica",
    lineName: "ingeniería eléctrica",
    icon: "factory",
    cardText:
      "Instalaciones, adecuaciones, suministro de equipos de potencia y soporte técnico para plantas, comercios y edificios.",
    intro:
      "Instalaciones, adecuaciones, suministro de equipos y soporte técnico para plantas industriales, comercios y edificios, pensados para que la operación no se detenga.",
    includes: [
      { text: "Instalaciones y adecuaciones eléctricas industriales." },
      { text: "Inspecciones técnicas y verificación de equipos." },
      { text: "Soporte técnico especializado en planta." },
      { text: "Asesoramiento en proyectos de expansión de potencia eléctrica." },
      { text: "Suministro de equipos de potencia y tableros industriales." },
    ],
    forWho:
      "Plantas industriales, centros logísticos, grandes comercios y edificios.",
    faqs: [],
    seo: {
      title: "Ingeniería eléctrica para industria y comercio",
      description:
        "Instalaciones, adecuaciones, inspecciones, suministro de equipos de potencia y soporte técnico eléctrico para industrias, comercios y edificios en Colombia.",
      keywords: ["ingeniería eléctrica", "ingeniería eléctrica industrial", "instalaciones eléctricas industriales Barranquilla", "tableros industriales"],
    },
    photo: {
      src: "/fotos/celda-mt-terminales.jpg",
      alt: "Terminales de media tensión instalados en una celda",
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
      "Revisión, diagnóstico y puesta en servicio, con pruebas antes y después de energizar. Sistemas de potencia, bancos de compensación, transferencias automáticas y sistemas de control.",
    intro:
      "Revisamos, diagnosticamos y ponemos en servicio transformadores, celdas y subestaciones, con pruebas antes y después de energizar y un informe técnico al final.",
    includes: [
      { text: "Revisión y diagnóstico de transformadores." },
      { text: "Puesta en servicio y energización, con pruebas previas y posteriores." },
      { text: "Celdas y equipos de media tensión." },
      {
        text: "Instalación de sistemas de potencia, bancos de compensación, transferencias automáticas y sistemas de respaldo.",
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
        "Revisión, diagnóstico y puesta en servicio de transformadores y subestaciones eléctricas, con pruebas antes y después de energizar e informe técnico.",
      keywords: ["puesta en servicio transformador", "mantenimiento subestaciones", "diagnóstico de transformadores", "bancos de compensación"],
    },
    photo: {
      src: "/fotos/subestacion-estructura.jpg",
      alt: "Estructura de una subestación eléctrica de alta tensión",
    },
    whatsapp: waMessages.service("transformadores y subestaciones"),
  },
  {
    slug: "pruebas-diagnostico-electrico",
    title: "Pruebas y diagnóstico eléctrico",
    shortName: "Pruebas y diagnóstico",
    lineName: "pruebas y diagnóstico eléctrico",
    icon: "activity",
    cardText:
      "TTR, resistencia de aislamiento y análisis de respuesta en frecuencia (SFRA).",
    intro:
      "Medimos antes de decidir. Probamos transformadores y equipos con instrumentación calibrada, desde las pruebas de rutina hasta ensayos de alto nivel técnico como el análisis de respuesta en frecuencia (SFRA).",
    includes: [
      { text: "Pruebas de relación de transformación (TTR)." },
      { text: "Pruebas de resistencia de aislamiento." },
      { text: "Análisis de respuesta en frecuencia (SFRA)." },
      { text: "Mediciones con analizadores de red." },
      { text: "Diagnóstico e informe técnico con resultados y recomendaciones." },
    ],
    equipment:
      "Medidor de relación de transformación (TTR), medidor de resistencia de aislamiento, equipo de análisis de respuesta en frecuencia (SFRA) y analizadores de red, todos calibrados.",
    norms:
      "Ensayos según RETIE, NTC 2050 y el Código de Medida (Resolución CREG 038), con pautas internacionales IEEE.",
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
      keywords: ["prueba TTR transformador", "prueba de aislamiento transformador", "prueba SFRA transformador"],
    },
    photo: {
      src: "/fotos/prueba-transformador-campo.jpg",
      alt: "Técnico realizando pruebas a un transformador de distribución con un equipo de medición calibrado",
    },
    whatsapp: waMessages.service("pruebas y diagnóstico eléctrico"),
  },
  {
    slug: "medida-nivel-ii-cambio-de-comercializador",
    title: "Cambio de comercializador y sistemas de medición Nivel I, II y III",
    shortName: "Sistemas de medición",
    lineName: "sistemas de medición o cambio de comercializador",
    icon: "gauge",
    cardText:
      "Cambio de comercializador en Nivel I, II y III, normalización de fronteras comerciales, aumentos de nivel de tensión, unificación, independización y mitigación de cuentas.",
    intro:
      "Si su empresa quiere cambiar de comercializador de energía, o necesita poner su medida en regla, nos encargamos de la instalación, la normalización y las pruebas del sistema de medida, en baja o media tensión. Solo en un mes reciente ejecutamos más de 80 actuaciones de campo en sistemas de medida para una comercializadora del Caribe.",
    includes: [
      {
        text: "Instalación de sistemas de medida Nivel II: medidores, transformadores de corriente y de tensión, celdas o cajas de medida.",
      },
      { text: "Normalización de sistemas de medida existentes." },
      { text: "Normalización de fronteras comerciales." },
      { text: "Adecuación del sistema de medida para el cambio de comercializador." },
      { text: "Aumentos de nivel de tensión, de Nivel I a Nivel II." },
      { text: "Inspección integral del sistema de medida directa, semidirecta e indirecta." },
      { text: "Revisión conjunta de medida indirecta en niveles de tensión 2, 3 y 4." },
      { text: "Cambio de medidores de energía." },
      { text: "Mantenimiento preventivo del sistema de medida." },
      { text: "Retiro y reposición de sellos en medidores." },
      { text: "Instalación y verificación de bancos de compensación." },
      { text: "Implementación de sistemas de control." },
      {
        text: "Trámites de conexión, medición y adecuación de redes: unificación, independización y mitigación de medidores.",
      },
    ],
    norms:
      "Sistemas de medida conforme al Código de Medida (Resolución CREG 038) y a los reglamentos internos de cada operador de red, bajo RETIE y NTC 2050.",
    forWho:
      "Industrias, comercios, edificios y usuarios conectados en baja o media tensión; comercializadoras y operadores de red que necesitan apoyo técnico en campo.",
    caseStudy: {
      place: "Montería, Córdoba",
      text: "Adecuación del sistema de medida para la transición de comercializador.",
    },
    faqs: [
      {
        q: "¿Qué es la medida Nivel II?",
        a: "Es el sistema de medida de los usuarios conectados en nivel de tensión II, entre 1 kV y menos de 30 kV, como las redes de 13,2 kV habituales en la región.",
      },
      {
        q: "¿Qué necesito para cambiar de comercializador?",
        a: "Entre otros requisitos, que su sistema de medida cumpla el Código de Medida vigente (Resolución CREG 038). Revisamos su instalación y le decimos qué hay que adecuar.",
      },
      {
        q: "¿Hay que suspender el servicio?",
        a: "Para una frontera comercial en Nivel de Tensión II, la interrupción del servicio suele durar entre 2 y 4 horas. La solicitud debe presentarse habitualmente con 7 a 15 días hábiles de anticipación, según las políticas de cada operador de red.",
      },
    ],
    seo: {
      title: "Cambio de comercializador y medida Nivel I, II y III",
      description:
        "Instalación, normalización y pruebas de sistemas de medida Nivel I, II y III para cambiar de comercializador de energía. Barranquilla, Cartagena, Santa Marta, Montería y todo el país.",
      keywords: ["cambio de comercializador de energía", "medida nivel II", "normalización de medida", "frontera comercial"],
    },
    photo: {
      src: "/fotos/celda-medida-13200.jpg",
      alt: "Celda de medida de 13,2 kV con sus conexiones identificadas",
    },
    featured: true,
    whatsapp: waMessages.medida,
  },
  {
    slug: "telemedida",
    title: "Telemedida y gestión de la información de medida",
    shortName: "Telemedida",
    lineName: "telemedida",
    icon: "radio-tower",
    cardText:
      "Recuperación integral de datos, suministro de equipos de comunicación y descarga manual de medidores.",
    intro:
      "Recuperamos y gestionamos la información de los sistemas de medida: comunicaciones, equipos y descarga de datos, para que su frontera comercial reporte sin interrupciones.",
    includes: [
      { text: "Atención de telemedida en sitio: diagnóstico y restablecimiento de la comunicación del medidor." },
      { text: "Recuperación integral de datos de medida." },
      { text: "Suministro de equipos de comunicación: antenas, lazos, módems y fuentes de alimentación." },
      { text: "Descarga manual de datos por computador cuando no hay comunicación remota." },
    ],
    forWho:
      "Comercializadoras, operadores de red e industrias con fronteras comerciales.",
    faqs: [],
    seo: {
      title: "Telemedida y recuperación de datos de medida",
      description:
        "Recuperación de datos de medidores, suministro de equipos de comunicación y descarga manual para fronteras comerciales en todo el país.",
      keywords: ["telemedida energía", "recuperación de datos de medidores", "comunicaciones de medidores"],
    },
    photo: {
      src: "/fotos/medidor-trifasico.jpg",
      alt: "Medidor trifásico tetrafilar instalado en un sistema de medida",
    },
    whatsapp: waMessages.service("telemedida"),
    pendingNotes: [
      "Título e introducción de la página: el documento los deja pendientes; esta es una propuesta.",
      "Caso relacionado y preguntas frecuentes.",
    ],
  },
  {
    slug: "calibracion-equipos-medida",
    title: "Calibración de equipos de medida en sitio",
    shortName: "Calibración de medida",
    lineName: "calibración de equipos de medida",
    icon: "scale",
    cardText:
      "Gestión y desarrollo de calibraciones en sitio para transformadores de corriente, de tensión y medidores.",
    intro:
      "Gestionamos y desarrollamos la calibración en sitio de transformadores de corriente (TC), transformadores de tensión (TP/TV) y medidores de energía, con la documentación que exige su frontera comercial.",
    includes: [
      { text: "Calibración en sitio de transformadores de corriente (TC)." },
      { text: "Calibración en sitio de transformadores de tensión (TP/TV)." },
      { text: "Calibración de medidores de energía." },
      { text: "Gestión del proceso y de la documentación de calibración.", pending: true },
    ],
    forWho:
      "Comercializadoras, operadores de red, industrias y usuarios con frontera comercial.",
    faqs: [],
    seo: {
      title: "Calibración de equipos de medida en sitio",
      description:
        "Calibración en sitio de transformadores de corriente, de tensión y medidores de energía para fronteras comerciales en Colombia.",
      keywords: ["calibración de medidores de energía", "calibración de transformadores de corriente", "calibración en sitio"],
    },
    photo: {
      src: "/fotos/analizador-metrel.jpg",
      alt: "Equipo de medición mostrando los resultados de una prueba",
    },
    whatsapp: waMessages.service("calibración de equipos de medida"),
    pendingNotes: [
      "Texto completo de la página: el documento solo trae la descripción de la línea; esta es una propuesta.",
      "Confirmar quién emite el certificado de calibración (laboratorio acreditado o gestión de Master Tools): cambia cómo se escribe.",
    ],
  },
  {
    slug: "suspension-reconexion-comercializadores",
    title: "Suspensión y reconexión del servicio para comercializadores",
    shortName: "Suspensión y reconexión",
    lineName: "suspensión y reconexión para comercializadores",
    icon: "power",
    cardText: "Apoyo operativo en campo a agentes comercializadores.",
    intro:
      "Ejecutamos en campo las órdenes de suspensión y reconexión del servicio para agentes comercializadores, con registro y reporte de cada actuación.",
    includes: [
      { text: "Suspensión del servicio por orden del comercializador." },
      { text: "Reconexión del servicio." },
      { text: "Visitas de instalación y de retiro de equipos de medida." },
      { text: "Recogida y devolución de equipos desmontados." },
      { text: "Registro fotográfico y reporte de cada actuación.", pending: true },
    ],
    forWho: "Comercializadores de energía y operadores de red.",
    faqs: [],
    seo: {
      title: "Suspensión y reconexión para comercializadores",
      description:
        "Apoyo operativo en campo a comercializadores de energía: suspensión y reconexión del servicio con registro y reporte de cada actuación.",
      keywords: ["suspensión y reconexión de energía", "apoyo operativo comercializadores"],
    },
    photo: {
      src: "/fotos/senalizacion-poste.jpg",
      alt: "Técnico trabajando en un poste con la zona señalizada con conos",
    },
    whatsapp: waMessages.service("suspensión y reconexión para comercializadores"),
    pendingNotes: [
      "Texto completo de la página: el documento solo trae la descripción de la línea; esta es una propuesta.",
    ],
  },
  {
    slug: "energia-solar-certificacion-retie",
    title: "Certificación y puesta en marcha de sistemas solares fotovoltaicos",
    shortName: "Energía solar",
    lineName: "energía solar",
    icon: "sun",
    cardText:
      "Acompañamiento en la certificación RETIE, puesta en marcha de sistemas fotovoltaicos e interventoría interna.",
    intro:
      "Un sistema solar tiene que cumplir el RETIE para conectarse a la red. Acompañamos todo el proceso: desde el diseño y la visita técnica hasta la certificación, la puesta en marcha y la interventoría de proyectos en curso.",
    includes: [
      { text: "Diseño y acompañamiento técnico de sistemas solares fotovoltaicos (SSFV)." },
      { text: "Visitas técnicas y verificación de instalaciones." },
      { text: "Acompañamiento en la certificación RETIE." },
      { text: "Visitas técnicas para procesos de certificación CIDET." },
      { text: "Parametrización de medidores y puesta en marcha." },
      { text: "Interventoría interna para verificar el cumplimiento de proyectos en curso." },
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
        "Diseño, visitas técnicas, acompañamiento en la certificación RETIE, puesta en marcha e interventoría de sistemas solares fotovoltaicos.",
      keywords: ["certificación RETIE paneles solares", "certificación sistema fotovoltaico", "diseño sistema solar fotovoltaico"],
    },
    photo: {
      src: "/fotos/solar-granja-aerea.jpg",
      alt: "Vista aérea de una granja solar fotovoltaica en el Caribe colombiano",
    },
    whatsapp: waMessages.service("energía solar"),
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
      { text: "Normalización de redes y acometidas." },
    ],
    forWho:
      "Operadores de red, comercializadoras, industrias, urbanizaciones y comercios.",
    faqs: [],
    seo: {
      title: "Redes eléctricas de baja y media tensión",
      description:
        "Construcción, normalización y mantenimiento de redes eléctricas de baja y media tensión en Colombia, conforme a RETIE.",
      keywords: ["redes de media tensión", "redes eléctricas de baja tensión", "normalización de redes"],
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
      "Preventivo, predictivo y correctivo, por contrato periódico o servicio puntual, para que su operación no se detenga.",
    intro:
      "Una falla eléctrica detiene la operación. Con un plan de mantenimiento preventivo y predictivo detectamos los problemas antes de que se conviertan en una parada, y cuando algo falla, lo corregimos. Trabajamos por contrato periódico o por servicio puntual.",
    includes: [
      { text: "Mantenimiento preventivo: inspección y ajuste programado." },
      { text: "Mantenimiento predictivo: mediciones para anticipar fallas." },
      { text: "Mantenimiento correctivo: reparación y normalización." },
      { text: "Equipos que atendemos: subestaciones, transformadores, celdas y tableros." },
      { text: "Contratos de mantenimiento periódico o servicios puntuales." },
    ],
    forWho:
      "Plantas industriales, comercios grandes, edificios y cualquier empresa que dependa de su infraestructura eléctrica.",
    faqs: [],
    seo: {
      title: "Mantenimiento eléctrico industrial",
      description:
        "Mantenimiento preventivo, predictivo y correctivo de subestaciones, transformadores, celdas y tableros, por contrato periódico o servicio puntual.",
      keywords: ["mantenimiento eléctrico industrial", "mantenimiento preventivo eléctrico", "contrato de mantenimiento eléctrico"],
    },
    photo: {
      src: "/fotos/canasta-mantenimiento.jpg",
      alt: "Camión canasta realizando mantenimiento en una red eléctrica urbana",
    },
    whatsapp: waMessages.service("mantenimiento industrial"),
  },
  {
    slug: "emergencias",
    title: "Atención de emergencias eléctricas",
    shortName: "Emergencias",
    lineName: "atención de emergencias",
    icon: "triangle-alert",
    cardText:
      "Atención de fallas eléctricas en baja y media tensión, con confirmación del equipo en cada caso.",
    intro: "Reporte su falla y el equipo lo contacta para confirmar la atención.",
    includes: [
      { text: "Fallas en instalaciones de media tensión, transformadores, celdas y sistemas de medida." },
      { text: "Fallas eléctricas en industrias y comercios, en baja y media tensión." },
      { text: "Atención técnica básica de emergencia para comercios, cadenas y oficinas." },
      { text: "Fallas en instalaciones residenciales, atendidas al particular cuando el operador de red no responde." },
    ],
    forWho: "Empresas, industrias, comercios y particulares, en baja y media tensión.",
    norms: NORMS_DEFAULT,
    caseStudy: {
      place: "Valledupar, Cesar",
      text: "Atención de una emergencia en media tensión y restablecimiento del servicio.",
    },
    faqs: [],
    seo: {
      title: "Emergencias eléctricas",
      description:
        "Atención de fallas eléctricas en baja y media tensión, transformadores y sistemas de medida en todo el país, con respuesta más rápida en Barranquilla, Cartagena, Santa Marta, Montería, Valledupar y Sincelejo. Llame al +57 300 687 3112.",
      keywords: ["emergencia eléctrica Barranquilla", "falla eléctrica media tensión", "electricista industrial urgente"],
    },
    photo: {
      src: "/fotos/canasta-calle-aerea.jpg",
      alt: "Cuadrilla con camión canasta atendiendo una red eléctrica en una calle señalizada",
    },
    whatsapp: waMessages.emergency,
  },
];

/** Las once líneas con página bajo /servicios/. Emergencias tiene ruta propia. */
export const serviceLines = services.filter((s) => s.slug !== "emergencias");
export const emergencyService = services.find((s) => s.slug === "emergencias")!;

export function serviceHref(s: Pick<Service, "slug">) {
  return s.slug === "emergencias" ? "/emergencias-electricas" : `/servicios/${s.slug}`;
}

export function getService(slug: string) {
  return serviceLines.find((s) => s.slug === slug);
}
