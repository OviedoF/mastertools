"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { ArrowRight, ChevronDown, Menu, Phone, X } from "lucide-react";
import { nav } from "@/content/site";
import { telHref, waGeneralHref } from "@/lib/links";
import { Logo } from "@/components/ui/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { WhatsAppIcon } from "@/components/ui/Icons";

export type NavService = {
  slug: string;
  href: string;
  shortName: string;
  cardText: string;
  icon: string;
};

function subscribeScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

export function Header({ services }: { services: NavService[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const menuId = useId();
  const servicesId = useId();
  const servicesRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | null>(null);

  // Cierra los menús al navegar (estado derivado del cambio de ruta)
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setOpen(false);
    setServicesOpen(false);
  }

  // Sombra del encabezado al hacer scroll
  const scrolled = useSyncExternalStore(
    subscribeScroll,
    () => window.scrollY > 8,
    () => false,
  );

  // Bloquea el scroll del fondo con el menú móvil abierto y lo cierra con Escape
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Cierra el desplegable con Escape o clic afuera
  useEffect(() => {
    if (!servicesOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setServicesOpen(false);
    const onClick = (e: MouseEvent) => {
      if (!servicesRef.current?.contains(e.target as Node)) setServicesOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [servicesOpen]);

  const hoverOpen = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setServicesOpen(true);
  };
  const hoverClose = () => {
    closeTimer.current = window.setTimeout(() => setServicesOpen(false), 160);
  };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <header
        className={clsx(
          "sticky top-0 z-50 bg-white/92 backdrop-blur-md transition-shadow duration-300",
          scrolled
            ? "shadow-[0_1px_0_rgb(11_31_77/0.08),0_8px_24px_-16px_rgb(11_31_77/0.25)]"
            : "shadow-[0_1px_0_rgb(11_31_77/0.08)]",
        )}
      >
        <div className="container-x flex h-[68px] items-center justify-between gap-4 md:h-20">
          <Logo width={160} className="md:w-[200px]" priority />

          {/* Navegación de escritorio */}
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Principal">
            {nav.map((item) =>
              item.hasMenu ? (
                <div
                  key={item.href}
                  ref={servicesRef}
                  className="relative"
                  onMouseEnter={hoverOpen}
                  onMouseLeave={hoverClose}
                >
                  <button
                    type="button"
                    className={clsx(
                      "inline-flex h-11 items-center gap-1 rounded-lg px-3 font-display text-[0.9375rem] font-semibold transition-colors hover:bg-claro/50 hover:text-profundo",
                      isActive(item.href) || servicesOpen ? "text-profundo" : "text-noche",
                    )}
                    aria-expanded={servicesOpen}
                    aria-controls={servicesId}
                    onClick={() => setServicesOpen((v) => !v)}
                  >
                    {item.label}
                    <ChevronDown
                      className={clsx("size-4 transition-transform", servicesOpen && "rotate-180")}
                      aria-hidden="true"
                    />
                  </button>
                  <div
                    id={servicesId}
                    className={clsx(
                      "absolute top-full left-1/2 w-[min(880px,calc(100vw-2rem))] -translate-x-1/2 pt-3 transition-[opacity,transform] duration-200 ease-(--ease-out-expo)",
                      servicesOpen
                        ? "visible translate-y-0 opacity-100"
                        : "invisible -translate-y-1 opacity-0",
                    )}
                  >
                    <div className="card overflow-hidden p-2">
                      <div className="grid grid-cols-3 gap-1">
                        {services.map((s) => {
                          const emergency = s.slug === "emergencias";
                          return (
                            <Link
                              key={s.slug}
                              href={s.href}
                              className={clsx(
                                "group flex items-start gap-3 rounded-xl p-3 transition-colors",
                                emergency ? "hover:bg-alerta/15" : "hover:bg-claro/50",
                              )}
                            >
                              <span
                                className={clsx(
                                  "mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full",
                                  emergency ? "bg-alerta text-noche" : "bg-noche text-master",
                                )}
                              >
                                <Icon name={s.icon} className="size-[18px]" strokeWidth={1.75} aria-hidden="true" />
                              </span>
                              <span className="min-w-0">
                                <span className="block font-display text-[0.9375rem] font-semibold text-noche group-hover:text-profundo">
                                  {s.shortName}
                                </span>
                                <span className="mt-0.5 block text-[0.8125rem] leading-snug text-noche/65">
                                  {s.cardText}
                                </span>
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                      <div className="mt-2 flex items-center justify-between rounded-xl bg-niebla px-4 py-3">
                        <p className="text-sm text-noche/75">
                          Nueve líneas de servicio, un solo equipo técnico.
                        </p>
                        <Link
                          href="/servicios"
                          className="inline-flex items-center gap-1 font-display text-sm font-semibold text-profundo hover:underline"
                        >
                          Ver todos los servicios
                          <ArrowRight className="size-4" aria-hidden="true" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "inline-flex h-11 items-center rounded-lg px-3 font-display text-[0.9375rem] font-semibold transition-colors hover:bg-claro/50 hover:text-profundo",
                    isActive(item.href) ? "text-profundo" : "text-noche",
                  )}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          <div className="flex items-center gap-2">
            <ButtonLink href="/contacto" size="sm" className="hidden sm:inline-flex">
              Solicitar cotización
            </ButtonLink>
            <ButtonLink href="/contacto" size="sm" className="sm:hidden">
              Cotizar
            </ButtonLink>
            <button
              type="button"
              className="inline-flex size-11 items-center justify-center rounded-lg text-noche hover:bg-claro/50 lg:hidden"
              aria-expanded={open}
              aria-controls={menuId}
              aria-label={open ? "Cerrar menú" : "Abrir menú"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Menú móvil. Va fuera del <header>: el backdrop-blur crearía un
          bloque contenedor y el panel fijo quedaría atrapado dentro. */}
      <div
        id={menuId}
        className={clsx(
          "fixed inset-x-0 top-[68px] bottom-0 z-40 overflow-y-auto bg-white transition-[opacity,transform] duration-300 ease-(--ease-out-expo) lg:hidden",
          open ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0",
        )}
        aria-hidden={!open}
        inert={!open}
      >
        <nav className="container-x flex min-h-full flex-col py-4" aria-label="Principal móvil">
          <details className="group border-b border-noche/10" open>
            <summary className="flex h-14 cursor-pointer list-none items-center justify-between font-display text-lg font-semibold text-noche [&::-webkit-details-marker]:hidden">
              Servicios
              <ChevronDown className="size-5 transition-transform group-open:rotate-180" aria-hidden="true" />
            </summary>
            <ul className="grid gap-1 pb-3">
              {services.map((s) => {
                const emergency = s.slug === "emergencias";
                return (
                  <li key={s.slug}>
                    <Link
                      href={s.href}
                      className="flex items-center gap-3 rounded-xl px-2 py-2.5 text-[0.9375rem] font-medium text-noche hover:bg-claro/50"
                    >
                      <span
                        className={clsx(
                          "inline-flex size-9 shrink-0 items-center justify-center rounded-full",
                          emergency ? "bg-alerta text-noche" : "bg-noche text-master",
                        )}
                      >
                        <Icon name={s.icon} className="size-[18px]" strokeWidth={1.75} aria-hidden="true" />
                      </span>
                      {s.shortName}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </details>
          {nav
            .filter((n) => !n.hasMenu)
            .map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex h-14 items-center border-b border-noche/10 font-display text-lg font-semibold text-noche"
              >
                {item.label}
              </Link>
            ))}
          <div className="mt-auto grid gap-3 pt-6 pb-24">
            <ButtonLink href="/contacto" size="lg">
              Solicitar cotización
            </ButtonLink>
            <div className="grid grid-cols-2 gap-3">
              <ButtonLink href={waGeneralHref} variant="outline">
                <WhatsAppIcon /> WhatsApp
              </ButtonLink>
              <ButtonLink href={telHref} variant="outline">
                <Phone className="size-5" aria-hidden="true" /> Llamar
              </ButtonLink>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
}
