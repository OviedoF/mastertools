import { CambiarClaveForm } from "@/components/portal/Forms";
import { MantaAvatar, tarjeta } from "@/components/portal/ui";
import { requireUser } from "@/lib/portal/auth";

export const metadata = { title: "Cambiar contraseña" };

export default async function Clave() {
  const u = await requireUser();
  return (
    <main className="grid min-h-screen place-items-center px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <MantaAvatar mood="pensativo" size={64} className="ring-4 ring-master/40" />
          <h1 className="font-display text-2xl font-extrabold">Cree su contraseña</h1>
          <p className="text-sm text-noche/75">
            {u.nombre.split(" ")[0]}, la contraseña con la que entró es temporal. Elija una propia para continuar.
          </p>
        </div>
        <div className={tarjeta}>
          <CambiarClaveForm />
        </div>
      </div>
    </main>
  );
}
