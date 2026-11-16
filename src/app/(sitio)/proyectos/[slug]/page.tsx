import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowRight, MapPin } from "lucide-react";
import { serviceHref } from "@/content/services";
import { getProject, getProjects, getServices } from "@/data/content";
import { breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/shared/PageHero";
import { ButtonLink } from "@/components/ui/Button";
import { Pending } from "@/components/ui/Pending";
import { ProjectCard } from "@/components/home/ProjectsPreview";

export async function generateStaticParams() {
  return (await getProjects({ published: true })).map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProject(slug);
  if (!p) return {};
  return {
    title: p.title,
    description: `${p.summary} ${p.department}.`,
    alternates: { canonical: `/proyectos/${p.slug}` },
    openGraph: { images: [{ url: p.photo.src, alt: p.photo.alt }] },
  };
}

const blocks = [
  { key: "challenge", title: "El reto", hint: "Qué necesitaba el cliente o qué problema tenía." },
  { key: "work", title: "Lo que hicimos", hint: "Trabajos y pruebas realizadas, equipos utilizados." },
  { key: "result", title: "Resultado", hint: "Lo que se logró, con datos concretos si los hay." },
] as const;

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const [p, projects, services] = await Promise.all([getProject(slug), getProjects(), getServices()]);
  if (!p) notFound();
  const service = services.find((s) => s.slug === p.serviceSlug);
  const crumbs = [
    { name: "Inicio", href: "/" },
    { name: "Proyectos", href: "/proyectos" },
    { name: p.title, href: `/proyectos/${p.slug}` },
  ];
  const others = projects.filter((x) => x.slug !== p.slug).slice(0, 3);
  const gallery = p.gallery ?? [];

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <section className="relative bg-noche text-white">
        <div className="absolute inset-0">
          <Image src={p.photo.src} alt="" fill priority sizes="100vw" className="object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-t from-noche via-noche/80 to-noche/40" />
        </div>
        <div className="container-x relative py-14 md:py-24">
          <Breadcrumbs items={crumbs.slice(0, 2)} dark />
          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
            <span className="chip chip-claro">{p.serviceLabel}</span>
            <span className="flex items-center gap-1.5 text-white/80">
              <MapPin className="size-4 text-master" aria-hidden="true" />
              {p.department}
            </span>
            {p.year ? <span className="text-white/70">{p.year}</span> : <Pending inline className="border-white/30 bg-white/10 text-white/70">año</Pending>}
          </div>
          <h1 className="h1 mt-4 max-w-3xl text-white">{p.title}</h1>
          <p className="lead mt-4 max-w-2xl text-white/80">{p.summary}</p>
        </div>
      </section>

      <section className="bg-white py-14 md:py-20">
        <div className="container-x grid gap-12 lg:grid-cols-[1fr_320px]">
          <div className="grid gap-10">
            {blocks.map((b) => {
              const text = p[b.key];
              return (
                <div key={b.key}>
                  <h2 className="h2 text-noche">{b.title}</h2>
                  {text ? (
                    <p className="prose-mt mt-4">{text}</p>
                  ) : (
                    <Pending className="mt-4">{b.hint}</Pending>
                  )}
                </div>
              );
            })}
            <div>
              <h2 className="h2 text-noche">Fotos</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {gallery.length > 0 ? (
                  gallery.map((g) => (
                    <div key={g.src} className="relative aspect-[4/3] overflow-hidden rounded-card">
                      <Image src={g.src} alt={g.alt} fill sizes="(min-width: 640px) 50vw, 100vw" className="object-cover" />
                    </div>
                  ))
                ) : (
                  <>
                    <div className="relative aspect-[4/3] overflow-hidden rounded-card">
                      <Image src={p.photo.src} alt={p.photo.alt} fill sizes="(min-width: 640px) 50vw, 100vw" className="object-cover" />
                      {p.photoIllustrative && (
                        <span className="absolute right-3 bottom-3 rounded-md bg-noche/70 px-2 py-0.5 text-[0.6875rem] font-medium text-white">
                          Foto ilustrativa
                        </span>
                      )}
                    </div>
                    <Pending className="flex items-center">Tres a seis fotos reales de la intervención.</Pending>
                  </>
                )}
              </div>
            </div>
          </div>
          <aside className="grid content-start gap-6">
            <div className="card p-6">
              <h2 className="h3 text-noche">Datos rápidos</h2>
              <dl className="mt-4 grid gap-3 text-sm">
                <div className="flex justify-between gap-4"><dt className="text-noche/60">Zona</dt><dd className="font-medium">{p.department}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-noche/60">Servicio</dt><dd className="font-medium">{service?.shortName ?? p.serviceLabel}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-noche/60">Tipo de cliente</dt><dd>{p.clientType ?? <Pending inline>completar</Pending>}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-noche/60">Año</dt><dd>{p.year ?? <Pending inline>completar</Pending>}</dd></div>
              </dl>
              <ButtonLink href={`/contacto?servicio=${p.serviceSlug}`} className="mt-6 w-full">
                Solicitar una cotización similar
                <ArrowRight className="size-5" aria-hidden="true" />
              </ButtonLink>
              {service && (
                <ButtonLink href={serviceHref(service)} variant="ghost" size="sm" className="mt-2 w-full">
                  Ver el servicio
                </ButtonLink>
              )}
            </div>
          </aside>
        </div>
      </section>

      <section className="bg-niebla py-14">
        <div className="container-x">
          <h2 className="h2 text-noche">Otros proyectos</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((o) => (
              <ProjectCard key={o.slug} p={o} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
