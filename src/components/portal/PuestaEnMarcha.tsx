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
 * Lista para la gerencia, en lenguaje llano: qué datos o decisiones necesita el equipo de desarrollo
 * para dejar todo funcionando. Lo técnico (claves, servidores, variables) lo hace el equipo y no aparece aquí.
 * Un paso se marca solo cuando el sistema lo puede comprobar; si no, lo marca una persona con el botón.
 */
type Paso = {
  id: string;
  titulo: string;
  paraQue: string;
  necesitamos: string[];
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
      paraQue: "Cada vez que un cliente pide una cotización o reporta una emergencia, le llega un correo al equipo y una confirmación al cliente.",
      necesitamos: [
        "Qué correos deben recibir las cotizaciones y cuáles las emergencias (pueden ser varios).",
        "Desde qué buzón de la empresa salen los mensajes a los clientes (hoy negocios@mastertools.tech).",
        "La contraseña de aplicación de ese buzón: se genera en Zoho, en Seguridad > Contraseñas de aplicación. No nos envíe la contraseña normal.",
      ],
      nota: "Si esto no está, igual todas las solicitudes llegan al portal; solo faltaría el aviso por correo.",
    },
    {
      id: "equipo", titulo: "Las personas que usarán el portal", auto: reales > 0,
      paraQue: "Cada persona entra con su propio correo y ve lo que le corresponde.",
      necesitamos: [
        "Nombre y correo de la empresa de cada persona.",
        "Qué papel tiene cada una: Gerencia (ve todo, incluido este dashboard y los ajustes), Comercial (atiende cotizaciones), Operaciones (atiende emergencias) o Lectura (solo consulta).",
      ],
      nota: "Nosotros las creamos y le entregamos una contraseña temporal a cada una; el sistema le pide cambiarla al primer ingreso. Las cuentas de prueba se desactivan en ese momento.",
    },
    {
      id: "visitas", titulo: "Estadísticas de visitas del sitio (Google Analytics)", auto: Boolean(gaId && ga4),
      paraQue: "Muestra en este dashboard cuántas personas visitan el sitio, cuánto tiempo se quedan, qué páginas ven y de dónde llegan.",
      necesitamos: [
        "Una cuenta de Google a nombre de la empresa (puede ser un Gmail nuevo o uno de Google Workspace).",
        "Que nos dé acceso de administrador a esa cuenta para crear la propiedad y conectarla. Después puede quitarnos el acceso.",
      ],
      nota: "Mientras no esté, el resto del dashboard (solicitudes, casos y Manta) funciona normal.",
    },
    {
      id: "whatsapp", titulo: "Aviso de emergencias por WhatsApp", auto: wa,
      paraQue: "Cada emergencia nueva le llega por WhatsApp al equipo de turno, además del correo y el portal.",
      necesitamos: [
        "Un número de teléfono exclusivo para los avisos, que no esté usando WhatsApp hoy (puede ser una línea nueva).",
        "Los números del equipo de turno que recibirán el aviso.",
        "Una cuenta de Meta Business de la empresa, o que nos permita ayudarle a crearla.",
      ],
      nota: "Meta tiene que aprobar el mensaje y eso puede tardar de unas horas a un par de días. Es opcional: sin esto los avisos siguen llegando por correo y por el portal.",
    },
    {
      id: "plazos", titulo: "Plazos para contestar a un cliente", auto: false,
      paraQue: "El portal marca en rojo una solicitud que lleva demasiado tiempo sin atender.",
      necesitamos: [
        `¿Le sirven estos plazos? Cotizaciones: ${PLAZO_PRIMER_CONTACTO_H.cotizacion} horas. Emergencias: ${PLAZO_PRIMER_CONTACTO_H.emergencia} hora.`,
        "Si quiere otros, díganos cuáles y los cambiamos.",
      ],
    },
    {
      id: "prueba", titulo: "Prueba final con casos reales", auto: false,
      paraQue: "Comprobar juntos que todo funciona como lo espera antes de usarlo con clientes.",
      necesitamos: [
        "Un rato para enviar una cotización y una emergencia de prueba desde el sitio y ver cómo llegan al portal, al correo y a WhatsApp.",
        "Que cada persona del equipo entre con su cuenta, también desde el celular, y confirme que ve lo suyo.",
      ],
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
                ? `El portal ya funciona. Para usarlo con datos reales nos faltan ${faltan === 1 ? "este dato" : `estos ${faltan} datos`} suyos. Cuando nos los envíe, nosotros los cargamos y el paso se marca como hecho.`
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
                <div className="space-y-3 px-4 pb-4 pl-12">
                  <p className="text-sm text-noche/80"><span className="font-semibold text-noche">Para qué sirve:</span> {p.paraQue}</p>
                  <div>
                    <p className="text-sm font-semibold text-noche">Qué necesitamos de usted</p>
                    <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-noche">
                      {p.necesitamos.map((s) => <li key={s}>{s}</li>)}
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
