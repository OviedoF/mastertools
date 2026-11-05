import clsx from "clsx";
import type { ReactNode } from "react";

type Tone = "white" | "niebla" | "noche" | "claro";

const toneClass: Record<Tone, string> = {
  white: "bg-white text-noche",
  niebla: "bg-niebla text-noche",
  noche: "bg-noche text-white",
  claro: "bg-claro/40 text-noche",
};

export function Section({
  tone = "white",
  className,
  innerClassName,
  id,
  children,
  bleed,
}: {
  tone?: Tone;
  className?: string;
  innerClassName?: string;
  id?: string;
  children: ReactNode;
  /** Sin contenedor interno */
  bleed?: boolean;
}) {
  return (
    <section
      id={id}
      className={clsx("relative scroll-mt-24 py-16 md:py-24", toneClass[tone], className)}
    >
      {bleed ? (
        children
      ) : (
        <div className={clsx("container-x", innerClassName)}>{children}</div>
      )}
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  text,
  align = "left",
  dark,
  className,
  as: Tag = "h2",
}: {
  eyebrow?: string;
  title: ReactNode;
  text?: ReactNode;
  align?: "left" | "center";
  dark?: boolean;
  className?: string;
  as?: "h1" | "h2" | "h3";
}) {
  return (
    <div
      className={clsx(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow && (
        <p className={clsx("eyebrow mb-3", dark ? "text-master" : "text-profundo")}>
          {eyebrow}
        </p>
      )}
      <Tag className={clsx(Tag === "h1" ? "h1" : "h2", dark ? "text-white" : "text-noche")}>
        {title}
      </Tag>
      {text && (
        <p className={clsx("lead mt-4", dark && "text-white/75")}>{text}</p>
      )}
    </div>
  );
}
