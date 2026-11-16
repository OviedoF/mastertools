# CRM integrado y Manta en el portal

Master Tools & Services S.A.S. · Evaluación técnica y propuesta · 11 de noviembre de 2026

David pidió que el sitio tenga un CRM administrativo con dos piezas: un panel de
estadísticas de la web y un apartado de gestión de las solicitudes (chat, cotizaciones y
emergencias) con asignación, estados, observaciones, adjuntos, seguimientos e historial
hasta el cierre, más notificaciones, filtros y control de acceso. Y que Manta, el asistente
del sitio, aparezca también en ese portal.

**Resumen de la recomendación:** construir un portal liviano dentro del mismo sitio
(`/portal`), con una base de datos propia y acceso por usuario, en tres fases de dos a tres
semanas cada una. No conviene construir un CRM "completo": el 80 % del valor está en una
bandeja de solicitudes con estados, responsable, notas e historial. El tráfico del sitio no
se mide desde el portal sino con Google Analytics 4, que es gratuito; el portal muestra sus
cifras y les suma las conversiones reales (solicitudes). Manta entra al portal en dos
niveles: primero como presencia con avisos y resúmenes por reglas (barato), después con
inteligencia artificial para resumir conversaciones y proponer respuestas (costo bajo,
valor alto). Una alternativa más rápida y casi gratuita es conectar el sitio a Zoho CRM,
que ya forma parte del ecosistema de correo de la empresa; se explica en la sección 2 con
sus límites.

---

## 1. Qué existe hoy y qué se reutiliza

| Pieza | Estado actual | Se reutiliza en el portal |
| --- | --- | --- |
| Entrada de solicitudes | Formulario y Manta terminan en una sola función (`handleLead`, `src/lib/leads.ts`) que envía el aviso por correo, la confirmación al cliente y, si está configurado, un webhook | Sí. Es el punto único donde se agrega "guardar en la base de datos". No hay que tocar el formulario ni Manta |
| Manta | Guion por reglas (`src/components/chat/flows.ts`): botones, preguntas cerradas, detección de palabras de emergencia. No usa inteligencia artificial. Registra la conversación completa en cada solicitud | Sí. El guion, el avatar, los estados de ánimo y el registro de conversación sirven tal cual |
| Correo | Zoho (negocios@mastertools.tech) por SMTP, probado en producción | Sí. Las notificaciones del portal salen por el mismo canal |
| Analítica | Cada clic de conversión (llamar, WhatsApp, cotizar, chat) se empuja al `dataLayer` (`TrackClicks.tsx`). Falta conectar Google Analytics 4 | Sí. Al conectar GA4 esos eventos pasan a medirse sin cambiar código |
| Contenido | Sanity (panel `/studio`) para textos, servicios y casos | No se mezcla. El CMS es para contenido; el CRM, para operaciones |
| Hosting | Netlify, deploy automático desde GitHub. Funciones serverless disponibles | Sí. Las rutas del portal y las tareas programadas corren ahí |
| Base de datos | No hay. Las solicitudes solo viven en el correo | Es lo primero que hay que crear |

Conclusión: la arquitectura ya tiene el embudo correcto. Lo que falta es persistir cada
solicitud, darle estado y dueño, y poner una interfaz encima.

## 2. Dos caminos y la recomendación

| Criterio | A. Zoho CRM / Bigin conectado por webhook | B. Portal propio dentro del sitio (recomendado) |
| --- | --- | --- |
| Tiempo hasta usarlo | Una semana: configurar el CRM y mapear campos | Fase 1 en dos a tres semanas |
| Costo mensual | Plan gratuito con pocos usuarios; los planes pagos rondan US$ 7 a 14 por usuario (confirmar precios vigentes) | Entre US$ 0 y 25 (base de datos) más centavos de IA |
| Funciones listas (asignar, estados, notas, adjuntos, tareas, historial, filtros, roles) | Todas, desde el primer día | Se construyen a medida; solo las que se usan |
| Dashboard de tráfico web | No. Se mira en GA4 aparte | Integrado: GA4 más conversiones propias en una pantalla |
| Conversaciones de Manta | Llegan como texto en una nota | Se ven como chat, con resumen y clasificación |
| Manta dentro de la herramienta | No es posible | Sí, es el objetivo |
| Futuro: app interna de técnicos, marketplace | Queda fuera; otra herramienta más | Misma base de datos, mismos usuarios, mismo portal |
| Dependencia | De un proveedor y su modelo de precios por usuario | Del equipo de desarrollo y del hosting propio |
| Datos personales (Ley 1581) | Almacenados en Zoho; política del proveedor | Almacenados en una base propia; control total y borrado a pedido |

