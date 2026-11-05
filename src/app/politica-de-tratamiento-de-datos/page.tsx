import type { Metadata } from "next";
import { getLegal, getSettings } from "@/data/content";
import { PageHero } from "@/components/shared/PageHero";
import { Pending } from "@/components/ui/Pending";

export const metadata: Metadata = {
  title: "Política de tratamiento de datos personales",
  description:
    "Política de tratamiento de datos personales de Master Tools & Services S.A.S., conforme a la Ley 1581 de 2012.",
  alternates: { canonical: "/politica-de-tratamiento-de-datos" },
};

const crumbs = [
  { name: "Inicio", href: "/" },
  { name: "Política de tratamiento de datos", href: "/politica-de-tratamiento-de-datos" },
];

export default async function PrivacyPage() {
  const [legal, site] = await Promise.all([getLegal(), getSettings()]);
  const missing = [
    site.pending.nit && "NIT",
    site.pending.address && "dirección",
    site.pending.email && "correo",
  ].filter(Boolean);
  return (
    <>
      <PageHero crumbs={crumbs} title={legal.title} text={legal.intro} />
      <section className="bg-white py-14 md:py-20">
        <div className="container-x">
          {!legal.approved && (
            <Pending className="mb-10 max-w-3xl">
              Borrador a cargo del desarrollo, con revisión de Master Tools antes de publicar.
              {missing.length > 0 && <> Faltan: {missing.join(", ")}.</>}
            </Pending>
          )}
          <div className="prose-mt grid gap-8">
            {legal.sections.map((s) => (
              <div key={s.heading}>
                <h2 className="h3 text-noche">{s.heading}</h2>
                <p className="mt-2">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
