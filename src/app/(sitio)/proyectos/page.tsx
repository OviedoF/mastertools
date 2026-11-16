import type { Metadata } from "next";
import { getProjects } from "@/data/content";
import { breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageHero } from "@/components/shared/PageHero";
import { ClosingCta } from "@/components/shared/ClosingCta";
import { ProjectsList } from "@/components/projects/ProjectsList";

export const metadata: Metadata = {
  title: "Proyectos de ingeniería eléctrica",
  description:
    "Casos reales de medida Nivel II, pruebas de transformadores, certificación solar y emergencias eléctricas en el Caribe colombiano.",
  alternates: { canonical: "/proyectos" },
  keywords: ["proyectos ingeniería eléctrica Caribe"],
};

const crumbs = [
  { name: "Inicio", href: "/" },
  { name: "Proyectos", href: "/proyectos" },
];

export default async function ProjectsPage() {
  const projects = await getProjects();
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <PageHero
        crumbs={crumbs}
        title="Proyectos ejecutados"
        text="Algunos de los más de 350 trabajos que hemos realizado en el país."
      />
      <section className="bg-white py-12 md:py-16">
        <div className="container-x">
          <ProjectsList projects={projects} />
        </div>
      </section>
      <ClosingCta title="¿Tiene un proyecto parecido?" text="Cuéntenos qué necesita y le respondemos con una propuesta técnica." />
    </>
  );
}
