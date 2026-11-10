/**
 * Guion de Manta (documento de estructura, capítulo 6).
 * Manta habla de usted, en frases cortas, una pregunta por mensaje.
 * Nunca cotiza, nunca promete tiempos y, ante un riesgo, da primero la
 * indicación de seguridad.
 */
import { site } from "@/content/site";
import { telHref, waEmergencyHref, waGeneralHref } from "@/lib/links";

export type Mood = "feliz" | "contento" | "pensativo" | "serio";

export type Option = {
  label: string;
  next?: string;
  /** Enlace externo (tel:, wa.me) */
  href?: string;
  /** Valor que se guarda en `answers[field]` del nodo actual */
  value?: string;
  tone?: "emergency" | "default";
};

export type Node = {
  id: string;
  say: string | ((ctx: Ctx) => string);
  mood?: Mood;
  /** Si el nodo guarda una respuesta, en qué campo */
  field?: string;
  input?: "text" | "tel" | "email";
  placeholder?: string;
  options?: Option[] | ((ctx: Ctx) => Option[]);
  /** Nodo siguiente tras una entrada de texto */
  next?: string | ((ctx: Ctx) => string);
  /** Marca un paso que "registra" la solicitud (prototipo: solo consola) */
  submit?: "emergency" | "quote";
  end?: boolean;
  /** Mensaje previo del aviso de datos antes del primer dato personal */
  privacyNotice?: boolean;
};

export type Ctx = {
  answers: Record<string, string>;
  service?: string;
};

export const SERVICES_LABELS: Record<string, string> = {
  medida: "Sistemas de medición o cambio de comercializador",
  transformadores: "Transformadores, pruebas y diagnóstico",
  solar: "Energía solar",
  proyectos: "Consultoría y proyectos",
  industrial: "Ingeniería eléctrica",
  telemedida: "Telemedida",
  calibracion: "Calibración de equipos de medida",
  suspension: "Suspensión y reconexión para comercializadores",
  redes: "Redes BT y MT",
  mantenimiento: "Mantenimiento",
  otra: "Otra consulta",
};

export const EMERGENCY_KEYWORDS = [
  "emergencia",
  "urgente",
  "urgencia",
  "chispas",
  "chispa",
  "humo",
  "fuego",
  "incendio",
  "se quemó",
  "se quemo",
  "explotó",
  "exploto",
  "accidente",
  "sin luz",
  "sin energía",
  "sin energia",
  "corto",
  "cable caído",
  "cable caido",
  "cable en el piso",
  // Expresiones habituales en la región
  "se fue la luz",
  "sin fluido",
  "apagón",
  "apagon",
  "echando chispas",
  "reventó",
  "revento",
  "quemado",
  "quemándose",
  "quemandose",
  "sin servicio",
];

export function detectEmergency(text: string) {
  const t = text.toLowerCase();
  return EMERGENCY_KEYWORDS.some((k) => t.includes(k));
}

/** Pide hablar con una persona (documento de estructura, 6.4). */
export function detectHuman(text: string) {
  return /hablar con (una persona|alguien|un asesor|un humano|un ingeniero)|persona real|no (quiero|me gusta) (hablar con )?(un )?(bot|robot)/i.test(text);
}

/** Pregunta por precios (documento de estructura, 6.4). */
export function detectPrice(text: string) {
  return /precio|cu[aá]nto (cuesta|vale|sale|cobran)|tarifa|presupuesto/i.test(text);
}

/**
 * Horario de oficina del equipo comercial: lunes a viernes de 8:00 a 16:00,
 * hora de Colombia. Fuera de ese horario Manta aclara que la solicitud queda
 * registrada y se contacta el próximo día hábil (documento de estructura, 6.4).
 */
export function isOfficeHours(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Bogota",
    weekday: "short",
    hour: "numeric",
    hour12: false,
  }).formatToParts(date);
  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "";
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0") % 24;
  const laborable = !["Sat", "Sun"].includes(weekday);
  return laborable && hour >= 8 && hour < 16;
}

const OUT_OF_HOURS_QUOTE =
  " Nuestro equipo comercial atiende de lunes a viernes de 8:00 a 16:00: su solicitud queda registrada y lo contactamos el próximo día hábil.";
const OUT_OF_HOURS_EMERGENCY =
  " Fuera del horario de oficina el reporte se recibe igual: el equipo lo contacta para confirmar si puede atender.";

