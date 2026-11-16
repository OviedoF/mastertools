import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { LogOut } from "lucide-react";
import { MantaDock } from "@/components/portal/MantaDock";
import { logoutAction } from "@/lib/portal/actions";
import { requireUser } from "@/lib/portal/auth";
import { resumen } from "@/lib/portal/cases";
import { mantaBrief } from "@/lib/portal/manta";
import { ROLES, puedeAdministrar } from "@/lib/portal/model";

export const dynamic = "force-dynamic";

export default async function PortalLayout({ children }: { children: ReactNode }) {
  const u = await requireUser();
  if (u.debe_cambiar) redirect("/portal/clave");
  const brief = mantaBrief(await resumen(u.id), u.nombre);

  return (
    <>
      <header className="bg-noche text-white">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-5 py-3 sm:px-8">
          <Link href="/portal" className="flex items-center gap-3">
            <Image src="/marca/logo/logo_master_tools_negativo_sin_SAS.svg" alt="Master Tools" width={140} height={36} className="h-8 w-auto" />
            <span className="eyebrow text-master">Portal</span>
          </Link>
          <nav aria-label="Principal" className="flex items-center gap-1 text-sm font-semibold">
            <Link href="/portal" className="rounded-lg px-3 py-2 hover:bg-white/10">
              Solicitudes
            </Link>
            {puedeAdministrar(u.rol) && (
              <>
                <Link href="/portal/dashboard" className="rounded-lg px-3 py-2 hover:bg-white/10">
                  Dashboard
                </Link>
                <Link href="/portal/usuarios" className="rounded-lg px-3 py-2 hover:bg-white/10">
                  Usuarios
                </Link>
                <Link href="/portal/ajustes" className="rounded-lg px-3 py-2 hover:bg-white/10">
                  Ajustes
                </Link>
              </>
            )}
          </nav>
          <div className="ml-auto flex items-center gap-3 text-sm">
            <span className="text-right leading-tight">
              <span className="block font-semibold">{u.nombre}</span>
              <span className="block text-xs text-white/70">{ROLES[u.rol].label}</span>
            </span>
            <form action={logoutAction}>
              <button className="rounded-lg p-2 hover:bg-white/10" aria-label="Cerrar sesión" title="Cerrar sesión">
                <LogOut className="size-5" aria-hidden="true" />
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-5 pt-6 pb-28 sm:px-8">{children}</main>
      <MantaDock mood={brief.mood} saludo={brief.saludo} resumen={brief.resumen} avisos={brief.avisos} />
    </>
  );
}
