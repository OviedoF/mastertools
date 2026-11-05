"use client";

/**
 * Configuración del Studio de Sanity, embebido en /studio.
 * El cliente entra con su cuenta, edita y publica; el sitio se regenera solo.
 */
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { presentationTool } from "sanity/presentation";
import { visionTool } from "@sanity/vision";
import { apiVersion, dataset, projectId } from "@/sanity/env";
import { schemaTypes, singletons } from "@/sanity/schemas";
import { structure } from "@/sanity/structure";

export default defineConfig({
  name: "master-tools",
  title: "Master Tools",
  basePath: "/studio",
  projectId,
  dataset,
  schema: {
    types: schemaTypes,
    // Los documentos únicos no se crean desde el botón "Nuevo"
    templates: (templates) => templates.filter((t) => !singletons.includes(t.schemaType as (typeof singletons)[number])),
  },
  document: {
    actions: (actions, { schemaType }) =>
      singletons.includes(schemaType as (typeof singletons)[number])
        ? actions.filter(({ action }) => !["unpublish", "delete", "duplicate"].includes(action ?? ""))
        : actions,
  },
  plugins: [
    structureTool({ structure }),
    presentationTool({
      previewUrl: {
        origin: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
        previewMode: { enable: "/api/draft-mode/enable" },
      },
    }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
});
