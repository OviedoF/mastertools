import Link from "next/link";
import clsx from "clsx";
import { CheckCircle2, ChevronDown, Circle, Rocket } from "lucide-react";
import { tarjeta } from "@/components/portal/ui";
import { mailConfigured } from "@/lib/mail";
import { ga4Configured } from "@/lib/portal/ga4";
import { query } from "@/lib/portal/db";
import { PLAZO_PRIMER_CONTACTO_H } from "@/lib/portal/model";
import { getSetting } from "@/lib/settings";
import { whatsappConfigurado } from "@/lib/whatsapp";

type Paso = {
  id: string;
  titulo: string;
  /** true = verificado por el sistema; false = falta; null = no se puede verificar, lo confirma una persona */
  listo: boolean | null;
  quien: string;
  resumen: string;
  pasos: string[];
  enlace?: { href: string; texto: string };
  doc?: string;
};

async function revisar(): Promise<Paso[]> {
  const [gaId, ga4, correo, destinos, wa, dominios, reales, recordatorios] = await Promise.all([
    getSetting("GA_MEASUREMENT_ID"),
    ga4Configured(),
    mailConfigured(),
    getSetting("MAIL_TO"),
    whatsappConfigurado(),
    getSetting("PORTAL_ALLOWED_DOMAINS"),
    query<{ n: number }>(`select count(*)::int as n from usuarios where activo and correo not like 'prueba.%'`).then((r) => r[0]?.n ?? 0).catch(() => 0),
    query<{ n: number }>(`select count(*)::int as n from recordatorios`).then((r) => r[0]?.n ?? 0).catch(() => 0),
  ]);
  const pooler = /-pooler\./.test(process.env.DATABASE_URL ?? "");

  return [
    {
      id: "clave", titulo: "Clave de cifrado de los secretos (SETTINGS_KEY)", listo: Boolean(process.env.SETTINGS_KEY),
      quien: "Desarrollo / quien administra Netlify",
      resumen: "Sin ella, los secretos que guarde en Ajustes se cifran con una clave derivada de la base de datos. Si algún día cambia la contraseña de la base, quedarían ilegibles.",
      pasos: [
        "Genere un texto largo y aleatorio (32 caracteres o más). Por ejemplo, en una terminal: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\".",
        "En Netlify: Site configuration > Environment variables > Add a variable. Nombre SETTINGS_KEY, valor el texto generado.",
        "Vuelva a publicar el sitio (Deploys > Trigger deploy).",
        "Guarde ese texto en un lugar seguro y no lo cambie. Hágalo ANTES de cargar claves en Ajustes; si ya cargó alguna, vuelva a guardarla después.",
      ],
      doc: "docs/AJUSTES.md, sección Seguridad",
    },
    {
      id: "base", titulo: "Conexión a la base de datos con pooler", listo: pooler,
      quien: "Desarrollo / quien administra Netlify",
      resumen: "En Netlify el sitio debe usar la cadena de conexión «pooled» de Neon (el host lleva -pooler). La directa se agota con varias visitas simultáneas.",
      pasos: [
        "En Neon: su proyecto > Connect > active «Connection pooling» y copie la cadena (el host contiene -pooler).",
        "En Netlify: Environment variables > DATABASE_URL con esa cadena. Para crear tablas desde su computador use la cadena directa, no esta.",
        "Vuelva a publicar el sitio.",
      ],
    },
    {
      id: "dominios", titulo: "Dominios de correo permitidos", listo: Boolean(dominios),
      quien: "Gerencia",
      resumen: "Define qué correos pueden tener usuario en el portal. Sin esto no se pueden crear usuarios reales de la empresa.",
      pasos: ["Abra Ajustes > Acceso.", "En «Dominios permitidos» escriba, por ejemplo, mastertools.tech (varios, separados por coma).", "Guarde."],
      enlace: { href: "/portal/ajustes", texto: "Ir a Ajustes" },
    },
    {
      id: "usuarios", titulo: "Usuarios reales del equipo", listo: reales > 0,
      quien: "Gerencia",
      resumen: `Hoy solo hay usuarios de prueba${reales ? ` (hay ${reales} real${reales === 1 ? "" : "es"})` : ""}. Antes de entregar, cree los de la empresa y desactive los de prueba.`,
      pasos: [
        "Abra Usuarios > Nuevo usuario. Escriba nombre, correo de la empresa y rol (Gerencia, Comercial, Operaciones o Lectura).",
        "El sistema entrega una contraseña temporal; pásela a la persona por un canal privado. Se le pedirá cambiarla al primer ingreso.",
        "Desactive los usuarios «prueba.…» en la misma pantalla.",
        "Mantenga pocos usuarios con rol Gerencia: es el único que ve Dashboard, Usuarios y Ajustes.",
      ],
      enlace: { href: "/portal/usuarios", texto: "Ir a Usuarios" },
    },
    {
      id: "correo", titulo: "Correo de salida y destinatarios", listo: Boolean(correo && destinos),
      quien: "Gerencia",
      resumen: "Con esto el sitio avisa por correo cada cotización y emergencia, y confirma al cliente. Si no está, las solicitudes igual llegan al portal.",
      pasos: [
        "En Zoho Mail cree una contraseña de aplicación (Cuenta > Seguridad > Contraseñas de aplicación).",
        "Ajustes > Correo de salida: servidor smtppro.zoho.com, puerto 465, usuario, contraseña de aplicación y nombre.",
        "Ajustes > Destinatarios: quién recibe cotizaciones y quién emergencias.",
        "Pulse «Probar conexión con el correo». Verifica las credenciales sin enviar nada.",
      ],
      enlace: { href: "/portal/ajustes", texto: "Ir a Ajustes" },
      doc: "docs/AJUSTES.md",
    },
    {
      id: "ga", titulo: "Google Analytics: medición del sitio", listo: Boolean(gaId),
      quien: "Gerencia con una cuenta de Google de la empresa",
      resumen: "Activa el conteo de visitas, orígenes de tráfico y clics. Sin el ID de medición el sitio no envía datos.",
      pasos: [
        "En analytics.google.com cree una cuenta y una propiedad GA4 para el sitio.",
        "Cree un flujo de datos Web con la dirección del sitio y copie el ID de medición (G-XXXXXXXXXX).",
        "Ajustes > Google Analytics: pegue el ID y guarde. En unos minutos el sitio empieza a enviar visitas.",
      ],
      enlace: { href: "/portal/ajustes", texto: "Ir a Ajustes" },
      doc: "docs/GA4.md",
    },
    {
      id: "ga4", titulo: "Google Analytics: lectura de datos en este dashboard", listo: ga4,
      quien: "Gerencia con una cuenta de Google de la empresa",
      resumen: "Permite que este dashboard muestre el tráfico del sitio (sección «Tráfico del sitio»).",
      pasos: [
        "En console.cloud.google.com cree un proyecto y active la API «Google Analytics Data API».",
        "Cree una cuenta de servicio, genere una clave en formato JSON y descárguela.",
        "En Google Analytics: Administrar > Acceso a la propiedad > agregue el correo de la cuenta de servicio con rol «Lector».",
        "Ajustes > Google Analytics: cargue el ID de la propiedad (solo números), el correo de la cuenta de servicio y la clave privada (el campo private_key del JSON).",
        "Pulse «Probar conexión con Google Analytics». Debe mostrar los visitantes de los últimos 7 días.",
        "Borre el archivo JSON descargado.",
      ],
      enlace: { href: "/portal/ajustes", texto: "Ir a Ajustes" },
      doc: "docs/GA4.md",
    },
    {
      id: "wa", titulo: "Aviso de emergencias por WhatsApp", listo: wa,
      quien: "Gerencia con la cuenta de Meta de la empresa",
      resumen: "Envía un WhatsApp al equipo de turno con cada emergencia nueva. La plantilla puede tardar de horas a un par de días en aprobarse, así que conviene empezar pronto. Mientras tanto funcionan el correo y los avisos del portal.",
      pasos: [
        "Cree o verifique la cuenta de Meta Business a nombre de la empresa y un número dedicado que no esté activo en WhatsApp normal.",
        "En developers.facebook.com cree una app tipo Empresa y agregue el producto WhatsApp. Copie el identificador del número.",
        "Cree un usuario del sistema y genere un token permanente (sin vencimiento) con permisos de mensajería.",
        "Cree la plantilla «aviso_emergencia» (categoría Utilidad, español) con una sola variable {{1}} y espere su aprobación.",
        "Ajustes > Aviso de emergencias por WhatsApp: cargue número, token, plantilla, idioma y los números que reciben el aviso.",
        "Pulse «Enviar mensaje de prueba por WhatsApp».",
      ],
      enlace: { href: "/portal/ajustes", texto: "Ir a Ajustes" },
      doc: "docs/WHATSAPP.md",
    },
    {
      id: "plazos", titulo: "Plazos de primer contacto", listo: null,
      quien: "Gerencia (confirmar con el cliente)",
      resumen: `El portal marca como vencida una solicitud sin primer contacto pasadas ${PLAZO_PRIMER_CONTACTO_H.cotizacion} h en cotizaciones y ${PLAZO_PRIMER_CONTACTO_H.emergencia} h en emergencias. Son valores propuestos, no acordados.`,
      pasos: [
        "Confirme con la gerencia que esos plazos son los que quiere cumplir.",
        "Si cambian, avise a desarrollo: se modifican en src/lib/portal/model.ts (PLAZO_PRIMER_CONTACTO_H) y se vuelve a publicar.",
      ],
    },
    {
      id: "recordatorio", titulo: "Resumen diario de las 8:00 a. m.", listo: recordatorios > 0 ? true : null,
      quien: "Desarrollo",
      resumen: "Cada mañana (hora de Bogotá) el portal avisa a cada persona cuántos seguimientos y casos vencidos tiene. Lo ejecuta una función programada de Netlify que no se puede probar antes de publicar.",
      pasos: [
        "Después de publicar, espere a la mañana siguiente.",
        "En Netlify: Logs > Functions > «recordatorios». Debe haber una ejecución a las 13:00 UTC con respuesta 200.",
        "Si no aparece, use el botón «Enviar ahora el recordatorio de seguimientos» en Ajustes para verificar que el resto funciona, y revise que la función esté desplegada.",
        "Este punto se marca solo cuando el sistema registra el primer resumen enviado.",
      ],
      enlace: { href: "/portal/ajustes", texto: "Ir a Ajustes" },
    },
    {
      id: "recorrido", titulo: "Recorrido final con usuarios reales", listo: null,
      quien: "Quien entrega el proyecto",
      resumen: "Hay pruebas que solo se hacen con el sitio publicado y las cuentas reales.",
      pasos: [
        "Envíe una cotización y una emergencia desde el sitio público y confirme que llegan al portal, al correo y (si está activo) a WhatsApp.",
        "Asigne el caso a otra persona, agregue una nota, un adjunto y un seguimiento; confirme que el aviso le aparece a quien corresponde.",
        "Abra el portal desde un celular y compruebe que se puede leer y operar.",
        "Descargue un adjunto y verifique que el archivo abre bien.",
        "Entre con un usuario de cada rol y confirme que solo ve lo que le corresponde.",
      ],
    },
  ];
}

