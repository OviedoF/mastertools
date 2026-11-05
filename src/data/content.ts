import "server-only";
import { isSanityConfigured } from "@/sanity/env";
import { sanityFetch } from "@/sanity/live";
import { photoFrom, type SanityPhoto } from "@/sanity/image";
import {
  aboutPageQuery,
  homePageQuery,
  legalPageQuery,
  processStepsQuery,
  projectsQuery,
  servicesQuery,
  siteSettingsQuery,
} from "@/sanity/queries";
import { site as staticSite, type SiteSettings, type Stat } from "@/content/site";
import { services as staticServices, type Service } from "@/content/services";
import { projects as staticProjects, type Project } from "@/content/projects";
import { processSteps as staticSteps, type ProcessStep } from "@/content/process";
import {
  aboutContent,
  homeContent,
  legalContent,
  type AboutContent,
  type HomeContent,
  type LegalContent,
} from "@/content/pages";
import { waMessages } from "@/lib/links";
import type { IconKey } from "@/components/ui/icon-map";

/**
 * Fachada de contenido. Cada función devuelve el mismo tipo que el contenido
 * estático de src/content; si hay CMS, lo lee de Sanity y rellena con el
 * respaldo lo que falte. Así las páginas no saben de dónde viene el dato.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
type Row = Record<string, any>;

/**
 * `published: true` evita leer cookies de borrador: obligatorio donde no hay
 * pedido HTTP (generateStaticParams, sitemap) y útil para el build.
 */
export type FetchOpts = { published?: boolean };
async function fetchQ(query: string, opts?: FetchOpts): Promise<unknown> {
  if (opts?.published) {
    const { data } = await sanityFetch({ query, perspective: "published", stega: false });
    return data;
  }
  const { data } = await sanityFetch({ query });
  return data;
}

const str = (v: unknown, fallback = "") => (typeof v === "string" && v.trim() ? v : fallback);
const list = (v: unknown, fallback: string[] = []) => (Array.isArray(v) && v.length ? v.filter((x) => typeof x === "string") : fallback);

export async function getSettings(): Promise<SiteSettings> {
  if (!isSanityConfigured) return staticSite;
  const { data } = await sanityFetch({ query: siteSettingsQuery });
  const d = data as Row | null;
  if (!d) return staticSite;
  const email = str(d.email);
  const stats: Stat[] = Array.isArray(d.stats) && d.stats.length
    ? d.stats.map((s: Row) =>
        typeof s.value === "number"
          ? { value: s.value, prefix: str(s.prefix) || undefined, label: str(s.label) }
          : { text: str(s.text), label: str(s.label) },
      )
    : staticSite.stats;
  return {
    ...staticSite,
    name: str(d.name, staticSite.name),
    legalName: str(d.legalName, staticSite.legalName),
    slogan: str(d.slogan, staticSite.slogan),
    summary: str(d.summary, staticSite.summary),
    email: email || staticSite.email,
    nit: str(d.nit) ? `NIT ${d.nit}` : staticSite.nit,
    responseTime: str(d.responseTime, staticSite.responseTime),
    officeHours: str(d.officeHours, staticSite.officeHours),
    address: str(d.address, staticSite.address),
    city: str(d.city, staticSite.city),
    careersEmail: str(d.careersEmail, staticSite.careersEmail),
    pending: {
      nit: !str(d.nit),
      email: !email,
      responseTime: !str(d.responseTime),
      officeHours: !str(d.officeHours),
      address: !str(d.address),
      city: !str(d.city),
      careersEmail: !str(d.careersEmail),
    },
    emergencyDepartments: list(d.emergencyDepartments, staticSite.emergencyDepartments),
    allDepartments: list(d.allDepartments, staticSite.allDepartments),
    cities: list(d.cities, staticSite.cities),
    stats,
    social: Array.isArray(d.social) && d.social.length
      ? d.social.map((s: Row) => ({ label: str(s.label), href: str(s.href), pending: !str(s.href) }))
      : staticSite.social,
  };
}

