-- Portal de Master Tools. Idempotente: se puede correr varias veces (pnpm portal migrate).

create table if not exists usuarios (
  id            uuid primary key default gen_random_uuid(),
  nombre        text not null,
  correo        text not null unique,
  rol           text not null default 'lectura' check (rol in ('gerencia','comercial','operaciones','lectura')),
  clave_hash    text not null,
  activo        boolean not null default true,
  debe_cambiar  boolean not null default true,
  intentos      int not null default 0,
  bloqueado_hasta timestamptz,
  ultimo_acceso timestamptz,
  creado_en     timestamptz not null default now()
);

create table if not exists sesiones (
  token_hash text primary key,
  usuario    uuid not null references usuarios(id) on delete cascade,
  expira_en  timestamptz not null,
  creada_en  timestamptz not null default now()
);
create index if not exists sesiones_usuario on sesiones (usuario);

create table if not exists solicitudes (
  id          uuid primary key default gen_random_uuid(),
  numero      bigint generated always as identity,
  creada_en   timestamptz not null default now(),
  tipo        text not null check (tipo in ('cotizacion','emergencia')),
  origen      text not null check (origen in ('form','manta')),
  estado      text not null default 'nueva' check (estado in
    ('nueva','contactada','en_cotizacion','ganada','perdida','equipo_asignado','en_sitio','resuelta','facturada','descartada')),
  responsable uuid references usuarios(id) on delete set null,
  nombre text, empresa text, telefono text, correo text, ciudad text, direccion text,
  servicio text, plazo text, mensaje text, falla text, riesgo text,
  pagina text, conversacion text,
  primer_contacto_en timestamptz,
  cerrada_en  timestamptz
);
create index if not exists solicitudes_estado on solicitudes (estado, creada_en desc);
create index if not exists solicitudes_responsable on solicitudes (responsable) where cerrada_en is null;

create table if not exists eventos (
  id        bigserial primary key,
  solicitud uuid not null references solicitudes(id) on delete cascade,
  usuario   uuid references usuarios(id) on delete set null,
  tipo      text not null,   -- creada, estado, asignacion, nota, adjunto, seguimiento, seguimiento_hecho, correo
  detalle   jsonb not null default '{}'::jsonb,
  creado_en timestamptz not null default now()
);
create index if not exists eventos_solicitud on eventos (solicitud, creado_en);

create table if not exists notas (
  id        bigserial primary key,
  solicitud uuid not null references solicitudes(id) on delete cascade,
  usuario   uuid not null references usuarios(id),
  texto     text not null,
  creada_en timestamptz not null default now()
);
create index if not exists notas_solicitud on notas (solicitud, creada_en);

-- Los adjuntos viven en la base (hasta 10 MB cada uno, volumen bajo). Si el volumen crece se pasan a un bucket.
create table if not exists adjuntos (
  id        bigserial primary key,
  solicitud uuid not null references solicitudes(id) on delete cascade,
  usuario   uuid references usuarios(id) on delete set null,
  nombre    text not null,
  tipo      text,
  tamano    int not null,
  datos     bytea not null,
  creado_en timestamptz not null default now()
);
create index if not exists adjuntos_solicitud on adjuntos (solicitud);

create table if not exists seguimientos (
  id          bigserial primary key,
  solicitud   uuid not null references solicitudes(id) on delete cascade,
  responsable uuid not null references usuarios(id),
  programado_para timestamptz not null,
  motivo      text,
  hecho       boolean not null default false,
  cerrado_en  timestamptz
);
create index if not exists seguimientos_pendientes on seguimientos (programado_para) where not hecho;

-- Conversaciones de Manta, incluso las que no terminan en solicitud (para medir abandono por paso).
create table if not exists conversaciones (
  id        uuid primary key default gen_random_uuid(),
  creada_en timestamptz not null default now(),
  paso      text,
  completa  boolean not null default false,
  pagina    text,
  transcripcion text
);
-- Para verlas desde el portal (también en vivo) y enlazarlas con la solicitud que generaron.
alter table conversaciones add column if not exists actualizada_en timestamptz not null default now();
alter table conversaciones add column if not exists mensajes int not null default 0;
alter table conversaciones add column if not exists solicitud uuid references solicitudes(id) on delete set null;
create index if not exists conversaciones_actualizada on conversaciones (actualizada_en desc);

-- Ajustes de conexión y credenciales editables por gerencia (valor secreto cifrado). Ver docs/AJUSTES.md.
create table if not exists ajustes (
  clave           text primary key,
  valor           text,
  secreto         boolean not null default false,
  actualizado_en  timestamptz not null default now(),
  actualizado_por uuid references usuarios(id) on delete set null
);

-- Quién cambió qué y cuándo (nunca guarda el valor).
create table if not exists ajustes_historial (
  id        bigserial primary key,
  clave     text not null,
  usuario   uuid references usuarios(id) on delete set null,
  accion    text not null check (accion in ('guardado','quitado')),
  creado_en timestamptz not null default now()
);
create index if not exists ajustes_historial_fecha on ajustes_historial (creado_en desc);

