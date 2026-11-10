import type { Metadata } from "next";
import { getServices } from "@/data/content";
import { ServiceCard } from "@/components/home/ServicesGrid";
import { PageHero } from "@/components/shared/PageHero";
import { EmergencyBand } from "@/components/shared/EmergencyBand";
import { ClosingCta } from "@/components/shared/ClosingCta";
import { Reveal } from "@/components/motion/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Servicios de ingeniería eléctrica",
  description:
    "Consultoría y proyectos, transformadores y subestaciones, pruebas y diagnóstico, sistemas de medición y cambio de comercializador, telemedida, calibración, energía solar, redes de baja y media tensión, mantenimiento y emergencias.",
  alternates: { canonical: "/servicios" },
  keywords: ["servicios de ingeniería eléctrica", "empresa de servicios eléctricos industriales"],
};

const crumbs = [
  { name: "Inicio", href: "/" },
  { name: "Servicios", href: "/servicios" },
];

export default async function ServicesIndexPage() {
  const services = await getServices();
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <PageHero
        crumbs={crumbs}
        title="Servicios de ingeniería eléctrica"
        text="Doce líneas de servicio, un solo equipo. Acompañamos a comercializadores de energía, operadores de red, industrias, comercios y proyectos de generación en todo el ciclo de su infraestructura eléctrica, bajo RETIE, NTC 2050 y el Código de Medida (CREG 038), con pautas internacionales IEEE y los reglamentos de cada operador de red."
      />
      <section className="bg-white py-16 md:py-20">
        <Reveal className="container-x grid gap-5 sm:grid-cols-2 lg:grid-cols-3" stagger={0.06} y={32}>
          {services.map((s) => (
            <ServiceCard key={s.slug} s={s} />
          ))}
        </Reveal>
      </section>
      <EmergencyBand />
      <ClosingCta />
    </>
  );
}
