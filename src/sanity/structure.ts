import type { StructureResolver } from "sanity/structure";
import { singletons } from "./schemas";

/** Panel lateral del Studio: documentos únicos arriba, listas abajo. */
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Contenido")
    .items([
      S.listItem().title("Datos generales").id("siteSettings").child(S.document().schemaType("siteSettings").documentId("siteSettings")),
      S.listItem().title("Inicio").id("homePage").child(S.document().schemaType("homePage").documentId("homePage")),
      S.listItem().title("Nosotros").id("aboutPage").child(S.document().schemaType("aboutPage").documentId("aboutPage")),
      S.listItem().title("Política de datos").id("legalPage").child(S.document().schemaType("legalPage").documentId("legalPage")),
      S.divider(),
      S.documentTypeListItem("service").title("Servicios"),
      S.documentTypeListItem("project").title("Proyectos"),
      S.documentTypeListItem("processStep").title("Metodología (pasos)"),
      ...S.documentTypeListItems().filter((item) => !["service", "project", "processStep", ...singletons].includes(item.getId() ?? "")),
    ]);
