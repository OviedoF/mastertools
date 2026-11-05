import { defineArrayMember, defineField, defineType } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Datos generales",
  type: "document",
  groups: [
    { name: "empresa", title: "Empresa", default: true },
    { name: "contacto", title: "Contacto" },
    { name: "cobertura", title: "Cobertura" },
    { name: "cifras", title: "Cifras" },
  ],
  fields: [
    defineField({ name: "name", title: "Nombre comercial", type: "string", group: "empresa", initialValue: "Master Tools", validation: (r) => r.required() }),
    defineField({ name: "legalName", title: "Razón social", type: "string", group: "empresa", initialValue: "Master Tools & Services S.A.S." }),
    defineField({ name: "nit", title: "NIT", type: "string", group: "empresa", description: "Aparece en el pie de página y en la política de datos." }),
    defineField({ name: "slogan", title: "Eslogan", type: "string", group: "empresa" }),
    defineField({ name: "summary", title: "Resumen de una línea", type: "text", rows: 2, group: "empresa", description: "Se usa en el pie de página y en los buscadores." }),
    defineField({ name: "city", title: "Ciudad sede", type: "string", group: "empresa" }),

    defineField({ name: "email", title: "Correo comercial único", type: "string", group: "contacto", validation: (r) => r.email() }),
    defineField({ name: "responseTime", title: "Plazo de respuesta a cotizaciones", type: "string", group: "contacto", description: "Ejemplo: en menos de 24 horas hábiles" }),
    defineField({ name: "officeHours", title: "Horario de oficina", type: "string", group: "contacto" }),
    defineField({ name: "address", title: "Dirección publicable", type: "string", group: "contacto" }),
    defineField({ name: "careersEmail", title: "Correo para hojas de vida", type: "string", group: "contacto" }),
    defineField({
      name: "social",
      title: "Redes sociales",
      type: "array",
      group: "contacto",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "label", title: "Red", type: "string" }),
            defineField({ name: "href", title: "Enlace", type: "url" }),
          ],
          preview: { select: { title: "label", subtitle: "href" } },
        }),
      ],
    }),

    defineField({ name: "emergencyDepartments", title: "Departamentos con atención de emergencias", type: "array", of: [{ type: "string" }], group: "cobertura" }),
    defineField({ name: "allDepartments", title: "Departamentos con trabajos ejecutados", type: "array", of: [{ type: "string" }], group: "cobertura" }),
    defineField({ name: "cities", title: "Ciudades atendidas", type: "array", of: [{ type: "string" }], group: "cobertura" }),

    defineField({
      name: "stats",
      title: "Respaldo en cifras",
      type: "array",
      group: "cifras",
      description: "Cuatro cifras para Inicio. Use número o texto, no los dos.",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "value", title: "Número", type: "number" }),
            defineField({ name: "prefix", title: "Prefijo (por ejemplo +)", type: "string" }),
            defineField({ name: "text", title: "Texto en lugar de número (CONTE, RETIE)", type: "string" }),
            defineField({ name: "label", title: "Etiqueta", type: "string", validation: (r) => r.required() }),
          ],
          preview: {
            select: { value: "value", prefix: "prefix", text: "text", label: "label" },
            prepare: ({ value, prefix, text, label }) => ({ title: text ?? `${prefix ?? ""}${value ?? ""}`, subtitle: label }),
          },
        }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Datos generales" }) },
});
