/**
 * Datos de la empresa. Fuente: Manual de marca v1.2 y
 * "Estructura y contenidos web" v1.2. Es el respaldo cuando no hay CMS y la
 * semilla inicial del panel de edición. Los valores entre corchetes son
 * datos que todavía tiene que confirmar Master Tools (ver `pending`).
 */
export type NavItem = { label: string; href: string; hasMenu?: boolean };
export type Stat =
  | { value: number; prefix?: string; label: string }
  | { text: string; label: string };
export type SocialLink = { label: string; href: string; pending?: boolean };

export type SiteSettings = {
  name: string;
  legalName: string;
  domain: string;
  url: string;
  slogan: string;
  summary: string;
  founded: number;
  phone: { display: string; tel: string; wa: string };
  email: string;
  nit: string;
  responseTime: string;
  officeHours: string;
  address: string;
  city: string;
  careersEmail: string;
  /** Qué datos siguen sin confirmar */
  pending: {
    nit: boolean;
    email: boolean;
    responseTime: boolean;
    officeHours: boolean;
    address: boolean;
    city: boolean;
    careersEmail: boolean;
  };
  emergencyDepartments: string[];
  allDepartments: string[];
  cities: string[];
  stats: Stat[];
  nav: NavItem[];
  social: SocialLink[];
};

export const nav: NavItem[] = [
  { label: "Servicios", href: "/servicios", hasMenu: true },
  { label: "Proyectos", href: "/proyectos" },
  { label: "Cobertura", href: "/cobertura" },
  { label: "Nosotros", href: "/nosotros" },
  { label: "Contacto", href: "/contacto" },
];

export const site: SiteSettings = {
  name: "Master Tools",
  legalName: "Master Tools & Services S.A.S.",
  domain: "mastertools.tech",
  url: "https://mastertools.tech",
  slogan: "Ingeniería que conecta, soluciones que transforman.",
  summary:
    "Ingeniería eléctrica, sistemas de medida y atención de emergencias para empresas del Caribe colombiano y soluciones integrales a nivel nacional.",
  founded: 2024,

  phone: {
    display: "+57 300 687 3112",
    tel: "+573006873112",
    wa: "573006873112",
  },
  /** Propuesta: el cliente debe confirmar el correo comercial único. */
  email: "comercial@mastertools.tech",
  nit: "NIT 901.865.320-2",
  /** Confirmado por la empresa: máximo 24 horas, según la complejidad de la solicitud. */
  responseTime: "en menos de 24 horas hábiles",
  officeHours: "Lunes a viernes, 8:00 a 16:00",
  address: "[Completar dirección]",
  city: "[Completar ciudad sede]",
  careersEmail: "[Completar correo]",
  pending: {
    nit: false,
    email: true,
    responseTime: false,
    officeHours: false,
    address: true,
    city: true,
    careersEmail: true,
  },

  /** Zona de atención de emergencias (barra superior y página de Emergencias). */
  emergencyDepartments: ["Atlántico", "Bolívar", "Magdalena", "Cesar", "Córdoba", "Sucre"],
  /** Departamentos donde se han ejecutado trabajos. */
  allDepartments: [
    "Atlántico",
    "Bolívar",
    "Magdalena",
    "Cesar",
    "Córdoba",
    "Sucre",
    "La Guajira",
    "Antioquia",
    "Chocó",
    "Tolima",
    "Cundinamarca",
    "Boyacá",
  ],
  cities: [
    "Barranquilla",
    "Soledad",
    "Puerto Colombia",
    "Galapa",
    "Cartagena",
    "Santa Marta",
    "Montería",
    "Valledupar",
    "Sincelejo",
    "Riohacha",
    "Ciénaga",
    "Magangué",
    "Tolú",
    "Corozal",
    "Cereté",
    "Chimichagua",
    "Luruaco",
    "Suan",
  ],

  stats: [
    { value: 350, prefix: "+", label: "intervenciones ejecutadas" },
    { value: 12, label: "departamentos atendidos" },
    { text: "CONTE", label: "personal con matrícula profesional vigente" },
    { text: "RETIE", label: "procesos conforme a la norma" },
  ],

  nav,

  social: [
    { label: "LinkedIn", href: "https://www.linkedin.com/", pending: true },
    { label: "Instagram", href: "https://www.instagram.com/", pending: true },
    { label: "Facebook", href: "https://www.facebook.com/", pending: true },
  ],
};

export type Site = SiteSettings;
