import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import type { SiteSettings } from "@/content/site";
import { telHref, waGeneralHref } from "@/lib/links";
import { Logo } from "@/components/ui/Logo";
import { WhatsAppIcon } from "@/components/ui/Icons";
import { Pending } from "@/components/ui/Pending";
import { Orbit } from "@/components/ui/Orbit";
import type { NavService } from "./Header";

/** Año de la versión publicada; se actualiza con cada despliegue. */
const LAUNCH_YEAR = 2026;

export function Footer({ settings, services }: { settings: SiteSettings; services: NavService[] }) {
  const site = settings;
  return (
    <footer className="relative overflow-hidden bg-noche text-white">
      <Orbit
        className="absolute -top-24 -right-40 w-[760px] text-master/10"
        draw={false}
      />
      <div className="container-x relative py-14 md:py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <Logo variant="negativo" width={200} />
            <p className="mt-5 max-w-sm text-[0.9375rem] leading-relaxed text-white/75">
              {site.summary}
            </p>
            <p className="mt-4 font-display text-sm font-semibold text-master">
              {site.slogan}
            </p>
          </div>

          <div>
            <h2 className="eyebrow text-master">Servicios</h2>
            <ul className="mt-4 grid gap-2.5 text-[0.9375rem]">
              {services.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={s.href}
                    className="text-white/80 transition-colors hover:text-white"
                  >
                    {s.shortName}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="eyebrow text-master">Empresa</h2>
            <ul className="mt-4 grid gap-2.5 text-[0.9375rem]">
              {[
                { label: "Proyectos", href: "/proyectos" },
                { label: "Cobertura", href: "/cobertura" },
                { label: "Nosotros", href: "/nosotros" },
                { label: "Contacto y cotización", href: "/contacto" },
                {
                  label: "Política de tratamiento de datos",
                  href: "/politica-de-tratamiento-de-datos",
                },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-white/80 transition-colors hover:text-white"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <h2 className="eyebrow mt-8 text-master">Redes</h2>
            <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[0.9375rem]">
              {site.social.map((s) =>
                s.pending ? (
                  <li key={s.label} className="text-white/60">
                    {s.label}
                  </li>
                ) : (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      className="text-white/80 hover:text-white"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {s.label}
                    </a>
                  </li>
                ),
              )}
            </ul>
            {site.social.some((s) => s.pending) && (
              <Pending inline className="mt-2 border-white/30 bg-white/10 text-white/70">
                enlaces por confirmar
              </Pending>
            )}
          </div>

          <div>
            <h2 className="eyebrow text-master">Contacto</h2>
            <ul className="mt-4 grid gap-3 text-[0.9375rem]">
              <li>
                <a
                  href={telHref}
                  className="flex items-start gap-3 text-white/85 hover:text-white"
                >
                  <Phone className="mt-0.5 size-4 shrink-0 text-alerta" aria-hidden="true" />
                  <span>
                    <span className="block font-display text-xs font-semibold tracking-wide text-alerta uppercase">
                      Línea de emergencias
                    </span>
                    <span className="tabular-nums">{site.phone.display}</span>
                  </span>
                </a>
              </li>
              <li>
                <a
                  href={waGeneralHref}
                  className="flex items-center gap-3 text-white/85 hover:text-white"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <WhatsAppIcon className="size-4 shrink-0 text-master" />
                  <span>WhatsApp {site.phone.display}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${site.email}`}
                  className="flex items-center gap-3 text-white/85 hover:text-white"
                >
                  <Mail className="size-4 shrink-0 text-master" aria-hidden="true" />
                  <span>{site.email}</span>
                  {site.pending.email && (
                    <Pending inline className="border-white/30 bg-white/10 text-white/70">
                      validar
                    </Pending>
                  )}
                </a>
              </li>
              <li className="flex items-start gap-3 text-white/75">
                <MapPin className="mt-0.5 size-4 shrink-0 text-master" aria-hidden="true" />
                <span>
                  Base en el Caribe colombiano. Trabajos en{" "}
                  {site.allDepartments.join(", ")}.
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-white/60 md:flex-row md:items-center md:justify-between">
          <p>
            {site.legalName} ·{" "}
            {site.pending.nit ? (
              <Pending inline className="border-white/30 bg-white/10 text-white/70">
                {site.nit}
              </Pending>
            ) : (
              site.nit
            )}{" "}
            · {site.slogan}
          </p>
          <p>© {site.founded}–{LAUNCH_YEAR} Master Tools. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
