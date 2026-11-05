import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { getProjects, getServiceLines } from "@/data/content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  /** Fecha de la última revisión de contenidos. Se actualiza al publicar cambios. */
  const now = new Date("2026-11-04");
  const base = site.url;
  const [serviceLines, projects] = await Promise.all([
    getServiceLines({ published: true }),
    getProjects({ published: true }),
  ]);
  const statics: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/servicios`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/emergencias-electricas`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/proyectos`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/cobertura`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: `${base}/nosotros`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: `${base}/contacto`, lastModified: now, changeFrequency: "yearly", priority: 0.8 },
    { url: `${base}/politica-de-tratamiento-de-datos`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];
  const services: MetadataRoute.Sitemap = serviceLines.map((s) => ({
    url: `${base}/servicios/${s.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: s.featured ? 0.95 : 0.85,
  }));
  const cases: MetadataRoute.Sitemap = projects.map((p) => ({
    url: `${base}/proyectos/${p.slug}`,
    lastModified: now,
    changeFrequency: "yearly",
    priority: 0.5,
  }));
  return [...statics, ...services, ...cases];
}
