import Image from "next/image";
import clsx from "clsx";
import { ESTADOS, type Estado } from "@/lib/portal/model";
import type { MantaMood } from "@/lib/portal/manta";

const AVATAR: Record<MantaMood, string> = {
  feliz: "/marca/manta/avatar_feliz_noche_128.png",
  contento: "/marca/manta/avatar_contento_noche_128.png",
  pensativo: "/marca/manta/avatar_pensativo_noche_128.png",
  serio: "/marca/manta/avatar_serio_noche_128.png",
};

export function MantaAvatar({ mood = "feliz", size = 48, className }: { mood?: MantaMood; size?: number; className?: string }) {
  return (
    <Image
      src={AVATAR[mood]}
      alt=""
      width={size}
      height={size}
      className={clsx("rounded-full bg-noche", className)}
      style={{ width: size, height: size }}
    />
  );
}

const TONO = {
  azul: "bg-claro text-noche",
  verde: "bg-emerald-100 text-emerald-900",
  gris: "bg-slate-200 text-slate-700",
  alerta: "bg-alerta/90 text-noche",
} as const;

export function EstadoBadge({ estado }: { estado: Estado }) {
  const e = ESTADOS[estado];
  return <span className={clsx("inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap", TONO[e.tono])}>{e.label}</span>;
}

const fmt = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Bogota" });
export const fechaHora = (d: Date | string) => fmt.format(new Date(d));

export function hace(d: Date | string) {
  const min = Math.round((Date.now() - new Date(d).getTime()) / 60000);
  if (min < 1) return "ahora";
  if (min < 60) return `hace ${min} min`;
  const h = Math.round(min / 60);
  if (h < 48) return `hace ${h} h`;
  return `hace ${Math.round(h / 24)} días`;
}

export const tamano = (b: number) => (b < 1024 * 1024 ? `${Math.max(1, Math.round(b / 1024))} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`);

export const input =
  "min-h-10 w-full rounded-lg border border-noche/20 bg-white px-3 text-sm text-noche placeholder:text-gris focus:border-profundo";
export const boton =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-profundo px-4 text-sm font-semibold text-white hover:bg-[#00589a] disabled:opacity-60";
export const botonSuave =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-noche/20 bg-white px-4 text-sm font-semibold text-noche hover:bg-niebla disabled:opacity-60";
export const tarjeta = "rounded-2xl bg-white p-5 shadow-card";