/** Capitales de la base en el Caribe; el resto de ciudades entra por "Otra ciudad". */
const MAIN_CITIES = ["Barranquilla", "Cartagena", "Santa Marta", "Valledupar", "Montería", "Sincelejo"];
const cityOptions = (next: string): Option[] => [
  ...MAIN_CITIES.filter((c) => site.cities.includes(c)).map((c) => ({ label: c, value: c, next })),
  { label: "Otra ciudad", value: "__otra__", next: `${next}_otra` },
];

const timingOptions = (next: string): Option[] => [
  { label: "Esta semana", value: "Esta semana", next },
  { label: "Este mes", value: "Este mes", next },
  { label: "Estoy averiguando", value: "Estoy averiguando", next },
];

const techQuestion: Record<string, { say: string; options: string[]; follow?: { say: string; placeholder: string } }> = {
  medida: {
    say: "¿Qué necesita?",
    options: ["Cambio de comercializador", "Instalación nueva", "Normalización", "Telemedida", "No estoy seguro"],
  },
  transformadores: {
    say: "¿Qué necesita?",
    options: ["Pruebas o diagnóstico", "Puesta en servicio", "Subestación", "No estoy seguro"],
    follow: { say: "Si es un transformador, ¿sabe su potencia en kVA?", placeholder: "Ejemplo: 500 kVA (o 'no sé')" },
  },
  solar: {
    say: "¿En qué etapa está el sistema?",
    options: ["En diseño", "Instalado, sin certificar", "En funcionamiento"],
    follow: { say: "¿Potencia aproximada en kWp?", placeholder: "Ejemplo: 30 kWp (o 'no sé')" },
  },
  proyectos: {
    say: "¿En qué etapa está su proyecto?",
    options: ["Idea o estudio", "Diseño", "Ejecución", "Instalación existente"],
  },
  industrial: {
    say: "¿En qué etapa está su proyecto?",
    options: ["Idea o estudio", "Diseño", "Ejecución", "Instalación existente"],
  },
  redes: {
    say: "¿Qué tipo de red?",
    options: ["Baja tensión", "Media tensión", "No estoy seguro"],
  },
  mantenimiento: {
    say: "¿Qué tipo de mantenimiento busca?",
    options: ["Preventivo", "Correctivo", "Plan periódico", "No estoy seguro"],
  },
  telemedida: {
    say: "¿Qué necesita?",
    options: ["Recuperar datos de medida", "Equipos de comunicación", "Descarga manual de datos", "No estoy seguro"],
  },
  calibracion: {
    say: "¿Qué equipos necesita calibrar?",
    options: ["Transformadores de corriente (TC)", "Transformadores de tensión (TP/TV)", "Medidores", "Varios", "No estoy seguro"],
  },
  suspension: {
    say: "¿Qué tipo de apoyo necesita?",
    options: ["Suspensiones", "Reconexiones", "Ambas", "No estoy seguro"],
  },
};

