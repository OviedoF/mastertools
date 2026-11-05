import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { Stats } from "@/components/home/Stats";
import { ServicesGrid } from "@/components/home/ServicesGrid";
import { FeaturedService } from "@/components/home/FeaturedService";
import { Process } from "@/components/home/Process";
import { ProjectsPreview } from "@/components/home/ProjectsPreview";
import { Coverage } from "@/components/home/Coverage";
import { EmergencyBand } from "@/components/shared/EmergencyBand";
import { ClosingCta } from "@/components/shared/ClosingCta";
import { JsonLd } from "@/components/seo/JsonLd";
import { site } from "@/content/site";
import { getHome, getProcessSteps, getProjects, getServices, getSettings } from "@/data/content";

export const metadata: Metadata = {
  title: { absolute: "Master Tools | Ingeniería eléctrica integral en el Caribe" },
  description:
    "Proyectos, transformadores y subestaciones, pruebas TTR y SFRA, medida Nivel II y cambio de comercializador, energía solar, redes de baja y media tensión, mantenimiento y emergencias.",
  alternates: { canonical: "/" },
  keywords: ["ingeniería eléctrica Barranquilla", "empresa de servicios eléctricos Caribe"],
};

export default async function HomePage() {
  const [home, settings, services, projects, steps] = await Promise.all([
    getHome(),
    getSettings(),
    getServices(),
    getProjects(),
    getProcessSteps(),
  ]);
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: site.name,
          url: site.url,
          inLanguage: "es-CO",
          publisher: { "@id": `${site.url}/#organization` },
        }}
      />
      <Hero home={home} />
      <Stats stats={settings.stats} />
      <ServicesGrid services={services} title={home.servicesTitle} text={home.servicesText} />
      <FeaturedService home={home} />
      <Process steps={steps} title={home.processTitle} text={home.processText} />
      <ProjectsPreview projects={projects} title={home.projectsTitle} text={home.projectsText} />
      <Coverage settings={settings} title={home.coverageTitle} text={home.coverageText} />
      <EmergencyBand title={home.emergencyTitle} text={home.emergencyText} />
      <ClosingCta title={home.closingTitle} text={home.closingText} />
    </>
  );
}
