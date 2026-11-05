import type { SchemaTypeDefinition } from "sanity";
import { siteSettings } from "./siteSettings";
import { service } from "./service";
import { project } from "./project";
import { aboutPage, homePage, legalPage, processStep } from "./pages";

export const schemaTypes: SchemaTypeDefinition[] = [
  siteSettings,
  homePage,
  aboutPage,
  legalPage,
  service,
  project,
  processStep,
];

/** Documentos únicos: una sola instancia, sin "crear nuevo". */
export const singletons = ["siteSettings", "homePage", "aboutPage", "legalPage"] as const;
