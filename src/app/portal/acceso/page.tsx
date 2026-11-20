import Image from "next/image";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/portal/Forms";
import { MantaAvatar, tarjeta } from "@/components/portal/ui";
import { currentUser } from "@/lib/portal/auth";
import { dbConfigured } from "@/lib/portal/db";

export const metadata = { title: "Ingresar" };

export default async function Acceso({ searchParams }: { searchParams: Promise<{ clave?: string }> }) {
  if (dbConfigured() && (await currentUser())) redirect("/portal");
  const claveNueva = (await searchParams).clave === "nueva";
  return (
    <main className="grid min-h-screen place-items-center px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-4 text-center">
          <Image src="/marca/logo/logo_master_tools_color.svg" alt="Master Tools" width={180} height={48} priority className="h-auto w-44" />
          <MantaAvatar mood="feliz" size={72} className="ring-4 ring-master/40" />
          <div>
            <h1 className="font-display text-2xl font-extrabold">Portal de gestión</h1>
            <p className="mt-1 text-sm text-noche/75">Soy Manta. Ingrese con su correo de la empresa y le muestro cómo va el día.</p>
          </div>
        </div>
        <div className={tarjeta}>
          {claveNueva && (
            <p role="status" className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900">Listo, su contraseña nueva quedó guardada. Ingrese con ella.</p>
          )}
          {dbConfigured() ? (
            <LoginForm />
          ) : (
            <p className="text-sm">El portal todavía no tiene base de datos configurada (falta la variable DATABASE_URL).</p>
          )}
        </div>
      </div>
    </main>
  );
}