function mapService(d: Row): Service {
  const base = staticServices.find((s) => s.slug === d.slug);
  const fallbackPhoto = base?.photo ?? { src: "/fotos/hero-liniero-canasta.jpg", alt: "" };
  const lineName = str(d.lineName, base?.lineName ?? d.shortName);
  const slug = str(d.slug);
  return {
    slug,
    title: str(d.title, base?.title ?? ""),
    shortName: str(d.shortName, base?.shortName ?? ""),
    lineName,
    icon: (str(d.icon, base?.icon ?? "zap") as IconKey),
    cardText: str(d.cardText, base?.cardText ?? ""),
    intro: str(d.intro, base?.intro ?? ""),
    includes: Array.isArray(d.includes) && d.includes.length
      ? d.includes.map((it: Row) => ({ text: str(it.text), pending: !!it.pending }))
      : (base?.includes ?? []),
    forWho: str(d.forWho, base?.forWho ?? ""),
    equipment: str(d.equipment) || base?.equipment,
    norms: str(d.norms) || base?.norms,
    caseStudy: d.caseStudy && str(d.caseStudy.text) ? { place: str(d.caseStudy.place), text: str(d.caseStudy.text) } : base?.caseStudy,
    faqs: Array.isArray(d.faqs) && d.faqs.length
      ? d.faqs.map((f: Row) => ({ q: str(f.q), a: str(f.a), pending: !!f.pending }))
      : (base?.faqs ?? []),
    seo: {
      title: str(d.seoTitle, base?.seo.title ?? str(d.title)),
      description: str(d.seoDescription, base?.seo.description ?? ""),
      keywords: list(d.keywords, base?.seo.keywords ?? []),
    },
    photo: photoFrom(d.photo as SanityPhoto, fallbackPhoto),
    featured: !!d.featured,
    whatsapp:
      slug === "emergencias"
        ? waMessages.emergency
        : slug === "medida-nivel-ii-cambio-de-comercializador"
          ? waMessages.medida
          : waMessages.service(lineName),
    pendingNotes: list(d.pendingNotes, base?.pendingNotes ?? []),
  };
}

export async function getServices(opts?: FetchOpts): Promise<Service[]> {
  if (!isSanityConfigured) return staticServices;
  const rows = (await fetchQ(servicesQuery, opts)) as Row[] | null;
  if (!rows?.length) return staticServices;
  return rows.map(mapService);
}

/** Las ocho líneas con página bajo /servicios/ (Emergencias tiene ruta propia). */
export async function getServiceLines(opts?: FetchOpts) {
  return (await getServices(opts)).filter((s) => s.slug !== "emergencias");
}
export async function getService(slug: string, opts?: FetchOpts) {
  return (await getServiceLines(opts)).find((s) => s.slug === slug);
}
export async function getEmergencyService() {
  const all = await getServices();
  return all.find((s) => s.slug === "emergencias") ?? staticServices.find((s) => s.slug === "emergencias")!;
}

function mapProject(d: Row): Project {
  const base = staticProjects.find((p) => p.slug === d.slug);
  const fallbackPhoto = base?.photo ?? { src: "/fotos/canasta-arbol.jpg", alt: "" };
  return {
    slug: str(d.slug),
    title: str(d.title, base?.title ?? ""),
    city: str(d.city, base?.city ?? ""),
    department: str(d.department, base?.department ?? ""),
    serviceSlug: str(d.serviceSlug, base?.serviceSlug ?? ""),
    serviceLabel: str(d.serviceLabel, base?.serviceLabel ?? ""),
    clientType: str(d.clientType) || undefined,
    year: typeof d.year === "number" ? d.year : undefined,
    summary: str(d.summary, base?.summary ?? ""),
    challenge: str(d.challenge) || undefined,
    work: str(d.work) || undefined,
    result: str(d.result) || undefined,
    photo: photoFrom(d.photo as SanityPhoto, fallbackPhoto),
    photoIllustrative: !!d.photoIllustrative,
    gallery: Array.isArray(d.gallery)
      ? d.gallery.filter((g: Row) => g?.asset).map((g: Row) => photoFrom(g as SanityPhoto, { src: "", alt: "" }, 1600))
      : [],
    pending: list(d.pending, base?.pending ?? []),
  };
}

