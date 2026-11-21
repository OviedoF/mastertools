import clsx from "clsx";
import { CheckCircle2, ChevronDown, Circle, ClipboardCheck } from "lucide-react";
import { botonSuave, fechaHora, tarjeta } from "@/components/portal/ui";
import { mailConfigured } from "@/lib/mail";
import { marcarPasoAction } from "@/lib/portal/actions";
import { query } from "@/lib/portal/db";
import { ga4Configured } from "@/lib/portal/ga4";
import { PLAZO_PRIMER_CONTACTO_H } from "@/lib/portal/model";
import { getSetting } from "@/lib/settings";
import { whatsappConfigurado } from "@/lib/whatsapp";

/**
 * Lista para la gerencia, en lenguaje llano: qué datos o decisiones necesita el equipo de desarrollo y cómo
 * conseguirlos. Lo técnico (variables, servidores, claves del sistema) lo hace el equipo y no aparece aquí.
 * Un paso se marca solo cuando el sistema lo puede comprobar; si no, lo marca una persona con el botón.
 */
type Paso = {
  id: string;
  titulo: string;
  paraQue: string;
  /** Pasos para que el cliente consiga el dato. */
  como: string[];
  /** Exactamente qué debe enviarnos. */
  enviar: string[];
  nota?: string;
  /** true = el sistema lo comprobó */
  auto: boolean;
};

type Marca = { paso: string; hecho_en: Date; nombre: string | null };