-- Avisos dentro del portal (campana): solicitud nueva, asignación, seguimientos vencidos.
create table if not exists avisos (
  id        bigserial primary key,
  usuario   uuid not null references usuarios(id) on delete cascade,
  tipo      text not null,
  titulo    text not null,
  detalle   text,
  solicitud uuid references solicitudes(id) on delete cascade,
  leido     boolean not null default false,
  creado_en timestamptz not null default now()
);
create index if not exists avisos_usuario on avisos (usuario, leido, creado_en desc);

-- Vistas de la bandeja guardadas por cada persona.
create table if not exists vistas (
  id        bigserial primary key,
  usuario   uuid not null references usuarios(id) on delete cascade,
  nombre    text not null,
  filtros   text not null,
  creada_en timestamptz not null default now(),
  unique (usuario, nombre)
);

-- Un registro por día en que ya corrió el recordatorio de seguimientos vencidos (evita enviarlo dos veces).
create table if not exists recordatorios (
  dia       date primary key,
  enviados  int not null default 0,
  creado_en timestamptz not null default now()
);

-- Pasos de la lista «Puesta en marcha» del dashboard que una persona marcó como hechos.
create table if not exists puesta_en_marcha (
  paso      text primary key,
  hecho_por uuid references usuarios(id) on delete set null,
  hecho_en  timestamptz not null default now()
);

-- Enlaces de un solo uso para recuperar la contraseña desde «¿Olvidó su contraseña?». Solo se guarda el hash del token.
create table if not exists recuperaciones (
  token_hash text primary key,
  usuario    uuid not null references usuarios(id) on delete cascade,
  expira_en  timestamptz not null,
  usado_en   timestamptz,
  creada_en  timestamptz not null default now()
);
create index if not exists recuperaciones_usuario on recuperaciones (usuario, creada_en desc);

-- Números del equipo que reciben el aviso de emergencias por WhatsApp (lista editable en Ajustes).
create table if not exists whatsapp_destinos (
  id          bigserial primary key,
  nombre      text not null,
  numero      text not null unique,            -- solo dígitos, con indicativo: 573001234567
  cuando      text not null default 'siempre' check (cuando in ('siempre','fuera_horario')),
  activo      boolean not null default true,
  creado_en   timestamptz not null default now(),
  creado_por  uuid references usuarios(id) on delete set null
);
-- Estado de cada número en Ajustes: si ya le escribió «hola» al número de avisos (lo marca el cliente)
-- y el resultado del último envío (prueba o aviso real).
alter table whatsapp_destinos add column if not exists hola boolean not null default false;
alter table whatsapp_destinos add column if not exists ultimo_envio_en timestamptz;
alter table whatsapp_destinos add column if not exists ultimo_envio_ok boolean;
alter table whatsapp_destinos add column if not exists ultimo_envio_detalle text;

-- =====================================================================================
-- Operaciones de campo (app Master Tools Campo). Ver docs/CAMPO.md.
-- =====================================================================================

-- Rol técnico (solo entra por la app) y teléfono para el WhatsApp de asignación.
alter table usuarios drop constraint if exists usuarios_rol_check;
alter table usuarios add constraint usuarios_rol_check check (rol in ('gerencia','comercial','operaciones','lectura','tecnico'));
alter table usuarios add column if not exists telefono text;          -- solo dígitos, con indicativo: 573001234567

-- Sesiones de la app (token Bearer). Separadas de las del portal: duran más para trabajar sin señal.
create table if not exists campo_sesiones (
  token_hash text primary key,
  usuario    uuid not null references usuarios(id) on delete cascade,
  expira_en  timestamptz not null,
  creada_en  timestamptz not null default now(),
  usada_en   timestamptz not null default now()
);
create index if not exists campo_sesiones_usuario on campo_sesiones (usuario);

-- Catálogos administrables (secciones 3 y 7 de la especificación).
create table if not exists campo_clientes          (id bigserial primary key, nombre text not null unique, activo boolean not null default true);
create table if not exists campo_comercializadores (id bigserial primary key, nombre text not null unique, activo boolean not null default true);
create table if not exists campo_actividades       (id bigserial primary key, nombre text not null unique, activo boolean not null default true);

-- Ítems de los formularios. Si una lista está vacía, la app usa su copia de fábrica.
create table if not exists campo_items (
  id       text not null,
  lista    text not null check (lista in ('epp','energia','aptitud','alturas','herramientas','vehiculo','peligros','resultados')),
  texto    text not null,
  critico  boolean not null default false,
  ayuda    text,
  orden    int not null default 0,
  activo   boolean not null default true,
  actualizado_en timestamptz not null default now(),
  primary key (lista, id)
);

create sequence if not exists campo_servicios_consecutivo;

