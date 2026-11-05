import { defineArrayMember, defineField, defineType } from "sanity";

export const project = defineType({
  name: "project",
  title: "Proyecto (caso)",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Título", type: "string", description: "Servicio + ciudad. Ejemplo: Cambio de comercializador Nivel II en Montería", validation: (r) => r.required() }),
    defineField({ name: "slug", title: "Dirección (URL)", type: "slug", options: { source: "title" }, validation: (r) => r.required() }),
    defineField({ name: "order", title: "Orden", type: "number" }),
    defineField({ name: "city", title: "Ciudad", type: "string", validation: (r) => r.required() }),
    defineField({ name: "department", title: "Departamento", type: "string", validation: (r) => r.required() }),
    defineField({ name: "service", title: "Servicio", type: "reference", to: [{ type: "service" }] }),
    defineField({
      name: "serviceLabel",
      title: "Filtro",
      type: "string",
      options: { list: ["Medida", "Ingeniería", "Solar", "Mantenimiento", "Emergencias"], layout: "radio" },
    }),
    defineField({ name: "clientType", title: "Tipo de cliente", type: "string", description: "Industria, comercio, comercializadora, etc." }),
    defineField({ name: "year", title: "Año", type: "number" }),
    defineField({ name: "summary", title: "Resumen (una línea)", type: "text", rows: 2, validation: (r) => r.required() }),
    defineField({ name: "challenge", title: "El reto", type: "text", rows: 3, description: "Qué necesitaba el cliente o qué problema tenía." }),
    defineField({ name: "work", title: "Lo que hicimos", type: "text", rows: 4, description: "Trabajos y pruebas realizadas, equipos utilizados." }),
    defineField({ name: "result", title: "Resultado", type: "text", rows: 3, description: "Lo que se logró, con datos concretos si los hay." }),
    defineField({
      name: "photo",
      title: "Foto principal",
      type: "image",
      options: { hotspot: true },
      fields: [defineField({ name: "alt", title: "Descripción de la foto", type: "string" })],
    }),
    defineField({ name: "photoIllustrative", title: "La foto es ilustrativa (no es de este caso)", type: "boolean", initialValue: false }),
    defineField({
      name: "gallery",
      title: "Fotos de la intervención",
      type: "array",
      of: [
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [defineField({ name: "alt", title: "Descripción", type: "string" })],
        }),
      ],
    }),
    defineField({ name: "pending", title: "Datos por completar (notas internas)", type: "array", of: [{ type: "string" }] }),
  ],
  orderings: [{ title: "Orden", name: "order", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "title", subtitle: "city", media: "photo" } },
});
