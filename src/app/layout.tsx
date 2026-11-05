import type { Metadata, Viewport } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
import { site } from "@/content/site";
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

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Master Tools | Ingeniería eléctrica integral en el Caribe",
    template: "%s | Master Tools",
  },
  description:
    "Proyectos, transformadores y subestaciones, pruebas TTR y SFRA, medida Nivel II y cambio de comercializador, energía solar, redes de baja y media tensión, mantenimiento y emergencias.",
  applicationName: site.name,
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: site.name,
  },
  twitter: { card: "summary_large_image" },
  icons: {
    icon: [
      { url: "/marca/favicon.svg", type: "image/svg+xml" },
      { url: "/marca/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/marca/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/marca/apple-touch-icon-180.png",
  },
  formatDetection: { telephone: true },
};

export const viewport: Viewport = {
  themeColor: "#0b1f4d",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [settings, services] = await Promise.all([getSettings(), getServices()]);
  const navServices = services.map((s) => ({
    slug: s.slug,
    href: serviceHref(s),
    shortName: s.shortName,
    cardText: s.cardText,
    icon: s.icon,
  }));

  return (
    <html
      lang="es-CO"
      className={`${montserrat.variable} ${inter.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
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
      </body>
    </html>
  );
}