Recomendación: el camino B, por tres razones. David quiere trazabilidad de punta a punta y
Manta dentro de la herramienta, cosas que un CRM externo no da. La empresa ya decidió que
quiere hosting y datos a su nombre. Y la app interna de técnicos que David adelantó en
noviembre comparte el mismo corazón (usuarios, casos, adjuntos, PDF), así que lo que se
construye ahora no se tira después.

El camino A sigue siendo útil como puente: si se necesita gestionar solicitudes la semana
que viene, se activa el webhook hacia Zoho hoy y se migra al portal cuando la fase 1 esté
lista. El código ya lo soporta (`LEAD_WEBHOOK_URL`).

## 3. Estructura del portal

### Módulos

| Módulo | Qué hace | Quién lo usa |
| --- | --- | --- |
| Bandeja | Lista de solicitudes con filtros por tipo (cotización, emergencia, chat sin cerrar), estado, responsable, servicio, ciudad, fecha y texto libre. Contadores arriba: nuevas, en curso, vencidas | Comercial, operaciones, gerencia |
| Ficha del caso | Todo lo de una solicitud: datos del cliente, servicio, origen (página, canal), conversación de Manta, estado, responsable, notas, adjuntos, seguimientos programados e historial de cambios | Quien lo tenga asignado |
| Dashboard | Tráfico de GA4 y conversiones propias, por período | Gerencia |
| Usuarios | Alta y baja de usuarios, rol de cada uno | Gerencia |
| Manta | Burbuja dentro del portal: avisos, resúmenes y atajos (sección 5) | Todos |

### Estados de una solicitud

Los mismos que ya definía el documento de estructura, afinados para que sean pocos:

```
Cotización:  Nueva → Contactada → En cotización → Ganada | Perdida
Emergencia:  Nueva → Equipo asignado → En sitio → Resuelta → Facturada
Cualquiera:  → Descartada (spam, duplicada, fuera de alcance)
```

Cada cambio de estado, asignación, nota o adjunto queda como un evento en el historial,
con usuario y fecha. Eso es la trazabilidad que pide David: no hay que construir nada
aparte, el historial es la suma de los eventos.

### Modelo de datos

| Tabla | Campos principales |
| --- | --- |
| `solicitudes` | id, tipo (cotización/emergencia), origen (formulario/manta), estado, responsable, nombre, empresa, teléfono, correo, ciudad, dirección, servicio, plazo, mensaje, falla, riesgo, página de origen, conversación de Manta, fecha de creación, fecha de cierre |
| `eventos` | id, solicitud, usuario, tipo (creada, estado, asignación, nota, adjunto, seguimiento, correo enviado), detalle, fecha |
| `notas` | id, solicitud, usuario, texto, fecha |
| `adjuntos` | id, solicitud, usuario, nombre de archivo, tipo, tamaño, ruta en el almacenamiento, fecha |
| `seguimientos` | id, solicitud, responsable, fecha programada, motivo, hecho (sí/no), fecha de cierre |
| `usuarios` | id, nombre, correo, rol (gerencia, comercial, operaciones, lectura), activo |

Seis tablas bastan. Lo que David llama "oportunidad" es una solicitud en estado "En
cotización" o "Ganada"; no hace falta una entidad aparte hasta que manejen varias
cotizaciones por cliente.

## 4. Dashboard de estadísticas

Dos fuentes, una pantalla.