async function revisar() {
  const [gaId, ga4, correo, destinos, wa, reales, marcas] = await Promise.all([
    getSetting("GA_MEASUREMENT_ID"),
    ga4Configured(),
    mailConfigured(),
    getSetting("MAIL_TO"),
    whatsappConfigurado(),
    query<{ n: number }>(`select count(*)::int as n from usuarios where activo and correo not like 'prueba.%'`).then((r) => r[0]?.n ?? 0).catch(() => 0),
    query<Marca>(`select p.paso, p.hecho_en, u.nombre from puesta_en_marcha p left join usuarios u on u.id = p.hecho_por`).catch(() => [] as Marca[]),
  ]);

  const pasos: Paso[] = [
    {
      id: "correos", titulo: "Correos que reciben los avisos", auto: Boolean(correo && destinos),
      paraQue: "Cada vez que un cliente pide una cotización o reporta una emergencia, llega un correo al equipo y una confirmación al cliente.",
      como: [
        "Decida qué correos van a recibir las cotizaciones y cuáles las emergencias. Pueden ser los mismos y puede haber varios.",
        "Entre a su cuenta de Zoho (accounts.zoho.com) con el buzón desde el que salen los mensajes a los clientes, hoy negocios@mastertools.tech. Si ya está en Zoho Mail, pulse su foto o inicial arriba a la derecha y elija «Mi cuenta».",
        "Vaya a la sección «Seguridad» y busque «Contraseñas de aplicación» (App passwords).",
        "Pulse «Generar nueva contraseña», escriba un nombre como «Sitio web» y pulse «Generar».",
        "Copie la contraseña que aparece. Zoho no la vuelve a mostrar. Si algún espacio quedó entre los caracteres, no importa: nosotros lo ajustamos.",
      ],
      enviar: [
        "El buzón desde el que se envían los correos (por ejemplo, negocios@mastertools.tech).",
        "La contraseña de aplicación generada en el paso anterior (nunca la contraseña normal del buzón).",
        "Lista de correos que reciben las cotizaciones.",
        "Lista de correos que reciben las emergencias.",
      ],
      nota: "Envíenos la contraseña solo por mensaje directo, nunca en un grupo, y bórrela del chat después. Si el correo no está, las solicitudes igual llegan al portal.",
    },
    {
      id: "equipo", titulo: "Las personas que usarán el portal", auto: reales > 0,
      paraQue: "Cada persona entra con su propio correo y ve lo que le corresponde.",
      como: [
        "Haga una lista de las personas que van a usar el portal.",
        "Para cada una, decida su papel: Gerencia (ve todo, incluido el dashboard, los usuarios y los ajustes), Comercial y Operaciones (ambos gestionan cotizaciones y emergencias; solo Operaciones ejecuta la atención técnica) o Lectura (solo consulta).",
        "Use siempre correos de la empresa (terminados en @mastertools.tech).",
      ],
      enviar: ["Por cada persona: nombre completo, correo de la empresa y papel (Gerencia, Comercial, Operaciones o Lectura)."],
      nota: "Nosotros creamos las cuentas y le damos a cada persona una contraseña temporal; el sistema le pide cambiarla al primer ingreso. En ese momento desactivamos las cuentas de prueba.",
    },
    {
      id: "visitas", titulo: "Estadísticas de visitas del sitio (Google Analytics)", auto: Boolean(gaId && ga4),
      paraQue: "Muestra en este dashboard cuántas personas visitan el sitio, cuánto tiempo se quedan, qué páginas ven y de dónde llegan.",
      como: [
        "Entre a analytics.google.com con una cuenta de Google de la empresa (un Gmail creado para la empresa o una cuenta de Google Workspace). Esa cuenta será la dueña de los datos.",
        "Si es la primera vez, pulse «Empezar a medir» y cree una cuenta con el nombre de la empresa. Después cree una propiedad: nombre «Master Tools», zona horaria Colombia y moneda peso colombiano.",
        "Cuando le pregunte por la plataforma, elija «Web» y escriba la dirección del sitio (mastertools.tech). Copie el «ID de medición», que empieza por G- (por ejemplo, G-AB12CD34EF). También se ve en Administrar > Flujos de datos, al abrir el flujo web.",
        "Busque el «ID de la propiedad»: son solo números. Está en Administrar > Configuración de la propiedad (Detalles de la propiedad).",
        "Cuando le enviemos un correo de «cuenta de servicio» (termina en .iam.gserviceaccount.com), entre a Administrar > Administración del acceso a la propiedad, pulse «+» > «Añadir usuarios», pegue ese correo, elija el rol «Lector» y guarde.",
      ],
      enviar: [
        "El ID de medición (G-…).",
        "El ID de la propiedad (números).",
        "Confirmación de que agregó como Lector el correo de cuenta de servicio que le enviamos.",
      ],
      nota: "Nosotros le enviamos ese correo de cuenta de servicio en cuanto tengamos los dos IDs. Mientras no esté, el resto del dashboard (solicitudes, casos y Manta) funciona normal.",
    },
    {
      id: "whatsapp", titulo: "Aviso de emergencias por WhatsApp", auto: wa,
      paraQue: "Cada emergencia nueva le llega por WhatsApp al equipo de turno, además del correo y el portal. Es opcional.",
      como: [
        "El número de los avisos es el +57 312 425 9438. No puede estar en uso en la aplicación de WhatsApp o WhatsApp Business: si ya la tiene instalada con ese número, hay que eliminar esa cuenta antes.",
        "Entre a business.facebook.com con una cuenta de Facebook de la persona responsable y cree el «Portafolio comercial» (Business Manager) de Master Tools, si todavía no existe.",
        "En Configuración del negocio > Usuarios > Personas, pulse «Agregar» y escriba el correo que le indiquemos. Déle acceso total. Así nosotros hacemos la configuración técnica sin que usted tenga que hacerla.",
        "Para que Meta deje enviar mensajes a mayor escala, puede pedir la verificación de la empresa en Configuración del negocio > Centro de seguridad. Tiene que subir documentos de la empresa; Meta tarda unos días en responder.",
        "Cargue los números del equipo de turno en Ajustes > WhatsApp > «Números que reciben el aviso». Puede elegir si cada uno recibe siempre o solo fuera de horario.",
      ],
      enviar: [
        "Confirmación de que el número de los avisos (+57 312 425 9438) no está en uso en la app de WhatsApp.",
        "Confirmación de que ya nos agregó como administradores en su cuenta de Meta Business.",
      ],
      nota: "Meta tiene que aprobar el texto del mensaje, y eso puede tardar de unas horas a un par de días. Sin esto, los avisos siguen llegando por correo y por el portal.",
    },
    {
      id: "plazos", titulo: "Plazos para contestar a un cliente", auto: false,
      paraQue: "El portal marca en rojo una solicitud que lleva demasiado tiempo sin atender.",
      como: [
        `Hoy el plazo es de ${PLAZO_PRIMER_CONTACTO_H.cotizacion} horas para cotizaciones y de ${PLAZO_PRIMER_CONTACTO_H.emergencia} horas para emergencias.`,
        "Piense si el equipo puede cumplirlos de verdad. Un plazo que nunca se cumple deja todo en rojo y deja de servir.",
      ],
      enviar: ["Si los plazos le sirven así, o cuáles quiere en su lugar."],
    },
    {
      id: "prueba", titulo: "Prueba final con casos reales", auto: false,
      paraQue: "Comprobar juntos que todo funciona como lo espera antes de usarlo con clientes.",
      como: [
        "Reserve un rato con el equipo, de preferencia con todas las personas conectadas.",
        "Envíe desde el sitio una cotización y una emergencia de prueba, y vea cómo llegan al portal, al correo y a WhatsApp.",
        "Que cada persona entre con su cuenta, también desde el celular, y confirme que ve lo suyo.",
      ],
      enviar: ["Una fecha y hora que le sirva, para hacerla juntos."],
    },
  ];

  const mapa = new Map(marcas.map((m) => [m.paso, m]));
  return pasos.map((p) => ({ ...p, marca: mapa.get(p.id) ?? null, listo: p.auto || mapa.has(p.id) }));
}

