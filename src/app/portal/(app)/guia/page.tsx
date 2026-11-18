import Link from "next/link";
import { MantaAvatar, tarjeta } from "@/components/portal/ui";
import { requireUser } from "@/lib/portal/auth";
import { ESTADOS, FLUJO, PLAZO_PRIMER_CONTACTO_H, ROLES, puedeAdministrar, puedeGestionar } from "@/lib/portal/model";

export const metadata = { title: "Guía de uso" };

function Seccion({ id, titulo, children }: { id: string; titulo: string; children: React.ReactNode }) {
  return (
    <section id={id} className={`${tarjeta} scroll-mt-24 space-y-3`} aria-labelledby={`${id}-t`}>
      <h2 id={`${id}-t`} className="font-display text-lg font-extrabold text-noche">{titulo}</h2>
      {children}
    </section>
  );
}

const Pasos = ({ items }: { items: React.ReactNode[] }) => (
  <ol className="list-decimal space-y-1.5 pl-5 text-sm text-noche">
    {items.map((x, i) => <li key={i}>{x}</li>)}
  </ol>
);

const Lista = ({ items }: { items: React.ReactNode[] }) => (
  <ul className="list-disc space-y-1.5 pl-5 text-sm text-noche">
    {items.map((x, i) => <li key={i}>{x}</li>)}
  </ul>
);

const flujo = (t: "cotizacion" | "emergencia") => FLUJO[t].map((e) => ESTADOS[e].label).join(" · ");

