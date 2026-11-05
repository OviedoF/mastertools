import Link from "next/link";
import clsx from "clsx";
import type { ComponentProps, ReactNode } from "react";

type Variant =
  | "primary"
  | "emergency"
  | "white"
  | "outline"
  | "outline-white"
  | "ghost";
type Size = "sm" | "md" | "lg";

const variantClass: Record<Variant, string> = {
  primary: "btn-primary",
  emergency: "btn-emergency",
  white: "btn-white",
  outline: "btn-outline",
  "outline-white": "btn-outline-white",
  ghost: "btn-ghost",
};
const sizeClass: Record<Size, string> = { sm: "btn-sm", md: "", lg: "btn-lg" };

type Common = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

type ButtonLinkProps = Common & {
  href: string;
  external?: boolean;
} & Omit<ComponentProps<"a">, "href" | "children" | "className">;

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  external,
  children,
  ...rest
}: ButtonLinkProps) {
  const cls = clsx("btn", variantClass[variant], sizeClass[size], className);
  const isExternal =
    external ?? /^(https?:|tel:|mailto:|sms:)/.test(href);
  if (isExternal) {
    return (
      <a
        href={href}
        className={cls}
        {...(href.startsWith("http")
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
        {...rest}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} {...rest}>
      {children}
    </Link>
  );
}

type ButtonProps = Common & Omit<ComponentProps<"button">, "children" | "className">;

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={clsx("btn", variantClass[variant], sizeClass[size], className)}
      {...rest}
    >
      {children}
    </button>
  );
}
