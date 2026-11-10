/**
 * Migra el contenido estático (src/content) al dataset de Sanity, con fotos.
 * Es idempotente: cada documento tiene un _id fijo y se reemplaza entero.
 *
 * Uso: pnpm seed:sanity
 * Requiere en .env.local: NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET
 * y SANITY_API_WRITE_TOKEN (token con rol Editor, solo para este script).
 */
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@sanity/client";
import { site } from "../src/content/site";
import { services } from "../src/content/services";
import { projects } from "../src/content/projects";
import { processSteps } from "../src/content/process";
import { aboutContent, homeContent, legalContent } from "../src/content/pages";

// .env.local sin dependencias extra
const envPath = path.resolve(".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || !token) {
  console.error("Faltan NEXT_PUBLIC_SANITY_PROJECT_ID o SANITY_API_WRITE_TOKEN en .env.local");
  process.exit(1);
}

const client = createClient({ projectId, dataset, token, apiVersion: "2026-11-01", useCdn: false });

const assetCache = new Map<string, string>();
async function imageRef(src: string | undefined, alt?: string) {
  if (!src) return undefined;
  let id = assetCache.get(src);
  if (!id) {
    const file = path.join("public", src);
    if (!fs.existsSync(file)) {
      console.warn("  (foto no encontrada, se omite)", src);
      return undefined;
    }
    const asset = await client.assets.upload("image", fs.createReadStream(file), {
      filename: path.basename(file),
      source: { id: src, name: "seed" },
    });
    id = asset._id;
    assetCache.set(src, id);
    console.log("  foto subida", src);
  }
  return { _type: "image", asset: { _type: "reference", _ref: id }, alt };
}
const slug = (current: string) => ({ _type: "slug", current });
const key = (i: number) => ({ _key: `k${i}` });

