import { Phone, TriangleAlert } from "lucide-react";
import { site } from "@/content/site";
import { homeContent } from "@/content/pages";
import { telHref, waEmergencyHref } from "@/lib/links";
import { ButtonLink } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/Icons";
import { Reveal } from "@/components/motion/Reveal";

/** Franja de emergencia (Inicio, bloque 8; final de cada página de servicio). */
export function EmergencyBand({
  title = homeContent.emergencyTitle,
  text = homeContent.emergencyText,
}: {
  title?: string;
  text?: string;
}) {
  return (
    <section className="bg-noche bg-grid-noche text-white">
      <Reveal className="container-x flex flex-col gap-8 py-14 md:py-16 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-alerta text-noche">
            <TriangleAlert className="size-6" strokeWidth={2} aria-hidden="true" />
          </span>
          <div>
            <h2 className="h2 text-white">{title}</h2>
            <p className="mt-3 max-w-xl text-white/75">{text}</p>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
          <ButtonLink href={telHref} variant="emergency" size="lg">
            <Phone className="size-5" aria-hidden="true" />
            Llamar ahora
            <span className="sr-only">al {site.phone.display}</span>
          </ButtonLink>
          <ButtonLink href={waEmergencyHref} variant="outline-white" size="lg">
            <WhatsAppIcon />
            Escribir por WhatsApp
          </ButtonLink>
        </div>
      </Reveal>
    </section>
  );
}
