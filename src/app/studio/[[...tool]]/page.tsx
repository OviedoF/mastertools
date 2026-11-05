import { NextStudio } from "next-sanity/studio";
import { isSanityConfigured } from "@/sanity/env";
import config from "../../../../sanity.config";

export { metadata, viewport } from "next-sanity/studio";

// Sin `force-static`: con la ruta comodín, Next intentaba generar rutas
// estáticas en un proceso aparte que cargaba todo el Studio y se caía.

/** Panel de edición de Master Tools, embebido en el sitio. */
export default function StudioPage() {
  if (!isSanityConfigured) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center">
        <div className="max-w-md">
          <h1 className="h2 text-noche">Panel de edición no configurado</h1>
          <p className="lead mt-4">
            Falta el ID del proyecto de Sanity. Copie <code>.env.example</code> a{" "}
            <code>.env.local</code>, complete <code>NEXT_PUBLIC_SANITY_PROJECT_ID</code> y
            reinicie el servidor.
          </p>
        </div>
      </div>
    );
  }
  return <NextStudio config={config} />;
}