| Indicador | De dónde sale | Observación |
| --- | --- | --- |
| Visitantes, usuarios únicos, sesiones, tiempo de permanencia, páginas más vistas, fuentes de tráfico, dispositivos, ciudades | Google Analytics 4, consultado por su API con una cuenta de servicio | Gratuito. Hay que crear la propiedad GA4 a nombre de Master Tools y conectarla al sitio (está en los pendientes de lanzamiento) |
| Clics en llamar, WhatsApp, cotizar, chat, por página | GA4, con los eventos que el sitio ya emite | Sin cambios de código |
| Solicitudes recibidas por tipo, canal, servicio, ciudad y período | Base de datos del portal | Es la conversión real, no una estimación |
| Tasa de conversión (solicitudes ÷ sesiones) | Cruce de ambas | El número que más importa para evaluar campañas |
| Tiempo hasta el primer contacto, tiempo hasta el cierre, casos por responsable, ganadas/perdidas | Base de datos del portal (eventos) | Indicadores de operación; salen solos si el equipo cambia los estados |
| Conversaciones de Manta: iniciadas, completadas, abandonadas, en qué paso | Base de datos del portal (hay que registrar también los chats que no terminan en solicitud) | Hoy solo se guardan las que llegan a solicitud |

Período seleccionable (7, 30, 90 días, rango libre) y comparación con el período anterior.
Nada más: un dashboard con treinta gráficos no se mira.

Alternativa sin API: incrustar los informes de GA4 con Looker Studio (gratuito) dentro del
portal. Es más rápido de armar y menos elegante; sirve para la fase 1.

## 5. Manta en el portal: tres niveles

Hoy Manta es un guion por reglas. Para que "aparezca en el portal" hay tres niveles, y se
puede parar en cualquiera.

| Nivel | Qué hace Manta en el portal | Cómo se construye | Complejidad |
| --- | --- | --- | --- |
| 1. Presencia y avisos | Burbuja con el avatar y los estados de ánimo que ya existen. Saluda por nombre, avisa "hay 3 solicitudes nuevas y 2 seguimientos vencidos", lleva al caso con un clic, muestra la conversación del cliente como chat y explica cada estado. Todo por reglas, sin IA | Reutilizar el componente actual de Manta con un guion nuevo para el portal, alimentado por la base de datos | Baja: 2 a 4 días |
| 2. Asistente con IA sobre cada caso | Resume la conversación del cliente en tres líneas, clasifica la urgencia y el servicio, detecta datos faltantes, redacta un borrador de respuesta por WhatsApp o correo que el comercial revisa antes de enviar, y sugiere el siguiente paso. Responde preguntas sobre la bandeja ("¿qué cotizaciones de medida siguen sin contactar en Córdoba?") | Llamadas a la API de Claude desde el servidor del portal, con la solicitud y la conversación como contexto. La clave nunca llega al navegador. Para resúmenes y clasificación alcanza el modelo de menor costo (Haiku); para redactar respuestas, uno superior si la calidad lo pide | Media: 1 a 2 semanas |
| 3. Manta conversacional en el sitio público | El visitante escribe libremente y Manta responde con lenguaje natural sobre los servicios de Master Tools, recoge los datos y crea la solicitud | API de Claude con la base de servicios como contexto, límites estrictos (no cotiza, no promete tiempos, deriva emergencias al teléfono) y registro de cada conversación para revisarla | Alta: 2 a 3 semanas, más pruebas con el equipo. Riesgo de respuestas imprecisas si no se acota bien |

### Dónde se ve a Manta en el portal

Además de la burbuja, Manta es la cara del portal, con el mismo avatar y estados de ánimo
del sitio público, para que el equipo sienta que es la misma herramienta:

| Lugar | Qué muestra Manta |
| --- | --- |
| Inicio de sesión | Manta saluda y da la bienvenida con el tono de marca |
| Bandeja | Saludo por nombre y resumen del día ("tiene 3 solicitudes nuevas y 2 seguimientos vencidos"); estado de ánimo de alerta si hay una emergencia sin atender |
| Bandeja vacía y filtros sin resultados | Manta tranquila, con un mensaje breve en lugar de una tabla vacía |
| Ficha del caso | Panel lateral "Manta" con el resumen del caso (nivel 2), conversación del cliente y borrador sugerido |
| Dashboard | Una línea de lectura de la semana ("las visitas subieron 12 % y las cotizaciones se mantienen") |
| Notificaciones | Los avisos dentro del portal llegan firmados por Manta |

