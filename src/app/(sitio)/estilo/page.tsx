/* eslint-disable @next/next/no-img-element -- página interna de referencia */
import type { Metadata } from "next";
import Image from "next/image";
import {
  Activity,
  ArrowRight,
  Gauge,
  Phone,
  ShieldCheck,
  Sun,
  TriangleAlert,
  Wrench,
  Zap,
} from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Logo, Isotipo } from "@/components/ui/Logo";
import { WhatsAppIcon } from "@/components/ui/Icons";
import { Pending } from "@/components/ui/Pending";
import { Orbit } from "@/components/ui/Orbit";
import { ServiceCard } from "@/components/home/ServicesGrid";
import { services } from "@/content/services";

export const metadata: Metadata = {
  title: "Guía de estilo (interna)",
  robots: { index: false, follow: false },
};

const colors = [
  { name: "Azul Master", hex: "#00AEEF", cls: "bg-master", text: "text-noche", use: "Logo, acentos, íconos, enlaces sobre oscuro. Nunca con texto blanco encima (2,5:1)." },
  { name: "Azul Profundo", hex: "#0066B2", cls: "bg-profundo", text: "text-white", use: "Botones, enlaces, títulos secundarios. Blanco encima: 5,9:1." },
  { name: "Azul Noche", hex: "#0B1F4D", cls: "bg-noche", text: "text-white", use: "Fondos institucionales, títulos y texto. Blanco encima: 15,9:1." },
  { name: "Azul Claro", hex: "#CFEFFF", cls: "bg-claro", text: "text-noche", use: "Fondos suaves, etiquetas, tarjetas. Noche encima: 13,2:1." },
  { name: "Gris Técnico", hex: "#8A8F98", cls: "bg-gris", text: "text-white", use: "Engranajes del logo, textos de apoyo grandes. Solo títulos grandes sobre blanco (3,2:1)." },
  { name: "Amarillo Alerta", hex: "#FFC21A", cls: "bg-alerta", text: "text-noche", use: "Solo emergencias y advertencias. Noche encima: 9,9:1." },
  { name: "Niebla", hex: "#F4F7FB", cls: "bg-niebla ring-1 ring-noche/10", text: "text-noche", use: "Fondo alterno casi blanco para dar ritmo entre secciones." },
];

const moods = ["feliz", "contento", "pensativo", "serio"] as const;

