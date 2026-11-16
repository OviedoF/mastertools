import type { ReactNode } from "react";
import { getServices, getSettings } from "@/data/content";
import { TopBar } from "@/components/layout/TopBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { EmergencyBar } from "@/components/layout/EmergencyBar";
import { MantaBubble } from "@/components/chat/MantaBubble";
import { TrackClicks } from "@/components/analytics/TrackClicks";
import { SanityPreview } from "@/components/sanity/Preview";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationJsonLd } from "@/lib/seo";
import { serviceHref } from "@/content/services";

/** Encabezado, pie, chat de Manta y analítica del sitio público. El portal no los usa. */
export async function SiteShell({ children }: { children: ReactNode }) {
  const [settings, services] = await Promise.all([getSettings(), getServices()]);
  const navServices = services.map((s) => ({
    slug: s.slug,
    href: serviceHref(s),
    shortName: s.shortName,
    cardText: s.cardText,
    icon: s.icon,
  }));

  return (
    <>
      <JsonLd data={organizationJsonLd(settings)} />
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-profundo focus:shadow-card"
      >
        Ir al contenido
      </a>
      <TopBar settings={settings} />
      <Header services={navServices} />
      <main id="contenido" className="flex-1 pb-20 md:pb-0">
        {children}
      </main>
      <Footer settings={settings} services={navServices} />
      <EmergencyBar />
      <MantaBubble />
      <TrackClicks />
      <SanityPreview />
    </>
  );
}
