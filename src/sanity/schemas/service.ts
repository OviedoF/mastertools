import { defineArrayMember, defineField, defineType } from "sanity";

export const ICON_OPTIONS = [
  { title: "Compás (ingeniería y proyectos)", value: "drafting-compass" },
  { title: "Fábrica (industrial)", value: "factory" },
  { title: "Rayo (potencia, transformadores)", value: "zap" },
  { title: "Onda (pruebas y diagnóstico)", value: "activity" },
  { title: "Medidor (medición)", value: "gauge" },
  { title: "Antena (telemedida)", value: "radio-tower" },
  { title: "Balanza (calibración)", value: "scale" },
  { title: "Encendido (suspensión y reconexión)", value: "power" },
  { title: "Sol (energía solar)", value: "sun" },
  { title: "Poste (redes)", value: "utility-pole" },
  { title: "Llave (mantenimiento)", value: "wrench" },
  { title: "Triángulo de alerta (emergencias)", value: "triangle-alert" },
];

export const service = defineType({
  name: "service",
  title: "Servicio",
  type: "document",
  groups: [
    { name: "contenido", title: "Contenido", default: true },
    { name: "detalle", title: "Detalle" },
    { name: "seo", title: "Buscadores" },
  ],
  fields: [
    defineField({ name: "title", title: "Título de la página (H1)", type: "string", group: "contenido", validation: (r) => r.required() }),
    defineField({ name: "shortName", title: "Nombre corto (menú y tarjetas)", type: "string", group: "contenido", validation: (r) => r.required() }),
    defineField({ name: "slug", title: "Dirección (URL)", type: "slug", group: "contenido", options: { source: "shortName" }, validation: (r) => r.required() }),
    defineField({ name: "order", title: "Orden", type: "number", group: "contenido", description: "1 a 12. Emergencias es la 12." }),
    defineField({ name: "icon", title: "Ícono", type: "string", group: "contenido", options: { list: ICON_OPTIONS, layout: "dropdown" } }),
    defineField({ name: "featured", title: "Destacado en Inicio", type: "boolean", group: "contenido", initialValue: false }),
    defineField({ name: "cardText", title: "Texto de la tarjeta", type: "text", rows: 2, group: "contenido" }),
    defineField({ name: "intro", title: "Introducción", type: "text", rows: 4, group: "contenido" }),
    defineField({
      name: "photo",
      title: "Foto",
      type: "image",
      group: "contenido",
      options: { hotspot: true },
      fields: [defineField({ name: "alt", title: "Descripción de la foto", type: "string" })],
    }),
    defineField({ name: "lineName", title: "Nombre de la línea en el mensaje de WhatsApp", type: "string", group: "contenido", description: "Ejemplo: pruebas, mediciones y diagnóstico eléctrico" }),

    defineField({
      name: "includes",
      title: "Qué incluye",
      type: "array",
      group: "detalle",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "text", title: "Servicio", type: "string", validation: (r) => r.required() }),
            defineField({ name: "pending", title: "Por validar", type: "boolean", initialValue: false }),
          ],
          preview: { select: { title: "text", pending: "pending" }, prepare: ({ title, pending }) => ({ title, subtitle: pending ? "Por validar" : undefined }) },
        }),
      ],
    }),
    defineField({ name: "forWho", title: "Para quién", type: "text", rows: 2, group: "detalle" }),
    defineField({ name: "equipment", title: "Instrumentación", type: "text", rows: 2, group: "detalle" }),
    defineField({ name: "norms", title: "Normas", type: "text", rows: 2, group: "detalle" }),
    defineField({
      name: "caseStudy",
      title: "Caso relacionado",
      type: "object",
      group: "detalle",
      fields: [
        defineField({ name: "place", title: "Ciudad, departamento", type: "string" }),
        defineField({ name: "text", title: "Qué se hizo", type: "string" }),
      ],
    }),
    defineField({
      name: "faqs",
      title: "Preguntas frecuentes",
      type: "array",
      group: "detalle",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "q", title: "Pregunta", type: "string", validation: (r) => r.required() }),
            defineField({ name: "a", title: "Respuesta", type: "text", rows: 3, validation: (r) => r.required() }),
            defineField({ name: "pending", title: "Por validar", type: "boolean", initialValue: false }),
          ],
          preview: { select: { title: "q" } },
        }),
      ],
    }),
    defineField({ name: "pendingNotes", title: "Datos por completar (notas internas)", type: "array", of: [{ type: "string" }], group: "detalle" }),

    defineField({ name: "seoTitle", title: "Título en Google", type: "string", group: "seo", description: "Sin el sufijo '| Master Tools', se agrega solo." }),
    defineField({ name: "seoDescription", title: "Descripción en Google", type: "text", rows: 3, group: "seo", validation: (r) => r.max(160) }),
    defineField({ name: "keywords", title: "Búsquedas objetivo", type: "array", of: [{ type: "string" }], group: "seo", options: { layout: "tags" } }),
  ],
  orderings: [{ title: "Orden", name: "order", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "shortName", subtitle: "title", media: "photo" } },
});
