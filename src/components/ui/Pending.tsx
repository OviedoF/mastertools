import clsx from "clsx";
import { CircleDashed } from "lucide-react";

/**
 * Señala en el prototipo un dato que Master Tools todavía tiene que
 * aportar o validar. Se retira antes del lanzamiento.
 */
export function Pending({
  children,
  inline,
  className,
}: {
  children: React.ReactNode;
  inline?: boolean;
  className?: string;
}) {
  if (inline) {
    return (
      <span
        className={clsx(
          "inline-flex items-center gap-1 rounded-md border border-dashed border-gris/70 bg-niebla px-1.5 py-0.5 text-[0.8em] text-noche/70",
          className,
        )}
        title="Dato por completar por Master Tools"
      >
        <CircleDashed className="size-3.5 shrink-0" aria-hidden="true" />
        {children}
      </span>
    );
  }
  return (
    <div
      className={clsx(
        "rounded-xl border border-dashed border-gris/70 bg-niebla px-4 py-3 text-sm text-noche/70",
        className,
      )}
    >
      <p className="mb-1 flex items-center gap-1.5 font-display text-xs font-bold tracking-wide text-gris uppercase">
        <CircleDashed className="size-3.5" aria-hidden="true" />
        Por completar
      </p>
      {children}
    </div>
  );
}