async function main() {
  console.log(`Migrando a ${projectId}/${dataset}…`);
  const docs: Record<string, unknown>[] = [];

  docs.push({
    _id: "siteSettings",
    _type: "siteSettings",
    name: site.name,
    legalName: site.legalName,
    slogan: site.slogan,
    summary: site.summary,
    // Lo confirmado por Master Tools se carga; lo pendiente queda vacío para que lo complete en el panel.
    nit: site.pending.nit ? undefined : site.nit.replace(/^NIT\s*/i, ""),
    responseTime: site.pending.responseTime ? undefined : site.responseTime,
    officeHours: site.pending.officeHours ? undefined : site.officeHours,
    email: site.pending.email ? undefined : site.email,
    address: site.pending.address ? undefined : site.address,
    city: site.pending.city ? undefined : site.city,
    careersEmail: site.pending.careersEmail ? undefined : site.careersEmail,
    social: site.social.map((s, i) => ({ ...key(i), label: s.label, href: s.pending ? undefined : s.href })),
    emergencyDepartments: [...site.emergencyDepartments],
    allDepartments: [...site.allDepartments],
    cities: [...site.cities],
    stats: site.stats.map((s, i) => ({ ...key(i), ...("value" in s ? { value: s.value, prefix: s.prefix } : { text: s.text }), label: s.label })),
  });

  for (const [i, s] of services.entries()) {
    docs.push({
      _id: `service-${s.slug}`,
      _type: "service",
      title: s.title,
      shortName: s.shortName,
      slug: slug(s.slug),
      order: i + 1,
      icon: s.icon,
      featured: !!s.featured,
      cardText: s.cardText,
      intro: s.intro,
      lineName: s.lineName,
      photo: await imageRef(s.photo.src, s.photo.alt),
      includes: s.includes.map((it, j) => ({ ...key(j), text: it.text, pending: !!it.pending })),
      forWho: s.forWho,
      equipment: s.equipment,
      norms: s.norms,
      caseStudy: s.caseStudy,
      faqs: s.faqs.map((f, j) => ({ ...key(j), q: f.q, a: f.a, pending: !!f.pending })),
      pendingNotes: s.pendingNotes ?? [],
      seoTitle: s.seo.title,
      seoDescription: s.seo.description,
      keywords: s.seo.keywords,
    });
  }

  for (const [i, p] of projects.entries()) {
    docs.push({
      _id: `project-${p.slug}`,
      _type: "project",
      title: p.title,
      slug: slug(p.slug),
      order: i + 1,
      department: p.department,
      service: { _type: "reference", _ref: `service-${p.serviceSlug}` },
      serviceLabel: p.serviceLabel,
      clientType: p.clientType,
      year: p.year,
      summary: p.summary,
      challenge: p.challenge,
      work: p.work,
      result: p.result,
      photo: await imageRef(p.photo.src, p.photo.alt),
      photoIllustrative: !!p.photoIllustrative,
      gallery: (await Promise.all((p.gallery ?? []).map((g) => imageRef(g.src, g.alt)))).filter(Boolean).map((img, j) => ({ ...key(j), ...img })),
      pending: p.pending,
    });
  }

  for (const st of processSteps) {
    docs.push({ _id: `step-${st.n}`, _type: "processStep", n: st.n, title: st.title, text: st.text, detail: st.detail, icon: st.icon });
  }

  const h = homeContent;
  docs.push({
    _id: "homePage",
    _type: "homePage",
    heroEyebrow: h.heroEyebrow,
    heroTitle: h.heroTitle,
    heroSubtitle: h.heroSubtitle,
    heroPhoto: await imageRef(h.heroPhoto.src, h.heroPhoto.alt),
    heroCaption: h.heroCaption,
    heroCaptionNote: h.heroCaptionNote,
    trust: h.trust,
    servicesTitle: h.servicesTitle,
    servicesText: h.servicesText,
    processTitle: h.processTitle,
    processText: h.processText,
    projectsTitle: h.projectsTitle,
    projectsText: h.projectsText,
    coverageTitle: h.coverageTitle,
    coverageText: h.coverageText,
    emergencyTitle: h.emergencyTitle,
    emergencyText: h.emergencyText,
    closingTitle: h.closingTitle,
    closingText: h.closingText,
    featuredEyebrow: h.featuredEyebrow,
    featuredTitle: h.featuredTitle,
    featuredText: h.featuredText,
    featuredPoints: h.featuredPoints,
    featuredService: { _type: "reference", _ref: `service-${h.featuredServiceSlug}` },
    featuredPhoto: await imageRef(h.featuredPhoto.src, h.featuredPhoto.alt),
  });

  const a = aboutContent;
  docs.push({
    _id: "aboutPage",
    _type: "aboutPage",
    title: a.title,
    intro: a.intro,
    photo: await imageRef(a.photo.src, a.photo.alt),
    mission: a.mission,
    vision: a.vision,
    teamText: a.teamText,
    team: [],
    equipmentText: a.equipmentText,
    equipmentList: a.equipmentList,
    photos: (await Promise.all(a.photos.map((p) => imageRef(p.src, p.alt)))).filter(Boolean).map((img, i) => ({ ...key(i), ...img })),
    values: a.values.map((v, i) => ({ ...key(i), ...v })),
  });

  docs.push({
    _id: "legalPage",
    _type: "legalPage",
    title: legalContent.title,
    intro: legalContent.intro,
    approved: false,
    sections: legalContent.sections.map((s, i) => ({ ...key(i), ...s })),
  });

  // Casos de la primera versión (con ciudad), reemplazados por los casos a nivel general.
  const retiredProjects = [
    "project-cambio-de-comercializador-nivel-ii-monteria",
    "project-normalizacion-de-telemedida-cartagena",
    "project-puesta-en-servicio-de-transformador-barranquilla",
    "project-certificacion-ssfv-santa-marta",
    "project-emergencia-en-media-tension-valledupar",
    "project-transformadores-mantenimiento-pruebas-y-tap",
  ];
  let tx = docs.reduce((t, d) => t.createOrReplace(d as never), client.transaction());
  tx = retiredProjects.reduce((t, id) => t.delete(id).delete(`drafts.${id}`), tx);
  await tx.commit();
  console.log(`Listo: ${docs.length} documentos.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
