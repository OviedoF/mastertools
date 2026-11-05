import { MapPin, Phone } from "lucide-react";
import type { SiteSettings } from "@/content/site";
import { telHref } from "@/lib/links";

/** Barra superior de escritorio: cobertura de emergencias y línea directa. */
export function TopBar({ settings }: { settings: SiteSettings }) {
  const depts = settings.emergencyDepartments;
  const deptText =
    depts.length > 1 ? `${depts.slice(0, -1).join(", ")} y ${depts[depts.length - 1]}` : depts.join("");
  return (
    <div className="hidden bg-noche text-sm text-white/85 md:block">
      <div className="container-x flex h-9 items-center justify-between gap-6">
        <p className="flex items-center gap-2 truncate">
          <MapPin className="size-4 shrink-0 text-master" aria-hidden="true" />
          <span className="truncate">{deptText}</span>
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
