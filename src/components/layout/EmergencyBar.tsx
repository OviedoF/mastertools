import { Phone } from "lucide-react";
import { telHref } from "@/lib/links";

/**
 * Botón fijo de emergencia en celular (documento de estructura, 2.2).
 * Llama directo. La burbuja de Manta se ubica por encima para no taparlo.
 */
export function EmergencyBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 md:hidden">
      <a
        href={telHref}
        className="flex min-h-16 items-center justify-center gap-2.5 bg-alerta px-4 pb-[env(safe-area-inset-bottom)] font-display text-base font-bold text-noche shadow-[0_-8px_24px_-12px_rgb(11_31_77/0.35)] active:bg-[#f2b600]"
      >
        <span className="relative inline-flex size-9 items-center justify-center rounded-full bg-noche text-alerta">
          <span className="absolute inset-0 animate-pulse-ring rounded-full bg-noche/60 motion-reduce:hidden" />
          <Phone className="relative size-4" aria-hidden="true" />
        </span>
        Emergencia: llamar ahora
      </a>
    </div>
  );
}