function Block({ title, children, note }: { title: string; children: React.ReactNode; note?: string }) {
  return (
    <section className="border-t border-noche/10 py-12">
      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <div>
          <h2 className="h3 text-noche">{title}</h2>
          {note && <p className="mt-2 text-sm text-noche/60">{note}</p>}
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}

export default function StylePage() {
  return (
    <div className="container-x py-12">
      <p className="eyebrow text-profundo">Documento interno · no se publica</p>
      <h1 className="h1 mt-3 text-noche">Guía de estilo de la web</h1>
      <p className="lead mt-4 max-w-2xl">
        Cómo se traduce el Manual de marca v1.2 a la pantalla. Todo lo que ve
        en el sitio hereda de estas piezas: si algo se corrige aquí, se corrige
        en todas las páginas.
      </p>

      <Block title="Logotipo" note="Mínimo 160 px en el encabezado móvil. Debajo de 140 px, isotipo.">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="card flex items-center justify-center p-8"><Logo withLink={false} width={200} /></div>
          <div className="flex items-center justify-center rounded-card bg-noche p-8"><Logo withLink={false} variant="negativo" width={200} /></div>
          <div className="card flex items-center justify-center gap-6 p-8">
            <Isotipo size={56} />
            <Isotipo size={32} />
            <Isotipo size={16} />
            <img src="/marca/favicon.svg" alt="" width={32} height={32} className="rounded-md" />
          </div>
        </div>
        <div className="relative mt-4 h-40 overflow-hidden rounded-card bg-niebla">
          <Orbit className="absolute -top-24 -right-16 w-[520px] text-master/30" />
          <p className="absolute bottom-4 left-5 text-sm text-noche/60">La elipse como recurso gráfico, recortada por el borde. Se dibuja al entrar en pantalla.</p>
        </div>
      </Block>

      <Block title="Color" note="Proporción: 55 % blanco y Niebla, 25 % Noche, 12 % Master, 5 % Profundo, 3 % Alerta.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {colors.map((c) => (
            <div key={c.hex} className="card overflow-hidden">
              <div className={`${c.cls} ${c.text} flex h-24 items-end p-4 font-display font-bold`}>{c.hex}</div>
              <div className="p-4">
                <p className="font-display font-bold text-noche">{c.name}</p>
                <p className="mt-1 text-sm text-noche/70">{c.use}</p>
              </div>
            </div>
          ))}
        </div>
      </Block>

      <Block title="Tipografía" note="Montserrat para títulos, botones y cifras. Inter para textos. Títulos en minúscula con mayúscula inicial.">
        <div className="grid gap-6">
          <div><p className="small text-noche/50">Título 1 · 32 / 48 px · Montserrat 800</p><p className="h1">Atención de emergencias eléctricas</p></div>
          <div><p className="small text-noche/50">Título 2 · 24 / 32 px · Montserrat 700</p><p className="h2">Sistemas de medida Nivel II</p></div>
          <div><p className="small text-noche/50">Título 3 · 19 / 22 px · Montserrat 700</p><p className="h3">Cambio de comercializador</p></div>
          <div><p className="small text-noche/50">Texto · 16 / 17 px · Inter 400 · interlineado 1,6 · máx. 75 caracteres</p><p className="prose-mt">Normalizamos el sistema de medida para que la transición de comercializador se haga sin cortes y conforme a la norma.</p></div>
          <div><p className="small text-noche/50">Texto chico · 14 px · Inter 400</p><p className="small">Atención en Atlántico, Bolívar, Magdalena, Cesar, Córdoba y Sucre.</p></div>
          <div><p className="small text-noche/50">Cifra destacada · Montserrat 800</p><p className="font-display text-5xl font-extrabold tracking-tight text-profundo">+350</p></div>
          <div><p className="small text-noche/50">Antetítulo</p><p className="eyebrow text-profundo">Doce líneas de servicio</p></div>
        </div>
      </Block>

      <Block title="Botones" note="16 px Montserrat 600, alto mínimo 48 px. Siempre los mismos nombres: Solicitar cotización, Reportar emergencia, Escribir por WhatsApp, Ver proyectos.">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Solicitar cotización</Button>
          <Button variant="emergency"><Phone className="size-5" />Reportar emergencia</Button>
          <Button variant="outline"><WhatsAppIcon />Escribir por WhatsApp</Button>
          <Button variant="ghost">Ver proyectos <ArrowRight className="size-5" /></Button>
          <Button size="sm">Cotizar</Button>
          <Button size="lg">Enviar solicitud</Button>
          <Button disabled>Enviando…</Button>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-card bg-noche p-6">
          <Button variant="white">Conocer el servicio</Button>
          <Button variant="outline-white"><WhatsAppIcon />Escribir por WhatsApp</Button>
          <Button variant="emergency"><Phone className="size-5" />Llamar ahora</Button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="chip chip-claro">Medida</span>
          <span className="chip chip-noche">Alto nivel técnico</span>
          <span className="chip chip-alerta">Emergencia</span>
          <Pending inline>dato por completar</Pending>
        </div>
      </Block>

      <Block title="Íconos" note="Lucide, trazo 1,75 px, esquinas redondeadas. El rayo es para ingeniería y potencia; emergencias usa el triángulo y el Amarillo Alerta.">
        <div className="flex flex-wrap gap-4">
          {[Zap, Gauge, Sun, Wrench, Activity, ShieldCheck].map((Icon, i) => (
            <span key={i} className="icon-circle"><Icon className="size-6" strokeWidth={1.75} /></span>
          ))}
          <span className="inline-flex size-12 items-center justify-center rounded-full bg-alerta text-noche"><TriangleAlert className="size-6" strokeWidth={1.75} /></span>
          {[Zap, Gauge, Sun].map((Icon, i) => (
            <span key={`c${i}`} className="icon-circle-claro"><Icon className="size-6" strokeWidth={1.75} /></span>
          ))}
        </div>
      </Block>

      <Block title="Tarjetas" note="Esquinas de 20 px, sombra suave, se elevan al pasar el cursor. La tarjeta destacada usa Azul Claro; la de emergencias, borde Alerta.">
        <div className="grid gap-5 sm:grid-cols-3">
          <ServiceCard s={services[0]} />
          <ServiceCard s={services[4]} />
          <ServiceCard s={services[8]} />
        </div>
      </Block>

      <Block title="Manta" note="Aparece en el chat, en contacto y en estados vacíos o de espera. Nunca reemplaza fotos reales. Con casco, gafas y cinturón siempre.">
        <div className="grid gap-6 md:grid-cols-[1fr_auto]">
          <div className="grid grid-cols-4 gap-4">
            {moods.map((m) => (
              <div key={m} className="text-center">
                <img src={`/marca/manta/avatar_${m}_noche_128.png`} alt={`Manta ${m}`} width={96} height={96} className="mx-auto size-24 rounded-full ring-4 ring-claro" />
                <p className="mt-2 font-display text-sm font-semibold capitalize">{m}</p>
                <p className="text-xs text-noche/60">
                  {m === "feliz" && "Bienvenida"}
                  {m === "contento" && "Cierre, solicitud recibida"}
                  {m === "pensativo" && "Procesando, pregunta"}
                  {m === "serio" && "Emergencias, avisos"}
                </p>
              </div>
            ))}
          </div>
          <Image src="/marca/manta/manta_principal.png" alt="Manta" width={1400} height={1204} className="w-[260px]" />
        </div>
      </Block>

      <Block title="Fotografía" note="Siempre real, del banco de la empresa. Personal con EPP, equipos reconocibles, zona señalizada. Sin stock ni IA.">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {["hero-liniero-canasta", "equipo-subestacion", "prueba-transformador-campo", "celda-medida-13200", "solar-granja-aerea", "redes-rurales-aerea", "subestacion-estructura", "senalizacion-poste"].map((f) => (
            <div key={f} className="relative aspect-[4/3] overflow-hidden rounded-xl">
              <Image src={`/fotos/${f}.jpg`} alt="" fill sizes="25vw" className="object-cover" />
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-noche/60">Las fotos con marca de agua GPS se recortaron. Se pedirán los originales sin marca para el lanzamiento.</p>
      </Block>

      <Block title="Movimiento" note="Suave y breve. Nada rebota ni parpadea. Se respeta la preferencia de movimiento reducido del sistema.">
        <ul className="grid gap-2 text-[0.9375rem] text-noche/80 sm:grid-cols-2">
          <li>Entrada de secciones: desplazamiento de 28 px y fundido, 0,9 s.</li>
          <li>Tarjetas: elevación de 4 px al pasar el cursor.</li>
          <li>Cifras: cuentan desde cero al entrar en pantalla.</li>
          <li>La elipse se dibuja recorriendo la órbita.</li>
          <li>El circuito de “Así trabajamos” se traza con el scroll.</li>
          <li>Manta flota 6 px y cambia de expresión según el estado del chat.</li>
          <li>El botón de emergencia solo tiene un anillo de pulso lento.</li>
          <li>Todo visible sin JavaScript: la animación se suma, no condiciona.</li>
        </ul>
        <div className="mt-4">
          <ButtonLink href="/" variant="outline">Ver el sitio <ArrowRight className="size-5" /></ButtonLink>
        </div>
      </Block>
    </div>
  );
}