Los textos mantienen las reglas de marca del sitio (trato de usted, sin "24/7", amarillo
solo para emergencias). Los niveles 1 y 2 de la tabla anterior son lo que alimenta cada
uno de estos lugares; la presencia visual (avatar, saludo, estados vacíos) entra con el
nivel 1 y no depende de la IA.

Costo de operación de la IA: con unas cien solicitudes al mes, los resúmenes y borradores
del nivel 2 cuestan centavos de dólar; aun con uso intenso no supera unos pocos dólares.
El nivel 3 depende del tráfico del sitio y conviene estimarlo con los datos de GA4.

Recomendación: nivel 1 en la fase 2 del portal y nivel 2 en la fase 3. El nivel 3 se
decide después, con cifras reales de cuánta gente usa el chat y en qué paso abandona.

## 6. Notificaciones, filtros y acceso

**Notificaciones**

| Evento | Canal | Destinatario |
| --- | --- | --- |
| Solicitud nueva | Correo (ya existe) y aviso dentro del portal | Comercial; emergencias también a operaciones |
| Asignación | Correo y aviso en el portal | El responsable asignado |
| Seguimiento vencido | Correo diario a las 8:00 con la lista y aviso en el portal | Cada responsable; resumen a gerencia |
| Emergencia nueva | Además, WhatsApp al responsable de turno | Requiere WhatsApp Business API o un proveedor (Twilio, 360dialog). Es el único canal con costo y trámite propio; se puede dejar para después |

**Filtros y búsqueda**: por estado, tipo, responsable, servicio, ciudad, rango de fechas y
texto libre sobre nombre, empresa, teléfono, correo y mensaje. Vistas guardadas para las
tres que más se usan ("mis casos", "nuevas sin asignar", "emergencias abiertas").

**Control de acceso**

| Rol | Puede |
| --- | --- |
| Gerencia | Todo, incluido crear usuarios y ver el dashboard |
| Comercial | Ver y gestionar cotizaciones y chats; ver emergencias |
| Operaciones | Ver y gestionar emergencias; ver cotizaciones |
| Lectura | Solo consultar |

Acceso con correo y contraseña o con enlace por correo (sin contraseña), sesión que expira,
y registro de quién hizo qué (el historial de eventos ya lo cubre). Solo correos del
dominio de la empresa pueden ser usuarios.

## 7. Plan por fases, esfuerzo y costos

| Fase | Entrega | Esfuerzo estimado |
| --- | --- | --- |
| 0. Preparación | Cuenta de base de datos a nombre de Master Tools, propiedad GA4 conectada al sitio, usuarios iniciales | 1 a 2 días |
| 1. Portal base | Guardar cada solicitud, bandeja con filtros, ficha del caso con estados, responsable, notas e historial, acceso por usuario y roles, notificaciones por correo. El webhook a Zoho queda como respaldo opcional | 2 a 3 semanas |
| 2. Dashboard, adjuntos y seguimientos | Dashboard GA4 más conversiones, adjuntos en la ficha, seguimientos programados con recordatorio diario, vistas guardadas, Manta nivel 1 | 2 semanas |
| 3. Manta con IA | Resumen y clasificación de cada caso, borradores de respuesta, preguntas sobre la bandeja | 1 a 2 semanas |
| 4. Más adelante | WhatsApp al equipo, app de técnicos con informe PDF (comparte la base del portal), Manta nivel 3 | A cotizar aparte |

Costos de operación mensuales estimados, además del desarrollo:

| Servicio | Costo |
| --- | --- |
| Base de datos, autenticación y almacenamiento de adjuntos (Supabase o Neon) | Gratis al inicio; US$ 25 cuando el volumen lo pida |
| Hosting Netlify | Gratis en el plan actual; US$ 19 si se superan los límites de funciones |
| Google Analytics 4 | Gratis |
| API de Claude (nivel 2 de Manta) | Menos de US$ 5 con el volumen actual |
| WhatsApp Business API (si se activa) | Según proveedor, desde unos US$ 10 más costo por mensaje |

