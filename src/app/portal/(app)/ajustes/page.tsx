import clsx from "clsx";
import { AgregarDestinoForm, AjusteForm, DestinoFila, ProbarForm, type EstadoDestino } from "@/components/portal/Forms";
import { botonSuave, fechaHora, tarjeta } from "@/components/portal/ui";
import { quitarAjusteAction } from "@/lib/portal/actions";
import { requireAdmin } from "@/lib/portal/auth";
import { GRUPOS, ajusteDef, estadoAjustes, historialAjustes, type GrupoId } from "@/lib/settings";
import { NUMERO_BOT, faltantesWhatsApp, listarDestinos, type Destino } from "@/lib/whatsapp";

export const metadata = { title: "Ajustes" };

const ORIGEN = {
  base: { texto: "Definido aquí", clase: "bg-emerald-100 text-emerald-900" },
  entorno: { texto: "Definido en el servidor", clase: "bg-claro text-noche" },
  vacio: { texto: "Sin definir", clase: "bg-slate-200 text-slate-700" },
} as const;

/** Errores frecuentes de Meta, en palabras del cliente. */
function explicarErrorMeta(detalle: string | null): string {
  const d = detalle ?? "";
  if (/Paid Message Account|\(#10\)/i.test(d)) return "Meta no puede cobrar el mensaje: la cuenta de WhatsApp no tiene un método de pago válido (Administrador de WhatsApp > Añadir método de pago).";
  if (/131026|undeliverable/i.test(d)) return "WhatsApp no pudo entregarlo: el número no tiene WhatsApp, o la persona no le ha escrito al número de avisos.";
  if (/131030|not in allowed list/i.test(d)) return "La cuenta de Meta está en modo de prueba y este número no está autorizado en ella.";
  if (/132001|template name does not exist/i.test(d)) return "La plantilla no existe o aún no está aprobada (revise el nombre y el idioma).";
  if (/HTTP 401|190|OAuth/i.test(d)) return "El token de WhatsApp venció o no tiene permiso. Hay que generar uno permanente.";
  if (/131056|pair rate/i.test(d)) return "Se enviaron demasiados mensajes seguidos a este número. Espere unos minutos.";
  return d || "sin detalle";
}

/** «2:09 a. m.» + «.» sin duplicar el punto. */
const conPunto = (t: string) => (t.endsWith(".") ? t : `${t}.`);

/**
 * Estado de un número de la lista, en palabras del cliente. «Listo para usar» exige que Meta haya aceptado
 * el último mensaje (prueba o aviso real); Meta no confirma aquí la lectura en el teléfono.
 */
function estadoDestino(d: Destino, conectado: boolean): EstadoDestino {
  if (!d.activo) return { etiqueta: "Desactivado", tono: "gris", detalle: "No recibe avisos." };
  if (d.ultimo_envio_ok && d.ultimo_envio_en) {
    return { etiqueta: "Listo para usar", tono: "verde", detalle: conPunto(`Meta aceptó el último mensaje el ${fechaHora(d.ultimo_envio_en)}`) };
  }
  if (d.ultimo_envio_ok === false && d.ultimo_envio_en) {
    return { etiqueta: "Revisar", tono: "rojo", detalle: `Falló el envío del ${fechaHora(d.ultimo_envio_en)}: ${explicarErrorMeta(d.ultimo_envio_detalle)}` };
  }
  if (!d.hola) {
    return { etiqueta: "Falta el «hola»", tono: "alerta", detalle: `Esta persona tiene que escribirle «hola» por WhatsApp al ${NUMERO_BOT}. Después marque la casilla.` };
  }
  if (!conectado) return { etiqueta: "Esperando la conexión", tono: "azul", detalle: "Listo de su lado. Falta conectar WhatsApp (datos de arriba)." };
  return { etiqueta: "Listo para probar", tono: "azul", detalle: "Pulse «Enviar mensaje de prueba por WhatsApp» para confirmarlo." };
}

export default async function Ajustes() {
  await requireAdmin();
  const [estados, historial, destinos, faltanWa] = await Promise.all([estadoAjustes(), historialAjustes(), listarDestinos(), faltantesWhatsApp()]);
  const waConectado = !faltanWa.some((f) => /ID del número|Token|plantilla/.test(f));
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
              {g === "whatsapp" && (
                <div id="destinos" className="scroll-mt-4 space-y-3 p-5">
                  {faltanWa.length === 0 ? (
                    <p className="rounded-lg bg-emerald-100 px-3 py-2 text-sm text-emerald-900">
                      <span className="font-semibold">Listo para usar.</span> Las emergencias nuevas se avisan por WhatsApp a los números marcados como «Listo para usar».
                    </p>
                  ) : (
                    <div className="rounded-lg bg-niebla px-3 py-2 text-sm text-noche">
                      <p className="font-semibold">Todavía no está listo. Falta:</p>
                      <ul className="mt-1 list-disc pl-5">{faltanWa.map((f) => <li key={f}>{f}</li>)}</ul>
                      <p className="mt-1 text-noche/70">Mientras tanto, las emergencias siguen llegando por correo y a la campana del portal.</p>
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-noche">Números que reciben el aviso</p>
                    <p className="mt-0.5 text-sm text-noche/75">
                      Los avisos salen desde el número {NUMERO_BOT}. Cada persona de esta lista tiene que haberle escrito antes a ese número por WhatsApp
                      (aunque sea un «hola») o haber aceptado recibir mensajes. «Solo fuera de horario» avisa fuera de lunes a viernes de 8:00 a 16:00.
                    </p>
                  </div>
                  {destinos.length > 0 ? (
                    <ul className="divide-y divide-noche/10">
                      {destinos.map((d) => (
                        <DestinoFila
                          key={`${d.id}-${d.numero}-${d.nombre}-${d.cuando}-${d.activo}-${d.hola}`}
                          d={{ id: d.id, nombre: d.nombre, numero: d.numero, cuando: d.cuando, activo: d.activo, hola: d.hola, estado: estadoDestino(d, waConectado) }}
                        />
                      ))}
                    </ul>
                  ) : (
                    <p className="rounded-lg bg-niebla px-3 py-2 text-sm text-noche/80">Todavía no hay números. Agregue el primero abajo.</p>
                  )}
                  <div className="border-t border-noche/10 pt-3">
                    <p className="mb-2 text-sm font-semibold text-noche">Agregar un número</p>
                    <AgregarDestinoForm />
                  </div>
                </div>
              )}
              {g === "whatsapp" && (
                <div className="p-5">
                  <ProbarForm que="whatsapp" etiqueta="Enviar mensaje de prueba por WhatsApp" />
                  <p className="mt-2 text-xs text-gris">Envía un mensaje real de prueba a todos los números activos de la lista, sin importar el horario.</p>
                </div>
              )}
              {g === "campo" && (
                <div className="p-5">
                  <ProbarForm que="whatsapp_campo" etiqueta="Enviar mensaje de prueba a los técnicos" />
                  <p className="mt-2 text-xs text-gris">Envía un mensaje real a cada técnico activo con teléfono cargado en Usuarios. El botón del mensaje abre la app (en la prueba no lleva a ningún servicio).</p>
                </div>
              )}
              {g === "avisos" && (
                <div className="p-5">
                  <ProbarForm que="recordatorio" etiqueta="Enviar ahora el recordatorio de seguimientos" />
                  <p className="mt-2 text-xs text-gris">El recordatorio sale solo todos los días a las 8:00. Este botón lo envía ya, a cada responsable con seguimientos vencidos y a gerencia.</p>
                </div>
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
                  <span>{h.clave === "WHATSAPP_DESTINOS" ? "la lista de números de WhatsApp" : ajusteDef(h.clave)?.etiqueta ?? h.clave}</span>
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