create table if not exists campo_servicios (
  id            uuid primary key default gen_random_uuid(),
  codigo        text not null unique default ('MT-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('campo_servicios_consecutivo')::text, 5, '0')),
  cliente       text not null,
  direccion     text not null,
  lat           double precision,
  lng           double precision,
  id_frontera   text,
  comercializador text,
  departamento  text not null,
  ciudad        text not null,
  actividad     text not null,
  fecha_hora    timestamptz not null,
  descripcion   text,
  tecnico       uuid references usuarios(id) on delete set null,
  alturas       boolean not null,
  vehiculo      boolean not null,
  estado        text not null default 'programado' check (estado in
    ('programado','notificado','en_sitio','en_ejecucion','finalizado','no_ejecutado','reprogramado','cancelado')),
  motivo_cancelacion text,
  inicio_en     timestamptz,
  inicio_lat    double precision,
  inicio_lng    double precision,
  fin_en        timestamptz,
  fin_lat       double precision,
  fin_lng       double precision,
  observacion   text,
  resultado     text,
  resultado_detalle text,
  no_ejecutado_motivo text,
  creado_por    uuid references usuarios(id) on delete set null,
  creado_en     timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);
create index if not exists campo_servicios_tecnico on campo_servicios (tecnico, fecha_hora);
create index if not exists campo_servicios_fecha on campo_servicios (fecha_hora desc);
create index if not exists campo_servicios_filtros on campo_servicios (actividad, cliente, comercializador);

-- ATS y pre-operacional: una fila por servicio, inmutables una vez enviados (solo consulta).
create table if not exists campo_ats (
  servicio   uuid primary key references campo_servicios(id) on delete cascade,
  respuestas jsonb not null,
  firma      text,
  firmado_en timestamptz,
  usuario    uuid references usuarios(id) on delete set null,
  recibido_en timestamptz not null default now()
);
create table if not exists campo_preoperacionales (
  servicio   uuid primary key references campo_servicios(id) on delete cascade,
  respuestas jsonb not null,
  firma      text,
  firmado_en timestamptz,
  usuario    uuid references usuarios(id) on delete set null,
  recibido_en timestamptz not null default now()
);

-- Archivos (fotos, firmas, PDF). Viven en la base como los adjuntos del portal; si el volumen crece
-- se mueven a un bucket (S3, R2, Supabase Storage) y aquí queda solo la referencia.
create table if not exists campo_archivos (
  id        text primary key,                     -- generado en el celular: "foto-<uuid>", "firma-<uuid>"… (idempotente)
  servicio  uuid not null references campo_servicios(id) on delete cascade,
  clase     text not null check (clase in ('evidencia','firma','preoperacional','documento')),
  nombre    text not null,
  tipo      text not null,
  tamano    int not null,
  datos     bytea not null,
  usuario   uuid references usuarios(id) on delete set null,
  creado_en timestamptz not null default now()
);
create index if not exists campo_archivos_servicio on campo_archivos (servicio, clase);

create table if not exists campo_evidencias (
  id        uuid primary key,
  servicio  uuid not null references campo_servicios(id) on delete cascade,
  archivo   text not null references campo_archivos(id) on delete cascade,
  tomada_en timestamptz not null,
  comentario text
);
create index if not exists campo_evidencias_servicio on campo_evidencias (servicio, tomada_en);

create table if not exists campo_documentos (
  servicio  uuid not null references campo_servicios(id) on delete cascade,
  tipo      text not null check (tipo in ('informe','ats','preoperacional')),
  archivo   text not null references campo_archivos(id) on delete cascade,
  generado_en timestamptz not null default now(),
  primary key (servicio, tipo)
);

-- Cada operación que envía la app, una sola vez (id generado en el celular). Es también la trazabilidad:
-- quién hizo qué y cuándo (hora del celular y hora de llegada al servidor).
create table if not exists campo_operaciones (
  id        uuid primary key,
  servicio  uuid not null references campo_servicios(id) on delete cascade,
  usuario   uuid references usuarios(id) on delete set null,
  tipo      text not null,
  datos     jsonb not null default '{}'::jsonb,
  creado_en timestamptz not null,
  recibido_en timestamptz not null default now()
);
create index if not exists campo_operaciones_servicio on campo_operaciones (servicio, creado_en);

-- Alertas para el administrador (respuestas críticas del ATS, herramientas en mal estado).
create table if not exists campo_alertas (
  id        bigserial primary key,
  servicio  uuid not null references campo_servicios(id) on delete cascade,
  origen    text not null,
  bloqueante boolean not null default false,
  motivos   jsonb not null,
  atendida  boolean not null default false,
  creada_en timestamptz not null default now()
);

-- Notificaciones enviadas (push y WhatsApp) y su estado.
create table if not exists campo_notificaciones (
  id        bigserial primary key,
  servicio  uuid not null references campo_servicios(id) on delete cascade,
  usuario   uuid references usuarios(id) on delete set null,
  canal     text not null check (canal in ('push','whatsapp')),
  estado    text not null check (estado in ('enviada','fallida','sin_configurar')),
  detalle   text,
  creada_en timestamptz not null default now()
);

-- Celulares registrados para notificaciones push.
create table if not exists campo_dispositivos (
  token     text primary key,
  usuario   uuid not null references usuarios(id) on delete cascade,
  plataforma text not null,
  actualizado_en timestamptz not null default now()
);