## 8. Decisiones que necesitamos de Master Tools

- [ ] Confirmar el camino: portal propio (B), Zoho CRM (A) o Zoho ahora y portal después.
- [ ] Quiénes serán usuarios y con qué rol. Al menos un correo por rol para arrancar.
- [ ] Validar la lista de estados de la sección 3 y quién asigna los casos (¿entran a una bandeja común o siempre a una persona?).
- [ ] Plazo objetivo de primer contacto para cotizaciones y para emergencias, para marcar los casos vencidos.
- [ ] Si quieren el aviso de emergencias por WhatsApp desde el inicio (tiene costo y trámite con Meta) o alcanza con correo y portal.
- [ ] A nombre de quién se crean las cuentas de base de datos y GA4 (recomendado: la empresa, con acceso del desarrollo).
- [ ] Cuánto tiempo se conservan las solicitudes cerradas y quién atiende las solicitudes de borrado de datos (Ley 1581). Se publica en la política de datos del sitio.

---

## Anexo técnico: cómo se integra

Para el desarrollo. Todo encaja en el proyecto Next.js actual, sin un segundo repositorio.

### Infraestructura

- **Base de datos**: PostgreSQL gestionado. Supabase es la opción más corta porque trae autenticación, almacenamiento de archivos, políticas de acceso por fila y eventos en tiempo real en un solo servicio con plan gratuito. Neon más Auth.js es la alternativa si se prefiere Postgres puro.
- **Autenticación**: Supabase Auth con correo y contraseña o enlace mágico, restringida al dominio `mastertools.tech`. El rol se guarda en la tabla `usuarios` y se copia al token para las políticas de acceso.
- **Archivos**: bucket privado; el portal entrega URLs firmadas con vencimiento. Límite de 10 MB por archivo, igual que el formulario.
- **Tareas programadas**: una función programada de Netlify a las 8:00 (hora de Bogotá) para los seguimientos vencidos y el resumen diario.
- **Variables nuevas**: URL y claves de la base de datos (la de servicio solo en el servidor), ID de la propiedad GA4 y credenciales de la cuenta de servicio, clave de la API de Claude. Todas en Netlify, ninguna en el repositorio.

### Esquema (resumen en SQL)

```sql
create type tipo_solicitud as enum ('cotizacion', 'emergencia');
create type estado_solicitud as enum ('nueva','contactada','en_cotizacion','ganada','perdida',
  'equipo_asignado','en_sitio','resuelta','facturada','descartada');
create type rol_usuario as enum ('gerencia','comercial','operaciones','lectura');

create table usuarios (
  id uuid primary key references auth.users(id),
  nombre text not null, correo text unique not null,
  rol rol_usuario not null default 'lectura', activo boolean not null default true
);

create table solicitudes (
  id uuid primary key default gen_random_uuid(),
  creada_en timestamptz not null default now(),
  tipo tipo_solicitud not null, origen text not null check (origen in ('form','manta')),
  estado estado_solicitud not null default 'nueva',
  responsable uuid references usuarios(id),
  nombre text, empresa text, telefono text, correo text, ciudad text, direccion text,
  servicio text, plazo text, mensaje text, falla text, riesgo text,
  pagina text, conversacion text, cerrada_en timestamptz
);

create table eventos (
  id bigserial primary key, solicitud uuid not null references solicitudes(id) on delete cascade,
  usuario uuid references usuarios(id), tipo text not null, detalle jsonb,
  creado_en timestamptz not null default now()
);

create table notas (
  id bigserial primary key, solicitud uuid not null references solicitudes(id) on delete cascade,
  usuario uuid not null references usuarios(id), texto text not null,
  creada_en timestamptz not null default now()
);

create table adjuntos (
  id bigserial primary key, solicitud uuid not null references solicitudes(id) on delete cascade,
  usuario uuid references usuarios(id), nombre text not null, tipo text, tamano int,
  ruta text not null, creado_en timestamptz not null default now()
);

create table seguimientos (
  id bigserial primary key, solicitud uuid not null references solicitudes(id) on delete cascade,
  responsable uuid not null references usuarios(id), programado_para timestamptz not null,
  motivo text, hecho boolean not null default false, cerrado_en timestamptz
);

create index on solicitudes (estado, creada_en desc);
create index on solicitudes (responsable) where cerrada_en is null;
create index on seguimientos (programado_para) where not hecho;
```

