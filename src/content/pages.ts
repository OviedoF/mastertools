/**
 * Textos de Inicio, Nosotros y la política de datos. Fuente: documento de
 * estructura v1.2. Son el respaldo cuando no hay CMS y la semilla inicial
 * del panel de edición.
 */
export const homeContent = {
  heroEyebrow: "Ingeniería eléctrica · Base en el Caribe, alcance nacional",
  heroTitle: "Ingeniería eléctrica, sistemas de medición y emergencias para empresas a nivel nacional",
  heroSubtitle:
    "Instalamos y normalizamos sistemas de medida Nivel I, II y III, hacemos pruebas TTR y de resistencia de aislamiento a transformadores de potencia y atendemos fallas eléctricas, con personal certificado y equipos calibrados.",
  heroPhoto: {
    src: "/fotos/hero-liniero-canasta.jpg",
    alt: "Técnico con casco y arnés trabajando desde un camión canasta sobre una red de distribución",
  },
  heroCaption: "Intervención en red de distribución",
  heroCaptionNote: "Foto del banco de la empresa. Pie de foto por confirmar.",
  trust: ["Personal con matrícula CONTE", "RETIE y NTC 2050", "Pautas IEEE", "Equipos calibrados"],

  servicesTitle: "Un solo aliado para toda su infraestructura eléctrica",
  servicesText:
    "Del proyecto a la puesta en servicio, de la medida al mantenimiento. Doce líneas de servicio con un solo equipo técnico: su empresa no tiene que coordinar a varios contratistas.",
  processTitle: "Así trabajamos en cada proyecto",
  processText:
    "Seis pasos, siempre los mismos. Así usted sabe qué esperar y nosotros podemos garantizar el resultado.",
  projectsTitle: "Proyectos recientes",
  projectsText:
    "Trabajos ejecutados por nuestro equipo, con fotos propias de cada intervención. La evidencia antes que los adjetivos.",
  coverageTitle: "Dónde trabajamos",
  coverageText:
    "Con base en el Caribe, hemos trabajado en 12 departamentos y atendemos en todo el país. Las emergencias tienen tiempos de respuesta más cortos en los departamentos de nuestra base.",
  emergencyTitle: "¿Tiene una falla eléctrica ahora?",
  emergencyText:
    "Llámenos o escríbanos. Si hay riesgo para personas, aléjese del área y llame al 123. Atendemos en baja y media tensión; la atención se confirma en cada caso.",
  closingTitle: "Hablemos de su proyecto",
  closingText: "Cuéntenos qué necesita y le respondemos con una propuesta técnica.",

  featuredEyebrow: "Medida Nivel II",
  featuredTitle: "¿Su empresa va a cambiar de comercializador de energía?",
  featuredText:
    "Para hacer el cambio, su sistema de medida tiene que cumplir la norma. Revisamos su medida, la adecuamos y hacemos las pruebas para que la transición se haga sin contratiempos.",
  featuredPoints: [
    "Revisamos su sistema de medida actual",
    "Lo adecuamos a la norma vigente",
    "Hacemos las pruebas y dejamos el informe",
  ],
  featuredServiceSlug: "medida-nivel-ii-cambio-de-comercializador",
  featuredPhoto: {
    src: "/fotos/celda-medida-13200.jpg",
    alt: "Celda de medida de 13,2 kV con transformadores de medida y conexiones identificadas",
  },
};
export type HomeContent = typeof homeContent;

export const aboutContent = {
  title: "Somos Master Tools",
  intro:
    "Master Tools & Services S.A.S. es una empresa de ingeniería eléctrica fundada en 2024, con base en el Caribe colombiano. Acompañamos a comercializadores de energía, operadores de red, industria, comercio y proyectos de generación con soluciones técnicas que garantizan la continuidad de la operación, la confiabilidad de los sistemas eléctricos y el cumplimiento de la normativa vigente.",
  photo: {
    src: "/fotos/equipo-subestacion.jpg",
    alt: "Técnico de Master Tools con uniforme y casco frente a una subestación eléctrica",
  },
  mission:
    "Conectar soluciones técnicas confiables que impulsen el desarrollo y la seguridad de la infraestructura eléctrica del país.",
  vision:
    "Para 2030, consolidarnos como referente nacional en ingeniería eléctrica, integrando conocimiento especializado y capacidad operativa para desarrollar soluciones que respondan a los desafíos de la industria, con agilidad, precisión y confiabilidad.",
  teamText: "Ingenieros y técnicos con matrícula profesional CONTE vigente.",
  team: [] as { name: string; role: string; photo?: { src: string; alt: string } }[],
  equipmentText:
    "Instrumentación calibrada para diagnóstico, medición y puesta en servicio: TTR, medidores de aislamiento y analizadores de red.",
  equipmentList: [] as string[],
  photos: [
    { src: "/fotos/equipo-subestacion-2.jpg", alt: "Técnico de Master Tools revisando una subestación" },
    {
      src: "/fotos/analizador-metrel.jpg",
      alt: "Analizador de transformadores mostrando los resultados de una prueba de relación de vueltas",
    },
  ],
  values: [
    { title: "Seguridad", text: "Primero las personas, siempre. Ningún trabajo justifica un riesgo." },
    { title: "Calidad", text: "Procesos estandarizados, equipos calibrados, mejora continua." },
    { title: "Confiabilidad", text: "Resultados precisos y oportunos, documentados en un informe técnico." },
    { title: "Compromiso", text: "Ser el aliado técnico del cliente, también después de la entrega." },
  ],
};
export type AboutContent = typeof aboutContent;

export const legalContent = {
  title: "Política de tratamiento de datos personales",
  intro:
    "Conforme a la Ley 1581 de 2012 y el Decreto 1377 de 2013. Borrador para revisión de Master Tools.",
  approved: false,
  sections: [
    {
      heading: "1. Responsable del tratamiento",
      body: "Master Tools & Services S.A.S., con NIT [Completar], domicilio [Completar] y correo [Completar]. Teléfono: +57 300 687 3112.",
    },
    {
      heading: "2. Finalidades",
      body: "Los datos que usted nos entrega por el formulario, el chat, WhatsApp, correo o teléfono se usan para: responder su solicitud, elaborar cotizaciones, coordinar y atender emergencias, ejecutar y documentar los servicios contratados y, solo con su autorización expresa, enviarle información comercial.",
    },
    {
      heading: "3. Datos que tratamos",
      body: "Nombre, empresa, cargo, teléfono, correo electrónico, ciudad, dirección de la instalación y la información técnica que usted comparta, incluidos archivos adjuntos como fotos, planos o facturas de energía.",
    },
    {
      heading: "4. Derechos de los titulares",
      body: "Usted puede conocer, actualizar, rectificar y suprimir sus datos, solicitar prueba de la autorización, ser informado sobre el uso que se les ha dado, presentar quejas ante la Superintendencia de Industria y Comercio y revocar la autorización cuando no exista un deber legal o contractual que lo impida.",
    },
    {
      heading: "5. Canal para consultas y reclamos",
      body: "Escriba al correo comercial indicando su nombre, el dato de contacto y la solicitud. Las consultas se atienden en un máximo de diez días hábiles y los reclamos en quince días hábiles, según la ley.",
    },
    {
      heading: "6. Seguridad y vigencia",
      body: "Aplicamos medidas técnicas y administrativas para proteger la información. Los datos se conservan mientras dure la relación comercial y el tiempo que exijan las obligaciones legales. Esta política rige desde su publicación y puede actualizarse; la versión vigente es la que aparece en esta página.",
    },
  ],
};
export type LegalContent = typeof legalContent;
