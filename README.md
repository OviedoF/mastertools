# Master Tools · sitio web

Prototipo navegable y base de desarrollo del sitio de Master Tools & Services S.A.S.
Etapa 4 (Diseño) del plan de trabajo: Inicio, páginas de servicio, Emergencias y
Contacto en celular y escritorio, con la versión final de Manta.

## Correr el proyecto

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build      # build de producción
pnpm lint       # ESLint
```

Guía de estilo interna (no se indexa ni se publica): `/estilo`.

## Stack

- Next.js 16 (App Router, Cache Components) + React 19 + TypeScript
- Tailwind CSS v4 con los tokens del Manual de marca v1.2 en `src/app/globals.css`
- GSAP + ScrollTrigger para revelados, contadores y trazado de SVG
- Lucide para íconos (una sola biblioteca, trazo 1,75 px)
- Fuentes Montserrat (títulos) e Inter (textos) con `next/font`

## Estructura

```
src/
  app/                    rutas (una por página del mapa del sitio)
    servicios/[slug]      ocho líneas de servicio, generadas desde src/content/services.ts
    emergencias-electricas  novena línea, con acceso propio
    contacto/actions.ts   server action del formulario (prototipo: registra en consola)
    estilo/               guía de estilo interna
    sitemap.ts, robots.ts, manifest.ts, opengraph-image.png
  components/
    layout/               TopBar, Header (megamenú + menú móvil), Footer, EmergencyBar
    chat/                 Manta: burbuja, panel y guion (flows.ts)
    home/, shared/        secciones de Inicio y bloques reutilizables
    motion/               Reveal, CountUp (GSAP)
    ui/                   Button, Logo, Orbit (elipse del logo), Pending, Section
  content/                textos y datos: site.ts, services.ts, projects.ts, process.ts
  lib/                    enlaces (tel, WhatsApp) y JSON-LD
public/
  marca/                  logos SVG (simplificados), isotipo, favicons, Manta
  fotos/                  fotos reales del banco de la empresa, recortadas y optimizadas
```

## Mapa de cobertura

`src/components/map/colombia.ts` se genera con `pnpm build:map` a partir de los
límites departamentales del DANE (paquete `@john-guerra/geo-colombia`, MIT, solo
en desarrollo). La geometría se simplifica a unos 4.500 puntos (57 KB) y se
proyecta en un lienzo de 1000 × 1369. San Andrés y Providencia va en un recuadro
sin geometría. El componente `CoverageMap` recibe los departamentos primarios y
secundarios desde `site.ts` y anima el encendido al entrar en pantalla.

## Analítica

`TrackClicks` empuja un evento `cta_click` al `dataLayer` en cada clic sobre
teléfonos, WhatsApp, cotización, emergencia, chat y envío del formulario. En la
etapa de desarrollo se conecta a Google Analytics 4 o Tag Manager y se marcan
como conversiones `form_enviar`, `llamar` y `whatsapp`.

## Panel de edición (Sanity)

El contenido puede vivir en Sanity para que Master Tools lo edite sin tocar
código. Sin proyecto configurado, el sitio usa `src/content` y es 100 % estático.

1. Crear el proyecto en sanity.io (cuenta gratuita), dataset `production`.
2. Copiar `.env.example` a `.env.local` y completar `NEXT_PUBLIC_SANITY_PROJECT_ID`.
   Para la vista previa de borradores, crear un token Viewer y ponerlo en
   `SANITY_API_READ_TOKEN`. Para migrar el contenido inicial, un token Editor en
   `SANITY_API_WRITE_TOKEN` (solo se usa en local).
3. En sanity.io/manage → API → CORS origins, agregar `http://localhost:3000` y el
   dominio público, con credenciales.
4. `pnpm seed:sanity` sube textos y fotos actuales al dataset (idempotente).
5. `pnpm dev` y entrar a `/studio`.

Cómo funciona:

- `src/sanity/schemas` define qué puede editar el cliente: datos generales,
  Inicio, Nosotros, política, los nueve servicios, los casos y los pasos.
- `src/data/content.ts` es la fachada: cada página pide `getServices()`,
  `getSettings()`, etc. y recibe el mismo tipo venga de Sanity o del respaldo.
  Los campos vacíos se rellenan con el respaldo y se marcan como pendientes.
- `next-sanity` cachea las consultas por etiquetas y `SanityLive` refresca las
  páginas cuando el cliente publica. No hace falta webhook.
- Desde el Studio, la herramienta **Presentation** abre el sitio en modo borrador
  con marcas de edición sobre textos e imágenes (`/api/draft-mode/enable`).
- El teléfono y el WhatsApp no se editan desde el panel: son constantes de marca
  en `src/content/site.ts` y `src/lib/links.ts`.

## Contenido pendiente

Los datos que Master Tools todavía tiene que aportar o validar se marcan en el
prototipo con el componente `Pending` (borde punteado). Están centralizados en
`src/content/site.ts` (`pending`), en cada servicio (`pendingNotes`, `pending`)
y en cada caso de `projects.ts`. Al completar el dato, se quita la marca.

Lista corta: NIT, correo comercial único, plazo de respuesta, horario de oficina,
dirección y ciudad sede, lista de servicios ejecutados por línea, datos y fotos de
los cinco casos, equipo e instrumentación, zonas y alcance de emergencias.

## Solicitudes: formulario y Manta

Las dos entradas terminan en `handleLead()` (`src/lib/leads.ts`), que hace tres
cosas: aviso interno por correo (cotizaciones a `MAIL_TO`, emergencias a
`EMERGENCY_TO`), confirmación automática al cliente y, si existe
`LEAD_WEBHOOK_URL`, un POST con la solicitud en JSON para el CRM o una planilla.

- El formulario llama a `submitQuote` (`src/app/contacto/actions.ts`); adjunta
  el archivo al aviso interno y tiene una trampa para bots.
- Manta envía a `POST /api/leads` cuando el flujo llega a un nodo con `submit`,
  con la conversación completa.
- El correo sale por Gmail (`src/lib/mail.ts`): API con `OAUTH_*` o SMTP con
  contraseña de aplicación. Sin credenciales, la solicitud solo queda en el
  registro del servidor y el sitio sigue funcionando.
- Pendiente para producción: buzón propio de Master Tools como remitente y el
  aviso de emergencias por WhatsApp al responsable (API de Meta o proveedor).
- Los mensajes de WhatsApp precargados están en `src/lib/links.ts`.

## Despliegue

El sitio es estático en su mayoría. El plan gratuito de Vercel no permite uso
comercial; Cloudflare Pages o Netlify (planes gratuitos) sí. Dominio:
mastertools.tech. Al publicar, conectar Google Analytics 4 y Search Console.
