import { defineArrayMember, defineField, defineType } from "sanity";

const photo = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: "image",
    options: { hotspot: true },
    fields: [defineField({ name: "alt", title: "Descripción de la foto", type: "string" })],
  });

export const processStep = defineType({
  name: "processStep",
  title: "Paso de la metodología",
  type: "document",
  fields: [
    defineField({ name: "n", title: "Número", type: "number", validation: (r) => r.required().min(1).max(9) }),
    defineField({ name: "title", title: "Título", type: "string", validation: (r) => r.required() }),
    defineField({ name: "text", title: "Texto corto (Inicio)", type: "string", validation: (r) => r.required() }),
    defineField({ name: "detail", title: "Detalle (Nosotros)", type: "text", rows: 2 }),
    defineField({
      name: "icon",
      title: "Ícono",
      type: "string",
      options: {
        list: [
          { title: "Lupa con check (diagnóstico)", value: "search-check" },
          { title: "Lista (planeación)", value: "clipboard-list" },
          { title: "Casco (ejecución)", value: "hard-hat" },
          { title: "Medidor (pruebas)", value: "gauge" },
          { title: "Documento con check (entrega)", value: "file-check" },
          { title: "Salvavidas (soporte)", value: "life-buoy" },
        ],
      },
    }),
  ],
  orderings: [{ title: "Número", name: "n", by: [{ field: "n", direction: "asc" }] }],
  preview: { select: { n: "n", title: "title", subtitle: "text" }, prepare: ({ n, title, subtitle }) => ({ title: `${n}. ${title}`, subtitle }) },
});

export const homePage = defineType({
  name: "homePage",
  title: "Inicio",
  type: "document",
  groups: [
    { name: "portada", title: "Portada", default: true },
    { name: "bloques", title: "Bloques" },
    { name: "destacado", title: "Servicio destacado" },
  ],
  fields: [
    defineField({ name: "heroEyebrow", title: "Antetítulo", type: "string", group: "portada" }),
    defineField({ name: "heroTitle", title: "Título (H1)", type: "string", group: "portada", validation: (r) => r.required() }),
    defineField({ name: "heroSubtitle", title: "Subtítulo", type: "text", rows: 3, group: "portada" }),
    photo("heroPhoto", "Foto de portada"),
    defineField({ name: "heroCaption", title: "Pie de foto", type: "string", group: "portada" }),
    defineField({ name: "heroCaptionNote", title: "Pie de foto, segunda línea", type: "string", group: "portada" }),
    defineField({ name: "trust", title: "Respaldos cortos (debajo de los botones)", type: "array", of: [{ type: "string" }], group: "portada" }),

    defineField({ name: "servicesTitle", title: "Servicios: título", type: "string", group: "bloques" }),
    defineField({ name: "servicesText", title: "Servicios: texto", type: "text", rows: 2, group: "bloques" }),
    defineField({ name: "processTitle", title: "Metodología: título", type: "string", group: "bloques" }),
    defineField({ name: "processText", title: "Metodología: texto", type: "text", rows: 2, group: "bloques" }),
    defineField({ name: "projectsTitle", title: "Proyectos: título", type: "string", group: "bloques" }),
    defineField({ name: "projectsText", title: "Proyectos: texto", type: "text", rows: 2, group: "bloques" }),
    defineField({ name: "coverageTitle", title: "Cobertura: título", type: "string", group: "bloques" }),
    defineField({ name: "coverageText", title: "Cobertura: texto", type: "text", rows: 2, group: "bloques" }),
    defineField({ name: "emergencyTitle", title: "Franja de emergencia: título", type: "string", group: "bloques" }),
    defineField({ name: "emergencyText", title: "Franja de emergencia: texto", type: "text", rows: 2, group: "bloques" }),
    defineField({ name: "closingTitle", title: "Cierre: título", type: "string", group: "bloques" }),
    defineField({ name: "closingText", title: "Cierre: texto", type: "text", rows: 2, group: "bloques" }),

    defineField({ name: "featuredEyebrow", title: "Antetítulo", type: "string", group: "destacado" }),
    defineField({ name: "featuredTitle", title: "Título", type: "string", group: "destacado" }),
    defineField({ name: "featuredText", title: "Texto", type: "text", rows: 3, group: "destacado" }),
    defineField({ name: "featuredPoints", title: "Puntos", type: "array", of: [{ type: "string" }], group: "destacado" }),
    defineField({ name: "featuredService", title: "Servicio enlazado", type: "reference", to: [{ type: "service" }], group: "destacado" }),
    photo("featuredPhoto", "Foto del destacado"),
  ],
  preview: { prepare: () => ({ title: "Inicio" }) },
});

export const aboutPage = defineType({
  name: "aboutPage",
  title: "Nosotros",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Título (H1)", type: "string", initialValue: "Somos Master Tools" }),
    defineField({ name: "intro", title: "Quiénes somos", type: "text", rows: 5 }),
    photo("photo", "Foto de portada"),
    defineField({ name: "mission", title: "Misión", type: "text", rows: 3 }),
    defineField({ name: "vision", title: "Visión", type: "text", rows: 4 }),
    defineField({ name: "teamText", title: "Equipo: texto", type: "text", rows: 3 }),
    defineField({
      name: "team",
      title: "Integrantes del equipo",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "name", title: "Nombre", type: "string" }),
            defineField({ name: "role", title: "Cargo", type: "string" }),
            photo("photo", "Foto"),
          ],
          preview: { select: { title: "name", subtitle: "role", media: "photo" } },
        }),
      ],
    }),
    defineField({ name: "equipmentText", title: "Instrumentación: texto", type: "text", rows: 3 }),
    defineField({ name: "equipmentList", title: "Lista de equipos", type: "array", of: [{ type: "string" }] }),
    defineField({ name: "photos", title: "Fotos del equipo y los equipos", type: "array", of: [defineArrayMember({ type: "image", options: { hotspot: true }, fields: [defineField({ name: "alt", title: "Descripción", type: "string" })] })] }),
    defineField({
      name: "values",
      title: "Valores",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "title", title: "Valor", type: "string" }),
            defineField({ name: "text", title: "Qué significa", type: "text", rows: 2 }),
          ],
          preview: { select: { title: "title", subtitle: "text" } },
        }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Nosotros" }) },
});

export const legalPage = defineType({
  name: "legalPage",
  title: "Política de datos",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Título", type: "string", initialValue: "Política de tratamiento de datos personales" }),
    defineField({ name: "intro", title: "Introducción", type: "text", rows: 2 }),
    defineField({ name: "approved", title: "Revisada y aprobada por Master Tools", type: "boolean", initialValue: false }),
    defineField({
      name: "sections",
      title: "Secciones",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "heading", title: "Título", type: "string" }),
            defineField({ name: "body", title: "Texto", type: "text", rows: 5 }),
          ],
          preview: { select: { title: "heading" } },
        }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Política de datos" }) },
});