export async function PuestaEnMarcha() {
  const pasos = await revisar();
  const listos = pasos.filter((p) => p.listo === true).length;
  const pendientes = pasos.length - listos;
  const abierto = pendientes > 0;

  return (
    <section className={clsx(tarjeta, "border-2 border-profundo/25")} aria-label="Puesta en marcha">
      <details open={abierto} className="group">
        <summary className="flex cursor-pointer list-none items-start gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-claro text-profundo"><Rocket className="size-6" aria-hidden="true" /></span>
          <span className="min-w-0 flex-1">
            <span className="font-display block text-xl font-extrabold text-noche">Puesta en marcha: lo que falta para operar con datos reales</span>
            <span className="block text-sm text-noche/75">
              {abierto
                ? `Faltan ${pendientes} de ${pasos.length} pasos. Cada uno tiene su guía; los marcados con un círculo se verifican solos o los confirma una persona.`
                : "Todo está en marcha. Puede cerrar esta sección."}
            </span>
            <span className="mt-2 block h-2 rounded-full bg-niebla" aria-hidden="true">
              <span className="block h-2 rounded-full bg-profundo" style={{ width: `${(listos / pasos.length) * 100}%` }} />
            </span>
            <span className="mt-1 block text-xs font-semibold text-gris">{listos} de {pasos.length} listos</span>
          </span>
          <ChevronDown className="mt-1 size-5 shrink-0 text-gris transition group-open:rotate-180" aria-hidden="true" />
        </summary>

        <ol className="mt-5 space-y-3">
          {pasos.map((p, i) => (
            <li key={p.id} className="rounded-xl bg-niebla/60">
              <details open={p.listo !== true && i < 3}>
                <summary className="flex cursor-pointer list-none items-center gap-3 p-4">
                  {p.listo ? <CheckCircle2 className="size-5 shrink-0 text-emerald-700" aria-label="Listo" /> : <Circle className="size-5 shrink-0 text-gris" aria-label={p.listo === null ? "Por confirmar" : "Pendiente"} />}
                  <span className="min-w-0 flex-1">
                    <span className={clsx("block text-sm font-semibold", p.listo ? "text-noche/70" : "text-noche")}>{i + 1}. {p.titulo}</span>
                    <span className="block text-xs text-gris">{p.listo ? "Listo" : p.listo === null ? "Por confirmar" : "Pendiente"} · Responsable: {p.quien}</span>
                  </span>
                  <ChevronDown className="size-4 shrink-0 text-gris" aria-hidden="true" />
                </summary>
                <div className="space-y-3 px-4 pb-4 pl-12">
                  <p className="text-sm text-noche/80">{p.resumen}</p>
                  <ol className="list-decimal space-y-1.5 pl-5 text-sm text-noche">
                    {p.pasos.map((s) => <li key={s}>{s}</li>)}
                  </ol>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    {p.enlace && <Link href={p.enlace.href} className="font-semibold text-profundo underline">{p.enlace.texto}</Link>}
                    {p.doc && <span className="text-gris">Guía completa: {p.doc}</span>}
                  </div>
                </div>
              </details>
            </li>
          ))}
        </ol>
      </details>
    </section>
  );
}
