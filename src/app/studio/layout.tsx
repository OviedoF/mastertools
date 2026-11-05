import type { ReactNode } from "react";

/** El Studio ocupa toda la pantalla, sin encabezado ni pie del sitio. */
export default function StudioLayout({ children }: { children: ReactNode }) {
  return <div className="fixed inset-0 z-[100] bg-white">{children}</div>;
}
