import type { Metadata, Viewport } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
import { site } from "@/content/site";

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
    default: "Master Tools | Ingeniería eléctrica integral en Colombia",
    template: "%s | Master Tools",
  },
  description:
    "Proyectos, transformadores y subestaciones, pruebas TTR y SFRA, cambio de comercializador y medida Nivel I, II y III, telemedida, calibración, energía solar, redes de baja y media tensión, mantenimiento y emergencias. Base en el Caribe, alcance nacional.",
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CO" className={`${montserrat.variable} ${inter.variable} h-full`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
