import { defineQuery } from "next-sanity";

const photo = `photo{ asset->{ _id, url }, hotspot, crop, alt }`;

export const siteSettingsQuery = defineQuery(`*[_type == "siteSettings"][0]{
  name, legalName, nit, slogan, summary, city,
  email, responseTime, officeHours, address, careersEmail,
  social[]{ label, href },
  emergencyDepartments, allDepartments, cities,
  stats[]{ value, prefix, text, label }
}`);

export const servicesQuery = defineQuery(`*[_type == "service"] | order(order asc){
  _id, title, shortName, "slug": slug.current, order, icon, featured, cardText, intro, lineName,
  ${photo},
  includes[]{ text, pending }, forWho, equipment, norms,
  caseStudy{ place, text },
  faqs[]{ q, a, pending },
  pendingNotes,
  seoTitle, seoDescription, keywords
}`);

export const projectsQuery = defineQuery(`*[_type == "project"] | order(order asc, year desc){
  _id, title, "slug": slug.current, department,
  "serviceSlug": service->slug.current, serviceLabel, clientType, year,
  summary, challenge, work, result,
  ${photo}, photoIllustrative,
  gallery[]{ asset->{ _id, url }, hotspot, crop, alt },
  pending
}`);

export const processStepsQuery = defineQuery(`*[_type == "processStep"] | order(n asc){
  n, title, text, detail, icon
}`);

export const homePageQuery = defineQuery(`*[_type == "homePage"][0]{
  heroEyebrow, heroTitle, heroSubtitle, "heroPhoto": heroPhoto{ asset->{ _id, url }, hotspot, crop, alt },
  heroCaption, heroCaptionNote, trust,
  servicesTitle, servicesText, processTitle, processText, projectsTitle, projectsText,
  coverageTitle, coverageText, emergencyTitle, emergencyText, closingTitle, closingText,
  featuredEyebrow, featuredTitle, featuredText, featuredPoints,
  "featuredServiceSlug": featuredService->slug.current,
  "featuredPhoto": featuredPhoto{ asset->{ _id, url }, hotspot, crop, alt }
}`);

export const aboutPageQuery = defineQuery(`*[_type == "aboutPage"][0]{
  title, intro, ${photo}, mission, vision, teamText,
  team[]{ name, role, photo{ asset->{ _id, url }, hotspot, crop, alt } },
  equipmentText, equipmentList,
  photos[]{ asset->{ _id, url }, hotspot, crop, alt },
  values[]{ title, text }
}`);

export const legalPageQuery = defineQuery(`*[_type == "legalPage"][0]{
  title, intro, approved, sections[]{ heading, body }
}`);
