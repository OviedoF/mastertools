import { site as staticSite, type SiteSettings } from "@/content/site";
import type { Service } from "@/content/services";

export function organizationJsonLd(site: SiteSettings = staticSite) {
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "Electrician"],
    "@id": `${site.url}/#organization`,
    name: site.name,
    legalName: site.legalName,
    url: site.url,
    logo: `${site.url}/marca/logo/logo_master_tools_color.svg`,
    image: `${site.url}/opengraph-image.png`,
    slogan: site.slogan,
    description: site.summary,
    foundingDate: String(site.founded),
    telephone: site.phone.display,
    // El correo se agrega cuando Master Tools confirme el comercial único.
    ...(site.pending.email ? {} : { email: site.email }),
    ...(site.pending.nit ? {} : { taxID: site.nit.replace(/^NIT\s*/i, "") }),
    areaServed: site.allDepartments.map((name) => ({
      "@type": "AdministrativeArea",
      name,
    })),
    address: {
      "@type": "PostalAddress",
      ...(site.pending.address ? {} : { streetAddress: site.address }),
      ...(site.pending.city ? {} : { addressLocality: site.city }),
      addressRegion: "Atlántico",
      addressCountry: "CO",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: site.phone.display,
        contactType: "emergency",
        areaServed: "CO",
        availableLanguage: "es",
      },
      {
        "@type": "ContactPoint",
        telephone: site.phone.display,
        contactType: "sales",
        areaServed: "CO",
        availableLanguage: "es",
      },
    ],
  };
}

export function serviceJsonLd(service: Service, url: string, site: SiteSettings = staticSite) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    serviceType: service.shortName,
    description: service.seo.description,
    url,
    provider: { "@id": `${site.url}/#organization` },
    areaServed: site.allDepartments.map((name) => ({
      "@type": "AdministrativeArea",
      name,
    })),
    audience: { "@type": "BusinessAudience", name: service.forWho },
  };
}

export function faqJsonLd(faqs: { q: string; a: string }[]) {
  if (!faqs.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; href: string }[], siteUrl = staticSite.url) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${siteUrl}${it.href}`,
    })),
  };
}