export default async function Guia() {
  const u = await requireUser();
  const admin = puedeAdministrar(u.rol);
  const rol = ROLES[u.rol];
  const gestiona = [puedeGestionar(u.rol, "cotizacion") && "cotizaciones", puedeGestionar(u.rol, "emergencia") && "emergencias"].filter(Boolean).join(" y ");

  const indice = [
    ["inicio", "Para empezar"],
    ["atender", "Cómo atender una solicitud"],
    ["estados", "Qué significa cada estado"],
    ["buscar", "Buscar y filtrar"],
    ["avisos", "Avisos y recordatorios"],
    ["manta", "Manta, su ayudante"],
    ...(admin ? [["admin", "Solo para Gerencia"]] : []),
    ["dudas", "Preguntas frecuentes"],
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className={`${tarjeta} flex items-start gap-4`}>
        <MantaAvatar mood="feliz" size={56} className="shrink-0" />
        <div>
          <h1 className="font-display text-2xl font-extrabold text-noche">Guía de uso del portal</h1>
          <p className="text-sm text-noche/80">
            Aquí se explica, paso a paso, cómo usar el portal. Usted entró como <strong>{rol.label}</strong>
            {gestiona ? <>: puede gestionar {gestiona}</> : <>: puede consultar todo, sin modificar nada</>}
            . Puede volver a esta guía cuando quiera desde «Guía», arriba.
          </p>
        </div>
      </div>

      <nav aria-label="Contenido de la guía" className={`${tarjeta} text-sm`}>
        <p className="font-semibold text-noche">En esta guía</p>
        <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
          {indice.map(([id, t]) => (
            <li key={id}><a href={`#${id}`} className="text-profundo underline">{t}</a></li>
          ))}
        </ul>
      </nav>

      <Seccion id="inicio" titulo="Para empezar">
        <p className="text-sm text-noche/80">
          Todo lo que piden los clientes llega aquí: las cotizaciones y las emergencias, sea que las envíen por el formulario del sitio o por el chat de Manta. Cada una es una <strong>solicitud</strong> (o «caso»).
        </p>
        <Pasos items={[
          <>Abra <Link href="/portal" className="font-semibold text-profundo underline">Solicitudes</Link>: es la pantalla principal. Arriba, Manta le resume cómo va el día; abajo está la lista.</>,
          <>Toque una solicitud para abrirla. Verá los datos del cliente, el historial y lo que puede hacer con ella.</>,
          <>La campana de arriba a la derecha le avisa cuando llega algo nuevo o le asignan un caso.</>,
          <>Para salir, use el botón de la esquina superior derecha. La sesión se cierra sola a las 12 horas.</>,
        ]} />
      </Seccion>

      <Seccion id="atender" titulo="Cómo atender una solicitud">
        {gestiona ? (
          <>
            <p className="text-sm text-noche/80">Abra la solicitud. Encontrará el bloque <strong>Gestión</strong> para actuar sobre ella, y más abajo o al lado los datos, las notas y el historial.</p>
            <Pasos items={[
              <><strong>Contacte al cliente</strong> por teléfono, WhatsApp o correo. El plazo para el primer contacto es de {PLAZO_PRIMER_CONTACTO_H.cotizacion} horas en cotizaciones y {PLAZO_PRIMER_CONTACTO_H.emergencia} horas en emergencias; pasado el plazo, el caso se marca como vencido.</>,
              <><strong>Cambie el estado</strong>: en Gestión elija el estado nuevo, escriba el motivo si quiere y pulse «Cambiar estado». Todo queda en el historial.</>,
              <><strong>Asigne un responsable</strong> con «Asignar». A esa persona le llega un aviso.</>,
              <><strong>Anote lo que pase</strong> en Notas («Agregar nota»): qué dijo el cliente, qué se acordó, qué falta.</>,
              <><strong>Programe un seguimiento</strong> si debe volver a llamar: elija fecha y hora, escriba el motivo y pulse «Programar seguimiento». Cuando lo haga, márquelo como hecho.</>,
              <><strong>Adjunte documentos</strong> (cotizaciones, fotos, actas) con «Subir archivo». Cada archivo puede pesar hasta 10 MB.</>,
              <><strong>Cierre el caso</strong> cambiando el estado a uno final: Ganada, Perdida, Facturada o Descartada.</>,
            ]} />
          </>
        ) : (
          <p className="text-sm text-noche/80">
            Con el rol Lectura puede abrir cualquier solicitud y ver sus datos, notas, historial, seguimientos y adjuntos, pero no puede cambiarlos. Si necesita que algo se modifique, pídaselo a alguien de Gerencia, Comercial u Operaciones.
          </p>
        )}
        {!admin && u.rol !== "lectura" && (
          <p className="text-sm text-noche/70">
            Comercial y Operaciones gestionan por igual cotizaciones y emergencias: contactar al cliente, cambiar estados, anotar y hacer seguimiento. La atención técnica en sitio la coordina y ejecuta solo Operaciones.
          </p>
        )}
      </Seccion>

      <Seccion id="estados" titulo="Qué significa cada estado">
        <p className="text-sm text-noche/80">Cada tipo de solicitud tiene sus propios estados. Los que están al comienzo son los de trabajo; Ganada, Perdida, Facturada y Descartada cierran el caso.</p>
        <Lista items={[
          <><strong>Cotización:</strong> {flujo("cotizacion")}.</>,
          <><strong>Emergencia:</strong> {flujo("emergencia")}.</>,
          <><strong>Cierran el caso:</strong> Ganada, Perdida, Facturada y Descartada. «Resuelta» todavía no cierra, porque falta facturar.</>,
          <><strong>Descartada</strong> sirve para pruebas, duplicados o mensajes que no son una solicitud real.</>,
        ]} />
      </Seccion>

      <Seccion id="buscar" titulo="Buscar y filtrar">
        <Lista items={[
          <>En Solicitudes use el buscador para encontrar por nombre, empresa, teléfono, correo, texto del mensaje o número de caso (por ejemplo, #12).</>,
          <>Filtre por tipo, estado (también «Abiertas» o «Cerradas»), responsable o ciudad.</>,
          <>Si usa mucho una combinación de filtros, pulse «Guardar esta búsqueda», póngale nombre y quedará como un botón para volver a ella con un toque. Se borra con la X del botón.</>,
        ]} />
      </Seccion>

      <Seccion id="avisos" titulo="Avisos y recordatorios">
        <Lista items={[
          <>La campana muestra los avisos sin leer: solicitudes nuevas, casos que le asignan y seguimientos vencidos. Toque uno para ir directo al caso.</>,
          <>«Marcar todos como leídos» limpia la lista de una vez.</>,
          <>Cada mañana a las 8:00 recibe un resumen con sus seguimientos y casos vencidos.</>,
          <>Cada solicitud nueva, sea cotización o emergencia, avisa a Gerencia, Comercial y Operaciones.</>,
        ]} />
      </Seccion>

      <Seccion id="manta" titulo="Manta, su ayudante">
        <p className="text-sm text-noche/80">
          En la esquina inferior derecha está Manta. No es una inteligencia artificial que improvisa: responde con datos reales del portal a preguntas fijas.
        </p>
        <Lista items={[
          <>Pestaña <strong>Mi día</strong>: lo que tiene pendiente hoy.</>,
          <>Pestaña <strong>Preguntas</strong>: elija una, por ejemplo «¿Qué solicitudes siguen sin contactar?» o «¿Cómo programo un seguimiento?», y le responde con los casos y enlaces para abrirlos.</>,
        ]} />
      </Seccion>

      {admin && (
        <Seccion id="admin" titulo="Solo para Gerencia">
          <Lista items={[
            <><Link href="/portal/dashboard" className="font-semibold text-profundo underline">Dashboard</Link>: cuántas solicitudes llegan, de dónde, cuántas se ganan, cuánto tardan en atenderse, cómo va el chat de Manta y, cuando se conecte Google Analytics, las visitas del sitio. Arriba hay una lista «Para dejar todo listo» con lo que falta por configurar.</>,
            <><Link href="/portal/usuarios" className="font-semibold text-profundo underline">Usuarios</Link>: cree personas nuevas (reciben una contraseña temporal y deben cambiarla al entrar), cambie su rol, desactívelas o reinicie su contraseña si la olvidan.</>,
            <><Link href="/portal/ajustes" className="font-semibold text-profundo underline">Ajustes</Link>: correo de salida, destinatarios de avisos, Google Analytics y WhatsApp. Los cambios se aplican en menos de un minuto y las claves se guardan cifradas.</>,
            <>Roles: {Object.values(ROLES).map((r) => `${r.label} (${r.descripcion.toLowerCase()})`).join("; ")}.</>,
          ]} />
        </Seccion>
      )}

      <Seccion id="dudas" titulo="Preguntas frecuentes">
        <dl className="space-y-3 text-sm">
          {[
            ["Olvidé mi contraseña.", "Pídale a alguien de Gerencia que la reinicie en Usuarios. Recibirá una temporal y deberá cambiarla."],
            ["Escribí mal la contraseña varias veces y no me deja entrar.", "Tras 5 intentos fallidos, la cuenta se bloquea 15 minutos. Espere y vuelva a intentar."],
            ["No puedo cambiar el estado de una solicitud.", "Su rol solo permite consultar ese tipo de solicitud. Pídaselo a quien la gestiona o a Gerencia."],
            ["Un cliente me dice que envió una solicitud y no la veo.", "Revise que los filtros no estén ocultándola (botón para limpiarlos) y busque por su nombre o teléfono. Si no aparece, avise a Gerencia."],
            ["Me equivoqué al cambiar un estado.", "Vuelva a cambiarlo al correcto. El historial guarda ambos movimientos."],
          ].map(([q, a]) => (
            <div key={q}>
              <dt className="font-semibold text-noche">{q}</dt>
              <dd className="text-noche/80">{a}</dd>
            </div>
          ))}
        </dl>
      </Seccion>
    </div>
  );
}
