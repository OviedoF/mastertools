# Operaciones de campo: API para la app Master Tools Campo

La app de técnicos (Flutter, en `../app`) usa el portal como servidor. Comparte la tabla
`usuarios` y la base de datos; las tablas propias empiezan con `campo_` (`db/schema.sql`).

## Qué quedó construido

- Rol **Técnico** (`tecnico`): solo entra por la app. El portal web lo rechaza en el inicio de
  sesión. Operaciones también puede usar la app.
- Columna `usuarios.telefono` para el WhatsApp de asignación.
- API en `src/app/api/campo` (token Bearer de 30 días, se extiende con el uso):

| Método y ruta | Qué hace |
| --- | --- |
| `POST /api/campo/sesion` | `{correo, clave}` → `{token, expira, usuario}`. Bloqueo tras 5 intentos. |
| `DELETE /api/campo/sesion` | Cierra la sesión del celular. |
| `GET /api/campo/servicios` | Servicios del técnico (abiertos y últimos 30 días). Nunca los de otro. |
| `GET /api/campo/catalogos` | Ítems del ATS y del pre-operacional (`campo_items`); vacío = copia de fábrica de la app. |
| `POST /api/campo/archivos` | Foto, firma o PDF (multipart, máx. 12 MB), id generado en el celular. |
| `GET /api/campo/archivos/:id` | Descarga: el técnico del servicio o cualquier usuario del portal. |
| `POST /api/campo/operaciones` | `inicio`, `ats`, `preoperacional`, `alerta`, `evidencia`, `documento`, `finalizar`, `no_ejecutado`. Idempotente por id. |
| `POST /api/campo/dispositivos` | Token de notificaciones push del celular. |

- Estados que mueve la app: `en_sitio` al iniciar, `en_ejecucion` cuando llegan ATS y
  pre-operacional, `finalizado` o `no_ejecutado` al cerrar. Un servicio **cancelado** por el
  administrador no cambia de estado aunque lleguen registros del celular (quedan guardados).
- ATS y pre-operacional son **inmutables**: el primero que llega queda; los reenvíos no lo cambian.
- **Trazabilidad**: `campo_operaciones` guarda cada acción con usuario, hora del celular y hora
  de llegada.
- **Alertas** (respuestas críticas del ATS, herramientas en mal estado): `campo_alertas` y aviso
  en la campana del portal a Gerencia y Operaciones.
- Página pública `/campo/s/<id>` (destino del enlace de WhatsApp cuando la app no está instalada)
  y `/.well-known/assetlinks.json` (Android App Links, lee `ANDROID_CERT_SHA256`).

## Probar en local

```bash
pnpm portal migrate
pnpm portal campo-demo      # tecnico@demo.test · Demo-Campo-2026 · 3 servicios (solo base local)
pnpm dev
# en ../app:
flutter run --dart-define=API_URL=http://10.0.2.2:3000   # emulador Android
```

## Falta (módulo del administrador y servicios externos)

1. **Módulo del administrador en el portal** (especificación, sección 5): crear, editar,
   reprogramar, cancelar y asignar servicios; catálogos de clientes, comercializadores,
   actividades, herramientas e ítems; dashboard en tabla y calendario con filtros; exportar a
   Excel lo filtrado; ver y descargar los tres PDF. Las tablas ya existen.
2. **Notificaciones al asignar** (sección 8):
   - *Push*: crear un proyecto de Firebase a nombre de la empresa, agregar
     `google-services.json` / `GoogleService-Info.plist` a la app y `firebase_messaging`;
     el servidor envía con la cuenta de servicio. La tabla `campo_dispositivos` ya recibe los tokens.
   - *WhatsApp*: **construido** (`src/lib/campo/notificar.ts`). Falta que Meta apruebe la plantilla
     `servicio_tecnico` (guía en `docs/WHATSAPP.md`) y cargar el teléfono de cada técnico en Usuarios.
     El módulo del administrador solo tiene que llamar `avisarCambio(servicio, { antes, despues })`
     después de guardar: decide si avisa asignación, reasignación (al que lo pierde y al nuevo),
     reprogramación o cancelación. Falta el recordatorio antes de la hora (*Sugerido*): la función
     `notificarServicio(id, "recordatorio")` ya existe; falta la tarea programada que la llame.
3. **Validar con SST** los contenidos marcados como *Sugerido* (ítems del ATS, críticos, alturas,
   herramientas y vehículo) y cargarlos en `campo_items`.
4. **Almacenamiento de archivos**: hoy fotos y PDF van en la base (como los adjuntos del portal).
   Con volumen (≈ 1–3 MB por servicio) conviene moverlos a un bucket (Cloudflare R2 o
   Supabase Storage) y dejar en la base solo la referencia.
5. **Publicación**: llave de firma de Android de la empresa, cuenta de Google Play (USD 25, pago
   único) y, si se quiere iOS, cuenta de Apple Developer (USD 99/año). Alternativa sin tiendas:
   distribuir el APK directamente a los técnicos.