export const nodes: Record<string, Node> = {
  start: {
    id: "start",
    mood: "feliz",
    say: "Hola, soy Manta, su aliado técnico en Master Tools. ¿En qué le puedo ayudar?",
    options: [
      { label: "Tengo una emergencia", next: "em1", tone: "emergency" },
      { label: "Medición o cambio de comercializador", value: "medida", next: "q_privacy" },
      { label: "Transformadores, pruebas y diagnóstico", value: "transformadores", next: "q_privacy" },
      { label: "Energía solar", value: "solar", next: "q_privacy" },
      { label: "Otro servicio", next: "other" },
    ],
    field: "service",
  },
  other: {
    id: "other",
    mood: "feliz",
    say: "Claro. ¿Cuál de estos?",
    field: "service",
    options: [
      { label: "Consultoría y proyectos", value: "proyectos", next: "q_privacy" },
      { label: "Ingeniería eléctrica", value: "industrial", next: "q_privacy" },
      { label: "Telemedida", value: "telemedida", next: "q_privacy" },
      { label: "Calibración de equipos de medida", value: "calibracion", next: "q_privacy" },
      { label: "Suspensión y reconexión", value: "suspension", next: "q_privacy" },
      { label: "Redes BT y MT", value: "redes", next: "q_privacy" },
      { label: "Mantenimiento", value: "mantenimiento", next: "q_privacy" },
      { label: "Otra consulta", value: "otra", next: "q_privacy" },
    ],
  },

  /* ----------------------------- Emergencia ----------------------------- */
  em1: {
    id: "em1",
    mood: "serio",
    say: "Entiendo, es una emergencia. ¿Hay fuego, personas lesionadas o cables en el suelo?",
    field: "riesgo",
    options: [
      { label: "Sí", value: "Sí", next: "em1a", tone: "emergency" },
      { label: "No", value: "No", next: "em2" },
    ],
  },
  em1a: {
    id: "em1a",
    mood: "serio",
    say: `Aléjese del área, no toque la instalación y llame al 123. Cuando esté a salvo, puede llamarnos al ${site.phone.display}.`,
    options: [
      { label: "Llamar al 123", href: "tel:123", tone: "emergency" },
      { label: "Llamar a Master Tools", href: telHref },
      { label: "Ya estoy a salvo, continuar el reporte", next: "em2" },
    ],
  },
  em2: {
    id: "em2",
    mood: "serio",
    say: "¿En qué ciudad y dirección está la falla?",
    field: "ubicacion",
    input: "text",
    placeholder: "Ciudad y dirección",
    next: "em3",
  },
  em3: {
    id: "em3",
    mood: "serio",
    say: "¿Qué está pasando?",
    field: "falla",
    options: [
      { label: "Sin servicio", value: "Sin servicio", next: "em3_alcance" },
      { label: "Chispas o humo", value: "Chispas o humo", next: "em4" },
      { label: "Falla de transformador", value: "Falla de transformador", next: "em4" },
      { label: "Problema con el medidor", value: "Problema con el medidor", next: "em4" },
      { label: "Otro", value: "Otro", next: "em3_otro" },
    ],
  },
  em3_alcance: {
    id: "em3_alcance",
    mood: "serio",
    say: "¿El corte afecta solo a su instalación o a todo el barrio o sector?",
    field: "alcance",
    options: [
      { label: "Solo a mi instalación", value: "Solo la instalación", next: "em4" },
      { label: "A todo el barrio o sector", value: "Todo el sector", next: "em3_sector" },
      { label: "No estoy seguro", value: "No está seguro", next: "em4" },
    ],
  },
  em3_sector: {
    id: "em3_sector",
    mood: "pensativo",
    say: "Si el corte afecta a todo su sector, es una falla de la red pública y debe reportarla a su operador de red. Si la falla está solo en su instalación, podemos ayudarle.",
    options: [
      { label: "Es solo en mi instalación, continuar", next: "em4" },
      { label: "Entendido, gracias", next: "bye" },
    ],
  },
  em3_otro: {
    id: "em3_otro",
    mood: "serio",
    say: "Cuénteme en pocas palabras qué pasa.",
    field: "falla_detalle",
    input: "text",
    placeholder: "Descripción breve",
    next: "em4",
  },
  em4: {
    id: "em4",
    mood: "serio",
    say: "¿Su nombre y empresa?",
    field: "nombre",
    input: "text",
    placeholder: "Nombre y empresa",
    next: "em5",
    privacyNotice: true,
  },
  em5: {
    id: "em5",
    mood: "serio",
    say: "¿A qué número lo llamamos?",
    field: "telefono",
    input: "tel",
    placeholder: "+57 300 000 0000",
    next: "em6",
  },
  em6: {
    id: "em6",
    mood: "contento",
    submit: "emergency",
    say: () =>
      `Listo. Ya le pasé su reporte al equipo y lo van a llamar a ese número para confirmar la atención.${isOfficeHours() ? "" : OUT_OF_HOURS_EMERGENCY} Si prefiere no esperar, llame ahora al ${site.phone.display}.`,
    options: [
      { label: "Llamar ahora", href: telHref, tone: "emergency" },
      { label: "Escribir por WhatsApp", href: waEmergencyHref },
    ],
    end: true,
  },

  /* ------------------------------ Cotización ------------------------------ */
  q_privacy: {
    id: "q_privacy",
    mood: "feliz",
    say: "Perfecto. ¿En qué ciudad sería el trabajo?",
    field: "ciudad",
    options: cityOptions("q2"),
    privacyNotice: true,
  },
  q2_otra: {
    id: "q2_otra",
    mood: "pensativo",
    say: "¿En qué ciudad?",
    field: "ciudad",
    input: "text",
    placeholder: "Ciudad",
    next: "q2",
  },
  q2: {
    id: "q2",
    mood: "pensativo",
    say: (ctx) =>
      ctx.service && techQuestion[ctx.service]
        ? techQuestion[ctx.service].say
        : "Cuénteme en pocas palabras qué necesita.",
    field: "detalle",
    input: undefined,
    options: (ctx) => {
      const tq = ctx.service ? techQuestion[ctx.service] : undefined;
      if (!tq) return [];
      const next = tq.follow ? "q2b" : "q3";
      return tq.options.map((o) => ({ label: o, value: o, next }));
    },
    next: "q3",
  },
  q2b: {
    id: "q2b",
    mood: "pensativo",
    say: (ctx) => techQuestion[ctx.service ?? ""]?.follow?.say ?? "¿Algún dato adicional?",
    field: "detalle2",
    input: "text",
    placeholder: "Escriba su respuesta",
    next: "q3",
  },
  q3: {
    id: "q3",
    mood: "feliz",
    say: "¿Para cuándo lo necesita?",
    field: "plazo",
    options: timingOptions("q4"),
  },
  q4: {
    id: "q4",
    mood: "feliz",
    say: "¿Su nombre y empresa?",
    field: "nombre",
    input: "text",
    placeholder: "Nombre y empresa",
    next: "q5",
  },
  q5: {
    id: "q5",
    mood: "feliz",
    say: "¿Cómo prefiere que lo contactemos?",
    field: "canal",
    options: [
      { label: "WhatsApp", value: "WhatsApp", next: "q5_tel" },
      { label: "Llamada", value: "Llamada", next: "q5_tel" },
      { label: "Correo", value: "Correo", next: "q5_mail" },
    ],
  },
  q5_tel: {
    id: "q5_tel",
    mood: "feliz",
    say: "¿A qué número?",
    field: "contacto",
    input: "tel",
    placeholder: "+57 300 000 0000",
    next: "q6",
  },
  q5_mail: {
    id: "q5_mail",
    mood: "feliz",
    say: "¿A qué correo?",
    field: "contacto",
    input: "email",
    placeholder: "nombre@empresa.com",
    next: "q6",
  },
  q6: {
    id: "q6",
    mood: "contento",
    submit: "quote",
    say: (ctx) =>
      `Gracias, ${firstName(ctx.answers.nombre)}. Ya registré su solicitud y un ingeniero se comunicará con usted ${site.responseTime}.${isOfficeHours() ? "" : OUT_OF_HOURS_QUOTE} ¿Hay algo más que quiera agregar?`,
    field: "extra",
    input: "text",
    placeholder: "Algo más que debamos saber (opcional)",
    options: [{ label: "No, gracias", next: "bye" }],
    next: "bye",
  },
  bye: {
    id: "bye",
    mood: "contento",
    say: "Gracias por escribirnos. Aquí estaré si necesita algo más.",
    options: [{ label: "Volver al inicio", next: "start" }],
    end: true,
  },

  /* --------------------------- Situaciones especiales --------------------------- */
  human: {
    id: "human",
    mood: "feliz",
    say: `Claro. Puede escribirnos por WhatsApp o llamarnos al ${site.phone.display}.`,
    options: [
      { label: "Escribir por WhatsApp", href: waGeneralHref },
      { label: "Llamar", href: telHref },
      { label: "Volver", next: "start" },
    ],
  },
  price: {
    id: "price",
    mood: "pensativo",
    say: "El precio depende de cada instalación, por eso un ingeniero revisa su caso antes de cotizar. Si me deja sus datos, lo contactamos.",
    options: [
      { label: "Dejar mis datos", next: "start" },
      { label: "Hablar con una persona", next: "human" },
    ],
  },
  notsure: {
    id: "notsure",
    mood: "pensativo",
    say: "No estoy seguro de haber entendido. ¿Puede elegir una de estas opciones?",
    options: [
      { label: "Tengo una emergencia", next: "em1", tone: "emergency" },
      { label: "Quiero cotizar un servicio", next: "start" },
      { label: "Hablar con una persona", next: "human" },
    ],
  },
};

function firstName(full?: string) {
  if (!full) return "";
  return full.trim().split(/\s+/)[0];
}

export const PRIVACY_NOTICE =
  "Para ayudarle voy a pedirle algunos datos de contacto. Al continuar, acepta nuestra política de tratamiento de datos.";
