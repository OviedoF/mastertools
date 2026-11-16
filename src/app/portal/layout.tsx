import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: { default: "Portal", template: "%s | Portal Master Tools" },
  robots: { index: false, follow: false },
};

export default function PortalRoot({ children }: { children: ReactNode }) {
  return <div className="min-h-screen flex-1 bg-niebla">{children}</div>;
}
