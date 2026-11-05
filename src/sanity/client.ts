import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId, studioUrl } from "./env";

/** Cliente de solo lectura. El token de borradores se agrega en live.ts. */
export const client = createClient({
  projectId: projectId || "placeholder",
  dataset,
  apiVersion,
  useCdn: true,
  stega: { studioUrl },
});
