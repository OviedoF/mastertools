import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { getProjects, getSettings } from "@/data/content";
import { ButtonLink } from "@/components/ui/Button";
import { Pending } from "@/components/ui/Pending";
import { ProjectCard } from "@/components/home/ProjectsPreview";

export const metadata: Metadata = {
  title: "Recibimos su solicitud",
  robots: { index: false, follow: false },
};

/** Confirmación tras enviar el formulario. Sirve para medir conversiones. */
export default async function ThanksPage() {
  const [site, projects] = await Promise.all([getSettings(), getProjects()]);
  return (
    <>
      <section className="bg-niebla">
        <div className="container-x grid items-center gap-10 py-16 md:py-24 lg:grid-cols-[1fr_320px]">
          <div className="max-w-2xl">
            <span className="inline-flex size-14 items-center justify-center rounded-full bg-master/20 text-profundo">
              <CheckCircle2 className="size-8" aria-hidden="true" />
            </span>
            <h1 className="h1 mt-6 text-noche">Recibimos su solicitud</h1>
            <p className="lead mt-5">
              Gracias por escribirnos. Un ingeniero de Master Tools revisará su
              solicitud y se comunicará con usted{" "}
              {site.pending.responseTime ? <Pending inline>{site.responseTime}</Pending> : site.responseTime}. También le
              enviamos una confirmación a su correo.
            </p>
            <p className="mt-4 text-[0.9375rem] text-noche/70">
              Si se trata de una emergencia, llámenos directamente al{" "}
              <a href={`tel:${site.phone.tel}`} className="font-semibold text-noche">
                {site.phone.display}
              </a>
              .
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/proyectos">
                Ver proyectos
                <ArrowRight className="size-5" aria-hidden="true" />
              </ButtonLink>
              <ButtonLink href="/" variant="outline">
                Volver al inicio
              </ButtonLink>
            </div>
          </div>
          <Image
            src="/marca/manta/manta_aprobado.png"
            alt="Manta levanta el pulgar: solicitud recibida"
            width={1000}
            height={750}
            sizes="320px"
            className="mx-auto w-[260px] motion-safe:animate-float lg:w-[320px]"
          />
        </div>
      </section>
      <section className="bg-white py-16">
        <div className="container-x">
          <h2 className="h2 text-noche">Mientras tanto, algunos de nuestros proyectos</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.slice(0, 3).map((p) => (
              <ProjectCard key={p.slug} p={p} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
