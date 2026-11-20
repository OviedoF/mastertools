import Link from "next/link";
import { MapPin, Phone } from "lucide-react";
import type { SiteSettings } from "@/content/site";
import { telHref } from "@/lib/links";

/**
 * Barra superior de escritorio: base operativa, alcance nacional y línea directa.
 * Los departamentos listados son la base (y la zona con respuesta más rápida a emergencias),
 * no el total: se dice explícitamente para que no choque con el «14 departamentos» del inicio.
 */
export function TopBar({ settings }: { settings: SiteSettings }) {
  const depts = settings.emergencyDepartments;
  const deptText =
    depts.length > 1 ? `${depts.slice(0, -1).join(", ")} y ${depts[depts.length - 1]}` : depts.join("");
  return (
    <div className="hidden bg-noche text-sm text-white/85 md:block">
      <div className="container-x flex h-9 items-center justify-between gap-6">
        <p className="flex min-w-0 items-center gap-2">
          <MapPin className="size-4 shrink-0 text-master" aria-hidden="true" />
          <span className="truncate">
            <span className="font-semibold text-white">Base operativa en el Caribe</span>
            <span className="hidden xl:inline"> ({deptText})</span>
            <span aria-hidden="true"> · </span>
            <Link href="/cobertura" className="underline-offset-2 hover:text-white hover:underline">
              Proyectos a nivel nacional
            </Link>
          </span>
        </p>
        <a
          href={telHref}
          className="flex shrink-0 items-center gap-2 rounded-md font-display font-semibold text-alerta hover:text-white"
        >
          <Phone className="size-4" aria-hidden="true" />
          <span>
            Línea de emergencias:{" "}
            <span className="tabular-nums">{settings.phone.display}</span>
          </span>
        </a>
      </div>
    </div>
  );
}
