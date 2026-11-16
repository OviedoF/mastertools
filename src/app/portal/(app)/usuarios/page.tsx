import { CrearUsuarioForm, ReiniciarClaveForm } from "@/components/portal/Forms";
import { botonSuave, fechaHora, input, tarjeta } from "@/components/portal/ui";
import { actualizarUsuarioAction } from "@/lib/portal/actions";
import { requireAdmin } from "@/lib/portal/auth";
import { query } from "@/lib/portal/db";
import { ROLES, type Rol } from "@/lib/portal/model";

export const metadata = { title: "Usuarios" };

export default async function Usuarios() {
  const yo = await requireAdmin();
  const usuarios = await query<{ id: string; nombre: string; correo: string; rol: Rol; activo: boolean; ultimo_acceso: Date | null }>(
    "select id, nombre, correo, rol, activo, ultimo_acceso from usuarios order by activo desc, nombre",
  );
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-extrabold">Usuarios y roles</h1>

      <section className={tarjeta}>
        <h2 className="h3 mb-3">Nuevo usuario</h2>
        <CrearUsuarioForm />
        <p className="mt-3 text-xs text-noche/60">
          Se genera una contraseña temporal que verá una sola vez; la persona la cambia al primer ingreso.
        </p>
      </section>

      <section className={tarjeta} aria-label="Roles">
        <h2 className="h3 mb-3">Qué puede hacer cada rol</h2>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          {Object.entries(ROLES).map(([k, r]) => (
            <div key={k} className="rounded-lg bg-niebla p-3">
              <dt className="font-semibold">{r.label}</dt>
              <dd className="text-noche/75">{r.descripcion}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="overflow-hidden rounded-2xl bg-white shadow-card" aria-label="Lista de usuarios">
        <ul className="divide-y divide-noche/10">
          {usuarios.map((x) => (
            <li key={x.id} className={`grid gap-3 p-4 md:grid-cols-[1fr_auto] md:items-center ${x.activo ? "" : "bg-niebla/70 text-noche/60"}`}>
              <div>
                <p className="font-semibold">{x.nombre}{x.id === yo.id && " (usted)"}</p>
                <p className="text-sm">{x.correo}</p>
                <p className="text-xs text-noche/55">{x.ultimo_acceso ? `Último ingreso: ${fechaHora(x.ultimo_acceso)}` : "Aún no ha ingresado"}</p>
                <div className="mt-2"><ReiniciarClaveForm id={x.id} /></div>
              </div>
              <form action={actualizarUsuarioAction} className="flex flex-wrap items-center gap-3">
                <input type="hidden" name="id" value={x.id} />
                <select name="rol" defaultValue={x.rol} aria-label={`Rol de ${x.nombre}`} className={`${input} w-40`} disabled={x.id === yo.id}>
                  {Object.entries(ROLES).map(([k, r]) => (
                    <option key={k} value={k}>{r.label}</option>
                  ))}
                </select>
                {x.id === yo.id && <input type="hidden" name="rol" value={x.rol} />}
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="activo" defaultChecked={x.activo} disabled={x.id === yo.id} className="size-4" />
                  Activo
                </label>
                {x.id === yo.id && <input type="hidden" name="activo" value="on" />}
                <button className={botonSuave}>Guardar</button>
              </form>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
