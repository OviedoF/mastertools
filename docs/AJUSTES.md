# Ajustes del portal: credenciales y conexiones como variables en la base de datos

Master Tools & Services S.A.S. · guía para quien administra el portal (rol Gerencia)

Todo lo que necesita una clave o una conexión (Google Analytics, correo de salida, destinatarios,
webhook, dominios permitidos) se puede cargar y cambiar desde el portal, en **Portal > Ajustes**,
sin entrar a Netlify y sin volver a publicar el sitio.

## Cómo funciona

1. Cada ajuste se guarda en la tabla `ajustes` de la base de datos (PostgreSQL en Neon).
2. Orden de prioridad al leerlo: **valor guardado en Ajustes > variable de entorno del servidor > vacío**.
   Por eso nada se rompe si todavía hay variables en Netlify: Ajustes solo las reemplaza cuando se cargan.
3. Los valores secretos (clave privada de Google, contraseña del correo, URL del webhook) se guardan **cifrados**
   (AES-256-GCM) y no se vuelven a mostrar. Para cambiarlos se escribe el valor nuevo.
4. Los cambios se aplican en menos de un minuto (el sitio guarda una copia de 20 segundos).
5. Cada cambio queda registrado en `ajustes_historial` (quién, cuándo y qué ajuste; nunca el valor).
6. «Quitar» borra el valor guardado y el sitio vuelve a usar la variable del servidor, si existe.

Solo Gerencia ve y modifica Ajustes.

## Qué se puede configurar

| Grupo | Ajuste (clave) | Para qué sirve |
| --- | --- | --- |
| Google Analytics | `GA_MEASUREMENT_ID` | ID de medición `G-XXXXXXXXXX`. Activa el envío de visitas y clics desde el sitio |
| | `GA4_PROPERTY_ID` | Propiedad de la que el dashboard lee las estadísticas |
| | `GA4_CLIENT_EMAIL` | Cuenta de servicio de Google (con rol Lector en la propiedad) |
| | `GA4_PRIVATE_KEY` | Clave privada de esa cuenta (secreta) |
| Correo | `MAIL_HOST`, `MAIL_PORT` | Servidor SMTP (Zoho: `smtppro.zoho.com`, 465) |
| | `MAIL_USERNAME` | Buzón remitente |
| | `MAIL_PASSWORD` | Contraseña de aplicación del buzón (secreta) |
| | `MAIL_FROM_NAME` | Nombre que ve el cliente en el correo |
| Destinatarios | `MAIL_TO` | Quién recibe las cotizaciones (varios, separados por coma) |
| | `EMERGENCY_TO` | Quién recibe las emergencias |
| | `LEAD_WEBHOOK_URL` | Dirección externa que recibe cada solicitud como JSON (opcional, secreta) |
| WhatsApp | `WHATSAPP_PHONE_ID`, `WHATSAPP_TOKEN` (secreto), `WHATSAPP_TEMPLATE`, `WHATSAPP_LANG` y la lista de números que reciben el aviso (tabla `whatsapp_destinos`) | Aviso de cada emergencia nueva al equipo de turno. Ver `docs/WHATSAPP.md` |
| Acceso | `PORTAL_ALLOWED_DOMAINS` | Dominios de correo que pueden tener usuario, por ejemplo `mastertools.tech` |

Lo que **no** se maneja aquí, porque hace falta antes de poder leer la base de datos o porque es de otro sistema:
`DATABASE_URL` (conexión a la base), `SETTINGS_KEY` (clave de cifrado), y las variables de Sanity
(`NEXT_PUBLIC_SANITY_*`, `SANITY_API_*`). Esas siguen en Netlify.

## Paso a paso: conectar Google Analytics

Primero crear la propiedad y la cuenta de servicio con `docs/GA4.md`. Luego, en **Ajustes > Google Analytics**:

1. Pegar el **ID de medición** y guardar. Desde ahí el sitio público envía visitas y clics.
2. Pegar el **ID de la propiedad**, el **correo de la cuenta de servicio** y la **clave privada**
   (el campo `private_key` del archivo JSON, completo, con las líneas `-----BEGIN…` y `…END-----`).
3. Pulsar **Probar conexión con Google Analytics**. Debe responder con los visitantes de los últimos 7 días.
   Si falla, el mensaje dice la causa (API sin activar, cuenta sin acceso a la propiedad, clave mal copiada).
4. Abrir **Dashboard**: aparece la sección «Tráfico del sitio».
5. Borrar el archivo JSON descargado.

## Paso a paso: cambiar el correo de salida

1. En Zoho crear una contraseña de aplicación (Seguridad > Contraseñas de aplicación).
2. **Ajustes > Correo de salida**: servidor, puerto, usuario, contraseña de aplicación y nombre.
3. Pulsar **Probar conexión con el correo**. Verifica las credenciales sin enviar ningún mensaje.
4. En **Destinatarios** definir quién recibe cotizaciones y emergencias.

Si el correo está mal configurado, el sitio no se cae: la solicitud queda guardada en el portal igual
y el cliente ve el mensaje de confirmación.

## Seguridad

- **Clave de cifrado.** Por defecto se deriva de `DATABASE_URL`. Es suficiente para empezar, pero si algún día se cambia
  la contraseña de la base, los secretos guardados dejan de poder leerse y hay que volver a cargarlos. Para evitarlo,
  definir en Netlify la variable `SETTINGS_KEY` con un texto largo y aleatorio **antes de cargar los secretos**, y no cambiarla.
  Si se cambia, el portal avisa en el registro del servidor y usa el valor del servidor hasta que se vuelva a guardar el secreto.
- Quien tiene acceso a la base de datos **y** a las variables del servidor puede descifrar los secretos. Mantener
  Neon y Netlify a nombre de la empresa, con pocas personas con acceso.
- Los secretos nunca viajan al navegador: el formulario no los muestra y la página solo dice si están definidos.
- Dar de baja a un usuario de Gerencia en **Usuarios** le quita el acceso a Ajustes de inmediato.
- Si se sospecha que una clave se filtró: generar una nueva en Google o Zoho, guardarla en Ajustes y revocar la anterior.

## Para quien desarrolla

- Definición de los ajustes: `src/lib/settings.ts` (`AJUSTES`). Para agregar uno nuevo se añade una entrada
  (clave, grupo, etiqueta, ayuda, si es secreto, validación) y se lee con `await getSetting("CLAVE")`.
- Tablas: `ajustes` y `ajustes_historial` en `db/schema.sql`; se crean con `pnpm portal migrate`.
- El correo (`src/lib/mail.ts`), las solicitudes (`src/lib/leads.ts`) y el conector de GA4 (`src/lib/portal/ga4.ts`)
  ya leen de `getSetting`. El ID de medición lo entrega `/api/ga-id` (público, en caché 5 minutos).
- Consulta directa (solo diagnóstico; los secretos salen cifrados):
  `select clave, secreto, actualizado_en from ajustes;`
