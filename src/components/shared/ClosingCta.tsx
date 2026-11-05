import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/Icons";
import { Reveal } from "@/components/motion/Reveal";
import { Orbit } from "@/components/ui/Orbit";

/** Cierre (Inicio, bloque 9). Manta aparece aquí, en la zona de contacto. */
export function ClosingCta({
  title = "Hablemos de su proyecto",
  text = "Cuéntenos qué necesita y le respondemos con una propuesta técnica.",
  whatsappHref,
}: {
  title?: string;
  text?: string;
  whatsappHref?: string;
}) {
  return (
    <section className="bg-white py-16 md:py-24">
      <Reveal className="container-x">
        <div className="relative overflow-hidden rounded-card bg-claro/50 ring-1 ring-master/20">
          <Orbit className="absolute -top-40 -left-32 w-[640px] text-master/15" draw={false} />
          <div className="relative grid items-center gap-8 p-8 md:grid-cols-[1fr_auto] md:p-12 lg:p-14">
            <div className="max-w-xl">
              <h2 className="h2 text-noche">{title}</h2>
              <p className="lead mt-4">{text}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href="/contacto" size="lg">
                  Solicitar cotización
                  <ArrowRight className="size-5" aria-hidden="true" />
                </ButtonLink>
                {whatsappHref && (
                  <ButtonLink href={whatsappHref} variant="outline" size="lg">
                    <WhatsAppIcon />
                    Escribir por WhatsApp
                  </ButtonLink>
                )}
              </div>
            </div>
            <div className="relative mx-auto w-[220px] md:w-[280px]">
              <Image
                src="/marca/manta/manta_principal_tablet.png"
                alt="Manta, la mascota de Master Tools, con casco, gafas de seguridad y una tablet"
                width={1400}
                height={1026}
                sizes="280px"
                className="motion-safe:animate-float"
              />
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
