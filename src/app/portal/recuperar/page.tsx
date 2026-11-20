import Image from "next/image";
import Link from "next/link";
import { RecuperarForm } from "@/components/portal/Forms";
import { MantaAvatar, tarjeta } from "@/components/portal/ui";

export const metadata = { title: "Recuperar contraseña" };

export default function Recuperar() {
  return (
    <main className="grid min-h-screen place-items-center px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-4 text-center">
          <Image src="/marca/logo/logo_master_tools_color.svg" alt="Master Tools" width={180} height={48} priority className="h-auto w-44" />
          <MantaAvatar mood="pensativo" size={64} className="ring-4 ring-master/40" />
          <div>
            <h1 className="font-display text-2xl font-extrabold">Recuperar contraseña</h1>
            <p className="mt-1 text-sm text-noche/75">Escriba el correo con el que ingresa al portal y le envío un enlace para crear una contraseña nueva.</p>
          </div>
        </div>
        <div className={tarjeta}>
          <RecuperarForm />
        </div>
        <p className="mt-4 text-center text-sm">
          <Link href="/portal/acceso" className="font-semibold text-profundo underline-offset-2 hover:underline">Volver a ingresar</Link>
        </p>
      </div>
    </main>
  );
}
