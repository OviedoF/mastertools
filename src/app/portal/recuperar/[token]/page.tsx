import Link from "next/link";
import { RestablecerClaveForm } from "@/components/portal/Forms";
import { MantaAvatar, tarjeta } from "@/components/portal/ui";
import { recuperacionVigente } from "@/lib/portal/auth";

export const metadata = { title: "Crear contraseña nueva" };
export const dynamic = "force-dynamic";

export default async function NuevaClave({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const r = await recuperacionVigente(token);
  return (
    <main className="grid min-h-screen place-items-center px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <MantaAvatar mood={r ? "contento" : "serio"} size={64} className="ring-4 ring-master/40" />
          <h1 className="font-display text-2xl font-extrabold">{r ? "Cree su contraseña nueva" : "Este enlace ya no sirve"}</h1>
          <p className="text-sm text-noche/75">
            {r
              ? `${r.nombre.split(" ")[0]}, elija una contraseña nueva. Al guardarla se cerrarán las sesiones abiertas en otros equipos.`
              : "Los enlaces de recuperación valen una hora y sirven una sola vez. Pida uno nuevo."}
          </p>
        </div>
        <div className={tarjeta}>
          {r ? (
            <RestablecerClaveForm token={token} />
          ) : (
            <Link href="/portal/recuperar" className="inline-flex min-h-10 w-full items-center justify-center rounded-lg bg-profundo px-4 text-sm font-semibold text-white hover:bg-[#00589a]">
              Pedir un enlace nuevo
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
