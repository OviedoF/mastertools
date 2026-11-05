import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import { isSanityConfigured } from "@/sanity/env";
import { SanityLive } from "@/sanity/live";

/**
 * Conecta el sitio con el panel de edición:
 * - SanityLive refresca las páginas cuando se publica un cambio.
 * - En modo borrador (abierto desde el Studio) muestra las marcas de edición
 *   sobre textos e imágenes y una barra para salir de la vista previa.
 */
export async function SanityPreview() {
  if (!isSanityConfigured) return null;
  const { isEnabled } = await draftMode();
  return (
    <>
      <SanityLive />
      {isEnabled && (
        <>
          <VisualEditing />
          <div className="fixed inset-x-0 top-0 z-[90] flex items-center justify-center gap-3 bg-alerta px-4 py-1.5 font-display text-xs font-semibold text-noche shadow-md">
            Vista previa de borradores
            <a href="/api/draft-mode/disable" className="rounded-md bg-noche px-2.5 py-1 text-white hover:bg-profundo">
              Salir
            </a>
          </div>
        </>
      )}
    </>
  );
}