Políticas de acceso por fila: lectura para todo usuario activo; escritura según rol
(gerencia todo; comercial sobre cotizaciones; operaciones sobre emergencias). Las
inserciones desde el sitio público usan la clave de servicio en el servidor, nunca el
cliente anónimo.

### Cambios en el código del sitio

1. **`src/lib/leads.ts`**: antes de enviar los correos, insertar la solicitud y su evento `creada`. Devolver el id y ponerlo en el asunto del aviso interno con un enlace al caso en el portal. Si la base de datos falla, los correos salen igual y el error queda en el registro: el canal de correo sigue siendo la red de seguridad.
2. **`src/app/api/leads/route.ts`** y **`src/app/contacto/actions.ts`**: sin cambios de contrato; solo reciben el id para el enlace.
3. **Conversaciones de Manta que no terminan en solicitud**: un envío ligero al cerrar el chat (o al abandonar) con el paso alcanzado y la transcripción, a una tabla `conversaciones`. Es lo que permite medir abandono por paso.
4. **Adjunto del formulario**: además de ir en el correo, se guarda en el bucket y se registra en `adjuntos`.

### Rutas del portal

| Ruta | Contenido |
| --- | --- |
| `/portal` | Bandeja con filtros, contadores y vistas guardadas |
| `/portal/casos/[id]` | Ficha del caso: datos, conversación, estado, responsable, notas, adjuntos, seguimientos, historial |
| `/portal/dashboard` | GA4 más conversiones propias |
| `/portal/usuarios` | Gestión de usuarios (solo gerencia) |
| `/portal/acceso` | Inicio de sesión |

Un `middleware` protege todo `/portal/*` y redirige a `/portal/acceso` sin sesión. Las
rutas del portal se excluyen del sitemap y llevan `noindex`. Las mutaciones (cambiar
estado, asignar, anotar, programar) son Server Actions que escriben la tabla y el evento en
una sola transacción y revalidan la ficha.

### Dashboard

- GA4 Data API con una cuenta de servicio de Google con permiso de lectura en la propiedad. Consultas: sesiones, usuarios activos, duración media, páginas vistas por ruta, fuente/medio, eventos `cta_click` por `cta` y `page`. Caché de una hora en el servidor para no agotar la cuota.
- Conversiones propias: consultas agregadas sobre `solicitudes` y `eventos` (recuento por día, tiempo medio entre `creada` y el primer evento `estado`, etc.).
- Gráficos con una librería ligera (Recharts) y los colores de marca.

### Manta en el portal

- **Nivel 1**: reutilizar `MantaBubble` con un conjunto de nodos nuevo (`flows-portal.ts`) que lee de la base de datos: saludo con contadores, atajos a vistas, explicación de estados. Sin IA.
- **Nivel 2**: endpoint `POST /api/manta/asistir` en el servidor que arma el contexto (solicitud, conversación, últimas notas) y llama a la API de Claude con instrucciones fijas: resumir en tres líneas, clasificar urgencia y servicio, listar datos faltantes, proponer un borrador en tono de usted, sin prometer tiempos ni precios. La respuesta se muestra en la ficha con botones "usar borrador" y "descartar". El borrador nunca se envía solo. Clave de API solo en variables del servidor; registro de uso (tokens) por caso para controlar el costo. Para preguntas sobre la bandeja, el modelo recibe un esquema de consultas permitidas y el servidor ejecuta la consulta; el modelo no toca la base de datos.
- **Nivel 3**: el mismo endpoint, expuesto al sitio público con límites de tasa, filtro de temas, el catálogo de servicios como contexto y las mismas reglas de marca que el guion actual. Toda conversación se guarda para revisión. Se diseña recién con cifras de uso del chat.

### Orden de trabajo sugerido para la fase 1

