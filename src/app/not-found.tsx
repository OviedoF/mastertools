import Image from "next/image";
import { Phone } from "lucide-react";
import { site } from "@/content/site";
import { telHref } from "@/lib/links";
import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section className="bg-niebla">
      <div className="container-x grid items-center gap-10 py-20 md:py-28 lg:grid-cols-[1fr_300px]">
        <div className="max-w-xl">
          <p className="eyebrow text-profundo">Error 404</p>
          <h1 className="h1 mt-3 text-noche">No encontramos esta página</h1>
          <p className="lead mt-5">
            Puede que la dirección haya cambiado. Vuelva al inicio o, si tiene
            una emergencia, llámenos al{" "}
            <a href={telHref} className="font-semibold text-noche">
              {site.phone.display}
            </a>
            .
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/">Ir al inicio</ButtonLink>
            <ButtonLink href={telHref} variant="emergency">
              <Phone className="size-5" aria-hidden="true" />
              Llamar ahora
            </ButtonLink>
          </div>
        </div>
        <Image
          src="/marca/manta/manta_pensativo.png"
          alt="Manta, pensativa"
          width={800}
          height={800}
          sizes="300px"
          className="mx-auto w-[220px] lg:w-[300px]"
        />
      </div>
    </section>
  );
}