export async function PuestaEnMarcha() {
  const pasos = await revisar();
  const listos = pasos.filter((p) => p.listo).length;
  const faltan = pasos.length - listos;

  return (
    <section className={clsx(tarjeta, "border-2 border-profundo/25")} aria-label="Para dejar todo listo">
      <details open={faltan > 0}>
        <summary className="flex cursor-pointer list-none items-start gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-claro text-profundo"><ClipboardCheck className="size-6" aria-hidden="true" /></span>
          <span className="min-w-0 flex-1">
            <span className="font-display block text-xl font-extrabold text-noche">Para dejar todo listo</span>
            <span className="block text-sm text-noche/75">
              {faltan > 0
                ? `El portal ya funciona. Para usarlo con datos reales nos faltan ${faltan === 1 ? "este paso" : `estos ${faltan} pasos`}. Abra cada uno: dice cómo conseguir el dato y qué enviarnos. Cuando nos lo envíe, nosotros lo cargamos y el paso se marca como hecho.`
                : "Todo está listo. Gracias."}
            </span>
            <span className="mt-2 block h-2 rounded-full bg-niebla" aria-hidden="true">
              <span className="block h-2 rounded-full bg-profundo" style={{ width: `${(listos / pasos.length) * 100}%` }} />
            </span>
            <span className="mt-1 block text-xs font-semibold text-gris">{listos} de {pasos.length} listos</span>
          </span>
          <ChevronDown className="mt-1 size-5 shrink-0 text-gris" aria-hidden="true" />
        </summary>

        <ul className="mt-5 space-y-3">
          {pasos.map((p) => (
            <li key={p.id} className="rounded-xl bg-niebla/60">
              <details open={!p.listo}>
                <summary className="flex cursor-pointer list-none items-center gap-3 p-4">
                  {p.listo ? <CheckCircle2 className="size-5 shrink-0 text-emerald-700" aria-label="Listo" /> : <Circle className="size-5 shrink-0 text-gris" aria-label="Pendiente" />}
                  <span className="min-w-0 flex-1">
                    <span className={clsx("block text-sm font-semibold", p.listo ? "text-noche/70" : "text-noche")}>{p.titulo}</span>
                    <span className="block text-xs text-gris">
                      {p.auto ? "Listo (el sistema lo comprobó)" : p.marca ? `Listo · marcado por ${p.marca.nombre ?? "el equipo"} el ${fechaHora(p.marca.hecho_en)}` : "Pendiente"}
                    </span>
                  </span>
                  <ChevronDown className="size-4 shrink-0 text-gris" aria-hidden="true" />
                </summary>
                <div className="space-y-4 px-4 pb-4 pl-12">
                  <p className="text-sm text-noche/80"><span className="font-semibold text-noche">Para qué sirve:</span> {p.paraQue}</p>
                  <div>
                    <p className="text-sm font-semibold text-noche">Cómo conseguirlo, paso a paso</p>
                    <ol className="mt-1 list-decimal space-y-1.5 pl-5 text-sm text-noche">
                      {p.como.map((s) => <li key={s}>{s}</li>)}
                    </ol>
                  </div>
                  <div className="rounded-lg bg-white p-3">
                    <p className="text-sm font-semibold text-noche">Qué nos tiene que enviar</p>
                    <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-noche">
                      {p.enviar.map((s) => <li key={s}>{s}</li>)}
                    </ul>
                  </div>
                  {p.nota && <p className="text-sm text-noche/70">{p.nota}</p>}
                  {!p.auto && (
                    <form action={marcarPasoAction}>
                      <input type="hidden" name="paso" value={p.id} />
                      <input type="hidden" name="hecho" value={p.marca ? "0" : "1"} />
                      <button className={botonSuave}>{p.marca ? "Quitar el check" : "Marcar como hecho"}</button>
                    </form>
                  )}
                </div>
              </details>
            </li>
          ))}
        </ul>
      </details>
    </section>
  );
}
