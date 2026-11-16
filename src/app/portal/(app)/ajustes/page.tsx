import clsx from "clsx";
import { AjusteForm, ProbarForm } from "@/components/portal/Forms";
import { botonSuave, fechaHora, tarjeta } from "@/components/portal/ui";
import { quitarAjusteAction } from "@/lib/portal/actions";
import { requireAdmin } from "@/lib/portal/auth";
import { GRUPOS, ajusteDef, estadoAjustes, historialAjustes, type GrupoId } from "@/lib/settings";

export const metadata = { title: "Ajustes" };

const ORIGEN = {
  base: { texto: "Definido aquí", clase: "bg-emerald-100 text-emerald-900" },
  entorno: { texto: "Definido en el servidor", clase: "bg-claro text-noche" },
  vacio: { texto: "Sin definir", clase: "bg-slate-200 text-slate-700" },
} as const;

export default async function Ajustes() {
  await requireAdmin();
  const [estados, historial] = await Promise.all([estadoAjustes(), historialAjustes()]);
  const grupos = Object.keys(GRUPOS) as GrupoId[];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-noche">Ajustes</h1>
        <p className="max-w-3xl text-sm text-gris">
          Credenciales y conexiones del sitio. Lo que se guarda aquí tiene prioridad sobre las variables del servidor y se aplica en menos de un minuto, sin volver a publicar el sitio.
          Las claves se guardan cifradas y no se vuelven a mostrar. Si algo se hizo mal, «Quitar» devuelve el valor que tenga el servidor.
        </p>
      </div>

      {grupos.map((g) => {
        const items = estados.filter((e) => e.def.grupo === g);
        return (
          <section key={g} className="space-y-3" aria-labelledby={`g-${g}`}>
            <div>
              <h2 id={`g-${g}`} className="font-display text-lg font-extrabold text-noche">{GRUPOS[g].titulo}</h2>
              <p className="text-sm text-gris">{GRUPOS[g].descripcion}</p>
            </div>
            <div className={`${tarjeta} divide-y divide-noche/10 !p-0`}>
              {items.map((e) => (
                <div key={e.def.clave} className="grid gap-3 p-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
                  <div>
                    <p className="font-semibold text-noche">{e.def.etiqueta}</p>
                    <p className="mt-0.5 text-sm text-noche/75">{e.def.ayuda}</p>
                    <p className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                      <span className={clsx("rounded-full px-2.5 py-0.5 font-semibold", ORIGEN[e.origen].clase)}>{ORIGEN[e.origen].texto}</span>
                      {e.def.secreto && <span className="text-gris">Cifrado</span>}
                      {e.actualizado_en && (
                        <span className="text-gris">
                          {fechaHora(e.actualizado_en)}{e.actualizado_por ? ` · ${e.actualizado_por}` : ""}
                        </span>
                      )}
                    </p>
                    <code className="mt-1 block text-[11px] text-gris">{e.def.clave}</code>
                  </div>
                  <div className="space-y-2">
                    <AjusteForm
                      clave={e.def.clave}
                      secreto={e.def.secreto}
                      multilinea={e.def.multilinea}
                      valor={e.valor}
                      placeholder={e.def.placeholder}
                      definido={e.origen !== "vacio"}
                    />
                    {e.origen === "base" && (
                      <form action={quitarAjusteAction}>
                        <input type="hidden" name="clave" value={e.def.clave} />
                        <button className={`${botonSuave} !min-h-8 text-xs`}>Quitar y volver al valor del servidor</button>
                      </form>
                    )}
                  </div>
                </div>
              ))}
              {g === "analytics" && (
                <div className="p-5"><ProbarForm que="analytics" etiqueta="Probar conexión con Google Analytics" /></div>
              )}
              {g === "correo" && (
                <div className="p-5"><ProbarForm que="correo" etiqueta="Probar conexión con el correo" /></div>
              )}
            </div>
          </section>
        );
      })}

      <section className="space-y-3" aria-labelledby="hist">
        <h2 id="hist" className="font-display text-lg font-extrabold text-noche">Últimos cambios</h2>
        <div className={tarjeta}>
          {historial.length ? (
            <ul className="space-y-1.5 text-sm">
              {historial.map((h, i) => (
                <li key={i}>
                  <span className="font-semibold">{h.nombre ?? "Alguien"}</span> {h.accion === "guardado" ? "guardó" : "quitó"}{" "}
                  <span>{ajusteDef(h.clave)?.etiqueta ?? h.clave}</span>
                  <span className="text-gris"> · {fechaHora(h.creado_en)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gris">Todavía no se ha cambiado nada desde el portal.</p>
          )}
        </div>
      </section>
    </div>
  );
}