export async function getProjects(opts?: FetchOpts): Promise<Project[]> {
  if (!isSanityConfigured) return staticProjects;
  const rows = (await fetchQ(projectsQuery, opts)) as Row[] | null;
  if (!rows?.length) return staticProjects;
  return rows.map(mapProject);
}
export async function getProject(slug: string, opts?: FetchOpts) {
  return (await getProjects(opts)).find((p) => p.slug === slug);
}

export async function getProcessSteps(): Promise<ProcessStep[]> {
  if (!isSanityConfigured) return staticSteps;
  const { data } = await sanityFetch({ query: processStepsQuery });
  const rows = data as Row[] | null;
  if (!rows?.length) return staticSteps;
  return rows.map((d, i) => {
    const base = staticSteps[i];
    return {
      n: typeof d.n === "number" ? d.n : i + 1,
      title: str(d.title, base?.title ?? ""),
      text: str(d.text, base?.text ?? ""),
      detail: str(d.detail, base?.detail ?? ""),
      icon: str(d.icon, base?.icon ?? "gauge") as IconKey,
    };
  });
}

export async function getHome(): Promise<HomeContent> {
  if (!isSanityConfigured) return homeContent;
  const { data } = await sanityFetch({ query: homePageQuery });
  const d = data as Row | null;
  if (!d) return homeContent;
  const h = homeContent;
  const out: HomeContent = { ...h };
  for (const k of Object.keys(h) as (keyof HomeContent)[]) {
    const v = d[k];
    if (typeof h[k] === "string" && typeof v === "string" && v.trim()) (out as Row)[k] = v;
    if (Array.isArray(h[k]) && Array.isArray(v) && v.length) (out as Row)[k] = v;
  }
  out.heroPhoto = photoFrom(d.heroPhoto as SanityPhoto, h.heroPhoto);
  out.featuredPhoto = photoFrom(d.featuredPhoto as SanityPhoto, h.featuredPhoto);
  out.featuredServiceSlug = str(d.featuredServiceSlug, h.featuredServiceSlug);
  return out;
}

export async function getAbout(): Promise<AboutContent> {
  if (!isSanityConfigured) return aboutContent;
  const { data } = await sanityFetch({ query: aboutPageQuery });
  const d = data as Row | null;
  if (!d) return aboutContent;
  const a = aboutContent;
  return {
    title: str(d.title, a.title),
    intro: str(d.intro, a.intro),
    photo: photoFrom(d.photo as SanityPhoto, a.photo),
    mission: str(d.mission, a.mission),
    vision: str(d.vision, a.vision),
    teamText: str(d.teamText, a.teamText),
    team: Array.isArray(d.team)
      ? d.team.map((m: Row) => ({ name: str(m.name), role: str(m.role), photo: m.photo?.asset ? photoFrom(m.photo as SanityPhoto, { src: "", alt: str(m.name) }, 800) : undefined }))
      : a.team,
    equipmentText: str(d.equipmentText, a.equipmentText),
    equipmentList: list(d.equipmentList, a.equipmentList),
    photos: Array.isArray(d.photos) && d.photos.length
      ? d.photos.filter((g: Row) => g?.asset).map((g: Row) => photoFrom(g as SanityPhoto, { src: "", alt: "" }, 1200))
      : a.photos,
    values: Array.isArray(d.values) && d.values.length
      ? d.values.map((v: Row) => ({ title: str(v.title), text: str(v.text) }))
      : a.values,
  };
}

export async function getLegal(): Promise<LegalContent> {
  if (!isSanityConfigured) return legalContent;
  const { data } = await sanityFetch({ query: legalPageQuery });
  const d = data as Row | null;
  if (!d) return legalContent;
  return {
    title: str(d.title, legalContent.title),
    intro: str(d.intro, legalContent.intro),
    approved: !!d.approved,
    sections: Array.isArray(d.sections) && d.sections.length
      ? d.sections.map((s: Row) => ({ heading: str(s.heading), body: str(s.body) }))
      : legalContent.sections,
  };
}