1. Crear el proyecto de base de datos y aplicar el esquema. Alta de los usuarios iniciales.
2. Persistir solicitudes desde `handleLead` y verificar con las pruebas que ya existen (formulario, Manta, emergencia).
3. Acceso y `middleware`.
4. Bandeja con filtros.
5. Ficha del caso: estado, responsable, notas, historial.
6. Enlace al caso en los correos de aviso.
7. Pruebas con el equipo de Master Tools durante una semana antes de dar por cerrada la fase.

---

## Estado de la implementación (fase 1 y Manta nivel 1)

Decisión del 13 de noviembre de 2026: camino B, portal propio. Ya está construido en `/portal`:

- **Sin Supabase Auth.** Para depender de un solo servicio, el portal usa PostgreSQL plano (`pg`, cualquier proveedor: Neon, Supabase o uno propio) y un acceso propio: contraseña con scrypt, sesión de 12 horas guardada en la tabla `sesiones`, bloqueo de 15 minutos tras 5 intentos fallidos, contraseña temporal que se cambia en el primer ingreso. Los adjuntos (máximo 10 MB) se guardan en la base; si el volumen crece se pasan a un bucket.
- **Qué incluye:** guardado de cada solicitud desde `handleLead` (el correo sigue saliendo aunque la base falle), bandeja con contadores, vistas rápidas y filtros (texto, tipo, estado, responsable, servicio, ciudad, fechas, vencidas), ficha con estados por tipo, responsable (con aviso por correo), notas, seguimientos, adjuntos, conversación de Manta e historial; gestión de usuarios y roles; Manta nivel 1 (saludo y resumen del día en la bandeja, burbuja con avisos y atajos, estados de ánimo, y panel de ayuda por estado en la ficha).
- **Roles creados:** `gerencia` (todo y usuarios), `comercial` (gestiona cotizaciones), `operaciones` (gestiona emergencias), `lectura` (solo consulta). Todos los roles ven todos los casos.
- **Plazos de primer contacto** (para marcar "vencida"): 24 horas en cotizaciones y 1 hora en emergencias. Están en `src/lib/portal/model.ts` y hay que confirmarlos con David.
- **Estructura:** el sitio público quedó en el grupo de rutas `src/app/(sitio)` y el portal en `src/app/portal`, con su propio diseño (sin encabezado, pie ni chat público). `src/proxy.ts` protege `/portal/*`.
- **Fase 2, construido el 16 de noviembre de 2026:** `/portal/dashboard` (solo gerencia) con las solicitudes por período y comparación con el anterior, el chat de Manta con el paso donde se abandona (la tabla `conversaciones` ya se llena desde el sitio) y el tráfico de GA4 (visitantes, sesiones, permanencia, páginas, fuentes, dispositivos, ciudades, clics por botón y tasa de conversión). `/portal/ajustes` (solo gerencia) guarda en la base, con los secretos cifrados, las credenciales y conexiones: GA4, correo de salida, destinatarios, webhook y dominios permitidos; ver `docs/AJUSTES.md` y `docs/GA4.md`.
- **Falta** (fases 2 y 3): recordatorio diario de seguimientos vencidos (función programada), vistas guardadas por persona, avisos dentro del portal, Manta con IA, WhatsApp a emergencias. El dashboard de tráfico se ve cuando Master Tools crea la propiedad de GA4 y se cargan sus datos en Ajustes.

### Cómo se pone en marcha

```
pnpm portal migrate                              # crea las tablas en DATABASE_URL
pnpm portal user correo@dominio "Nombre" gerencia   # crea un usuario y muestra su contraseña temporal
pnpm portal reset correo@dominio                 # nueva contraseña temporal
pnpm portal demo                                 # solo contra una base local: usuarios y casos de ejemplo
```

En Netlify hacen falta `DATABASE_URL` y `PORTAL_ALLOWED_DOMAINS=mastertools.tech`. Usuarios iniciales recomendados: un correo de gerencia (David Contreras), uno de comercial, uno de operaciones y, si se quiere, uno de lectura. Después se crean y desactivan desde `/portal/usuarios`.
