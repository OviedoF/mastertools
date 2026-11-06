export type Project = {
  slug: string;
  title: string;
  /** Zona general (departamento o región). Los casos se cuentan a nivel general, sin ciudad. */
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
  /** Fotos de la intervención */
  gallery?: { src: string; alt: string }[];
  pending: string[];
};

const PENDING_DRIVE = ["Solicitud del cliente y resultado (carpeta del Drive)", "Año", "Tipo de cliente"];

/**
 * Casos de éxito. Fuente: fotos y descripciones enviadas por Master Tools
 * (WhatsApp, 6 de noviembre de 2026). Por indicación de la empresa se cuentan a
 * nivel general, sin ciudad ni cliente. Las fotos son propias; se recortó la
 * franja del GPS. La solicitud y el resultado de cada caso llegan en carpetas
 * del Drive y se completan desde el panel de edición.
 */
export const projects: Project[] = [
  {
    slug: "cambio-de-comercializador-nivel-de-tension-2",
    title: "Cambio de comercializador en nivel de tensión 2",
    department: "Córdoba",
    serviceSlug: "medida-nivel-ii-cambio-de-comercializador",
    serviceLabel: "Medida",
    summary: "Montaje del sistema de medida indirecta en media tensión y puesta en servicio con el nuevo comercializador.",
    work: "Montaje de los transformadores de corriente y de tensión en la estructura de media tensión y conexión del sistema de medida, con trabajo en altura desde camión canasta.",
    photo: { src: "/fotos/casos/cambio-comercializador-nt2-1.jpg", alt: "Transformadores de medida instalados en una estructura de media tensión" },
    gallery: [
      { src: "/fotos/casos/cambio-comercializador-nt2-1.jpg", alt: "Transformadores de medida instalados en la estructura" },
      { src: "/fotos/casos/cambio-comercializador-nt2-2.jpg", alt: "Vista del montaje desde el camión canasta" },
      { src: "/fotos/casos/cambio-comercializador-nt2-3.jpg", alt: "Trabajo en altura con camión canasta" },
      { src: "/fotos/casos/cambio-comercializador-nt2-4.jpg", alt: "Estructura de media tensión antes de la intervención" },
      { src: "/fotos/casos/cambio-comercializador-nt2-5.jpg", alt: "Equipos y materiales señalizados antes del montaje" },
    ],
    pending: PENDING_DRIVE,
  },
  {
    slug: "emergencia-puente-primario-y-dps",
    title: "Emergencia por puente primario y daño en DPS",
    department: "Atlántico",
    serviceSlug: "emergencias",
    serviceLabel: "Emergencias",
    summary: "Reposición del puente primario y de los descargadores de sobretensión dañados en una estructura de media tensión.",
    work: "Reemplazo de los descargadores de sobretensión (DPS) dañados y reposición del puente primario en la estructura de media tensión.",
    photo: { src: "/fotos/casos/emergencia-puente-primario-dps-1.jpg", alt: "Estructura de media tensión intervenida con pértiga" },
    gallery: [
      { src: "/fotos/casos/emergencia-puente-primario-dps-1.jpg", alt: "Estructura de media tensión durante la intervención" },
      { src: "/fotos/casos/emergencia-puente-primario-dps-2.jpg", alt: "Detalle de los equipos sobre la estructura" },
      { src: "/fotos/casos/emergencia-puente-primario-dps-3.jpg", alt: "Descargadores de sobretensión y conductor de cobre listos para instalar" },
      { src: "/fotos/casos/emergencia-puente-primario-dps-4.jpg", alt: "Poste y red de media tensión atendidos" },
    ],
    pending: PENDING_DRIVE,
  },
  {
    slug: "reparacion-de-transferencia-de-potencia-y-control",
    title: "Reparación de transferencia de potencia y control",
    department: "Bolívar",
    serviceSlug: "ingenieria-electrica-industrial",
    serviceLabel: "Ingeniería",
    summary: "Reparación del tablero de transferencia entre la red y la planta de emergencia: etapa de potencia y etapa de control.",
    work: "Reparación del tablero de transferencia: interruptores y contactores de red y emergencia en la etapa de potencia, y cableado de la etapa de control.",
    photo: { src: "/fotos/casos/reparacion-transferencia-1.jpg", alt: "Tablero de transferencia con interruptores de red y emergencia" },
    gallery: [
      { src: "/fotos/casos/reparacion-transferencia-1.jpg", alt: "Interruptores y contactores de red y emergencia" },
      { src: "/fotos/casos/reparacion-transferencia-2.jpg", alt: "Tablero de transferencia abierto durante la reparación" },
      { src: "/fotos/casos/reparacion-transferencia-3.jpg", alt: "Cableado de potencia y control del tablero" },
    ],
    pending: PENDING_DRIVE,
  },
  {
    slug: "normalizacion-de-medida-nivel-de-tension-2",
    title: "Normalización de sistema de medida en nivel de tensión 2",
    department: "Atlántico",
    serviceSlug: "medida-nivel-ii-cambio-de-comercializador",
    serviceLabel: "Medida",
    summary: "Reemplazo de los transformadores de medida y normalización del punto de medición en media tensión.",
    work: "Montaje de nuevos transformadores de corriente y de tensión en la estructura de media tensión, con camión canasta, y conexión al sistema de medida.",
    photo: { src: "/fotos/casos/normalizacion-medida-nt2-1.jpg", alt: "Transformadores de medida nuevos montados en la estructura" },
    gallery: [
      { src: "/fotos/casos/normalizacion-medida-nt2-1.jpg", alt: "Transformadores de corriente y de tensión instalados" },
      { src: "/fotos/casos/normalizacion-medida-nt2-2.jpg", alt: "Camión canasta en la intervención" },
      { src: "/fotos/casos/normalizacion-medida-nt2-3.jpg", alt: "Zona de trabajo señalizada con el camión canasta" },
    ],
    pending: PENDING_DRIVE,
  },
  {
    slug: "dano-en-acometidas-de-baja-tension",
    title: "Daño en acometidas de baja tensión: diagnóstico y reparación",
    department: "Córdoba",
    serviceSlug: "emergencias",
    serviceLabel: "Emergencias",
    summary: "Reparación de las acometidas de un transformador de distribución, con verificación antes de la puesta en servicio.",
    work: "Atención nocturna de la falla, reparación de las acometidas de baja tensión en los bujes del transformador y verificación del equipo antes de la puesta en servicio.",
    photo: { src: "/fotos/casos/acometidas-bt-1.jpg", alt: "Transformador de distribución atendido de noche" },
    gallery: [
      { src: "/fotos/casos/acometidas-bt-1.jpg", alt: "Transformador de distribución durante la atención nocturna" },
      { src: "/fotos/casos/acometidas-bt-2.jpg", alt: "Acometidas de baja tensión dañadas antes de la reparación" },
      { src: "/fotos/casos/acometidas-bt-3.jpg", alt: "Bujes de baja tensión después de la reparación" },
      { src: "/fotos/casos/acometidas-bt-4.jpg", alt: "Verificación del transformador antes de la puesta en servicio" },
      { src: "/fotos/casos/acometidas-bt-5.jpg", alt: "Transformador reinstalado en el poste" },
    ],
    pending: PENDING_DRIVE,
  },
  {
    slug: "medida-indirecta-con-rele-de-proteccion",
    title: "Medida indirecta con relé de protección y disparo transferido",
    department: "Atlántico",
    serviceSlug: "medida-nivel-ii-cambio-de-comercializador",
    serviceLabel: "Medida",
    summary: "Sistema de medida indirecta integrado a la celda de protección del cliente, con relé y disparo transferido.",
    work: "Instalación del medidor con bornera de pruebas, conexión de los circuitos de corriente y tensión y cableado hacia el relé de protección con disparo transferido.",
    photo: { src: "/fotos/casos/medida-indirecta-rele-1.jpg", alt: "Medidor y relé de protección en el tablero de medida" },
    gallery: [
      { src: "/fotos/casos/medida-indirecta-rele-1.jpg", alt: "Medidor con módulo de comunicación y relé de protección" },
      { src: "/fotos/casos/medida-indirecta-rele-2.jpg", alt: "Tablero de medida junto a la celda de protección" },
      { src: "/fotos/casos/medida-indirecta-rele-3.jpg", alt: "Medidor trifásico con bornera de pruebas" },
      { src: "/fotos/casos/medida-indirecta-rele-4.jpg", alt: "Borneras y cableado de control de la celda" },
    ],
    pending: PENDING_DRIVE,
  },
  {
    slug: "telemedida-y-medida-en-planta-solar",
    title: "Telemedida y medida de nivel 2 en planta solar",
    department: "Cesar",
    serviceSlug: "telemedida",
    serviceLabel: "Medida",
    summary: "Medidores con comunicación remota para una planta solar fotovoltaica conectada en media tensión.",
    work: "Instalación de los medidores con módulo de comunicación en el gabinete de medida de la planta y conexión al sistema de medida en media tensión.",
    photo: { src: "/fotos/casos/telemedida-planta-solar-1.jpg", alt: "Gabinete con dos medidores y módulos de comunicación" },
    gallery: [
      { src: "/fotos/casos/telemedida-planta-solar-1.jpg", alt: "Medidores con comunicación remota en el gabinete de medida" },
      { src: "/fotos/casos/telemedida-planta-solar-2.jpg", alt: "Acceso a la planta solar y estructura de conexión" },
      { src: "/fotos/casos/telemedida-planta-solar-3.jpg", alt: "Estructura de media tensión de la planta" },
    ],
    pending: PENDING_DRIVE,
  },
  {
    slug: "falla-en-medida-directa-y-normalizacion-del-servicio",
    title: "Falla en sistema de medida directa y normalización del servicio",
    department: "Sucre",
    serviceSlug: "medida-nivel-ii-cambio-de-comercializador",
    serviceLabel: "Medida",
    summary: "Atención de una falla en medida directa para un agente comercializador y normalización del suministro.",
    work: "Intervención con camión canasta sobre la red, revisión del sistema de medida directa y normalización del servicio para el agente comercializador.",
    photo: { src: "/fotos/casos/falla-medida-directa-1.jpg", alt: "Camión canasta sobre la estructura de media tensión" },
    gallery: [
      { src: "/fotos/casos/falla-medida-directa-1.jpg", alt: "Trabajo en la estructura con camión canasta" },
      { src: "/fotos/casos/falla-medida-directa-2.jpg", alt: "Canasta en posición sobre la red" },
    ],
    pending: PENDING_DRIVE,
  },
  {
    slug: "emergencia-conjunta-con-el-operador-de-red",
    title: "Atención de emergencia conjunta con el operador de red",
    department: "Magdalena",
    serviceSlug: "emergencias",
    serviceLabel: "Emergencias",
    summary: "Intervención nocturna coordinada con el operador de red para restablecer el servicio.",
    work: "Trabajo nocturno con camión canasta, en coordinación con el operador de red, hasta normalizar la red del sector.",
    photo: { src: "/fotos/casos/emergencia-conjunta-or-1.jpg", alt: "Camión canasta en una intervención nocturna" },
    gallery: [
      { src: "/fotos/casos/emergencia-conjunta-or-1.jpg", alt: "Técnico en canasta durante la intervención nocturna" },
      { src: "/fotos/casos/emergencia-conjunta-or-2.jpg", alt: "Técnico con arnés preparando el conductor" },
    ],
    pending: PENDING_DRIVE,
  },
  {
    slug: "emergencia-de-mediana-complejidad-en-media-tension",
    title: "Emergencia de mediana complejidad en media tensión",
    department: "Bolívar",
    serviceSlug: "emergencias",
    serviceLabel: "Emergencias",
    summary: "Reparación de un conductor desprendido en media tensión y restablecimiento del servicio.",
    work: "Aseguramiento de la zona, reparación del conductor de media tensión con camión canasta y restablecimiento del servicio.",
    photo: { src: "/fotos/casos/emergencia-mediana-complejidad-1.jpg", alt: "Conductor desprendido en una estructura de media tensión" },
    gallery: [
      { src: "/fotos/casos/emergencia-mediana-complejidad-1.jpg", alt: "Conductor desprendido antes de la reparación" },
      { src: "/fotos/casos/emergencia-mediana-complejidad-2.jpg", alt: "Estructura de media tensión atendida de noche" },
      { src: "/fotos/casos/emergencia-mediana-complejidad-3.jpg", alt: "Camión canasta en la red de media tensión" },
    ],
    pending: PENDING_DRIVE,
  },
  {
    slug: "emergencias-basicas-en-redes-de-distribucion",
    title: "Atención de emergencias básicas en redes de distribución",
    department: "Bolívar",
    serviceSlug: "emergencias",
    serviceLabel: "Emergencias",
    summary: "Trabajos en altura sobre redes de distribución para resolver fallas puntuales.",
    work: "Ascenso con escalera y arnés, revisión de la estructura y del transformador y corrección de la falla en sitio.",
    photo: { src: "/fotos/casos/emergencias-basicas-1.jpg", alt: "Técnico con arnés trabajando en un poste de distribución" },
    gallery: [
      { src: "/fotos/casos/emergencias-basicas-1.jpg", alt: "Técnico en altura sobre la estructura" },
      { src: "/fotos/casos/emergencias-basicas-2.jpg", alt: "Trabajo sobre la cruceta del poste" },
      { src: "/fotos/casos/emergencias-basicas-3.jpg", alt: "Ascenso con escalera dieléctrica" },
      { src: "/fotos/casos/emergencias-basicas-4.jpg", alt: "Transformador de distribución en poste" },
    ],
    pending: PENDING_DRIVE,
  },
  {
    slug: "medida-semidirecta",
    title: "Instalación de medida semidirecta",
    department: "Atlántico",
    serviceSlug: "medida-nivel-ii-cambio-de-comercializador",
    serviceLabel: "Medida",
    summary: "Montaje de transformadores de corriente y medidor con módulo de comunicación en un centro de medida existente.",
    work: "Instalación de la caja de transformadores de corriente y cableado hasta el medidor con módulo de comunicación.",
    photo: { src: "/fotos/casos/medida-semidirecta-1.jpg", alt: "Caja con transformadores de corriente para medida semidirecta" },
    gallery: [
      { src: "/fotos/casos/medida-semidirecta-1.jpg", alt: "Transformadores de corriente instalados en la caja de medida" },
      { src: "/fotos/casos/medida-semidirecta-2.jpg", alt: "Medidor trifásico instalado" },
    ],
    pending: PENDING_DRIVE,
  },
  {
    slug: "revision-integral-de-sistemas-de-medida",
    title: "Revisión integral de sistemas de medida con tecnología actual",
    department: "Atlántico",
    serviceSlug: "medida-nivel-ii-cambio-de-comercializador",
    serviceLabel: "Medida",
    summary: "Inspección con dron y verificación en sitio para detectar fallas ocultas en la medida.",
    work: "Inspección aérea con dron de la estructura de medida para identificar anomalías que no se ven desde el piso, y verificación en sitio de los hallazgos.",
    photo: { src: "/fotos/casos/revision-integral-medida-1.jpg", alt: "Vista aérea de una estructura de medida en media tensión" },
    gallery: [
      { src: "/fotos/casos/revision-integral-medida-1.jpg", alt: "Inspección aérea con el hallazgo señalado" },
      { src: "/fotos/casos/revision-integral-medida-2.jpg", alt: "Control del dron durante la inspección" },
    ],
    pending: PENDING_DRIVE,
  },
  {
    slug: "transformadores-mantenimiento-pruebas-y-tap",
    title: "Mantenimiento, pruebas y conmutación de TAP en transformadores",
    department: "Caribe colombiano",
    serviceSlug: "transformadores-subestaciones",
    serviceLabel: "Mantenimiento",
    summary: "Mantenimiento y pruebas a transformadores de distribución, y ajuste del TAP para regular la tensión entregada.",
    work: "Mantenimiento y pruebas a transformadores de distribución en poste, y conmutación del TAP con pértiga para regular la tensión entregada.",
    photo: { src: "/fotos/casos/transformadores-mantenimiento-tap-1.jpg", alt: "Técnico en canasta frente a un transformador de distribución" },
    gallery: [
      { src: "/fotos/casos/transformadores-mantenimiento-tap-1.jpg", alt: "Mantenimiento de un transformador en poste" },
      { src: "/fotos/casos/transformadores-mantenimiento-tap-2.jpg", alt: "Conmutación del TAP con pértiga" },
    ],
    pending: PENDING_DRIVE,
  },
  {
    slug: "emergencia-fuera-del-caribe",
    title: "Atención de emergencia fuera del Caribe",
    department: "Tolima",
    serviceSlug: "emergencias",
    serviceLabel: "Emergencias",
    summary: "Respuesta a una emergencia en Tolima: maniobra sobre un transformador de distribución.",
    work: "Desplazamiento del equipo hasta Tolima y maniobra con pértiga sobre el transformador de distribución.",
    photo: { src: "/fotos/casos/emergencia-tolima-1.jpg", alt: "Maniobra con pértiga sobre un transformador en poste" },
    gallery: [{ src: "/fotos/casos/emergencia-tolima-1.jpg", alt: "Maniobra con pértiga sobre el transformador" }],
    pending: PENDING_DRIVE,
  },
  {
    slug: "puesta-en-servicio-y-certificacion-de-sistema-solar",
    title: "Puesta en servicio y certificación de un sistema solar",
    department: "Córdoba",
    serviceSlug: "energia-solar-certificacion-retie",
    serviceLabel: "Solar",
    summary: "Acompañamiento técnico en la puesta en servicio y en la inspección para el certificado CIDET.",
    work: "Acompañamiento técnico en la puesta en servicio del sistema fotovoltaico y en el proceso de certificación con CIDET.",
    photo: { src: "/fotos/casos/ssfv-puesta-en-servicio-1.jpg", alt: "Equipos de prueba y generador en la camioneta del equipo" },
    gallery: [{ src: "/fotos/casos/ssfv-puesta-en-servicio-1.jpg", alt: "Equipos de prueba listos en el sitio" }],
    pending: PENDING_DRIVE,
  },
];

export const projectFilters = [
  "Medida",
  "Ingeniería",
  "Solar",
  "Mantenimiento",
  "Emergencias",
] as const;
