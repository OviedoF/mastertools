# Lista técnica de entrega (solo para desarrollo)

Esto no aparece en el portal: es lo que hace el equipo de desarrollo para que los pasos de
«Para dejar todo listo» (dashboard) se puedan cumplir. Guías completas en `docs/AJUSTES.md`,
`docs/GA4.md` y `docs/WHATSAPP.md`.

## En Netlify (variables de entorno)

- [ ] `SETTINGS_KEY`: texto largo y aleatorio (`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`).
      Definirla **antes** de cargar secretos en Ajustes y no cambiarla nunca. Guardarla en un lugar seguro.
- [ ] `DATABASE_URL` con la cadena de Neon que lleva `-pooler` en el host. Para `pnpm portal migrate` usar la directa.
- [ ] Volver a publicar después de cambiar variables.

## Base de datos

- [ ] `pnpm portal migrate` contra Neon cada vez que cambie `db/schema.sql` (la última agrega `puesta_en_marcha`).
- [ ] Crear los usuarios reales (`pnpm portal user correo "Nombre" rol` o desde Portal > Usuarios) y desactivar los `prueba.…`.
- [ ] Cargar `PORTAL_ALLOWED_DOMAINS` en Ajustes (ej. `mastertools.tech`) antes de crear usuarios desde el portal.

## Conexiones (con los datos que entregue el cliente)

- [ ] Correo: Ajustes > Correo de salida y Destinatarios; probar con el botón.
- [ ] Google Analytics: crear propiedad y cuenta de servicio (`docs/GA4.md`), cargar los cuatro datos en Ajustes, probar.
- [ ] WhatsApp: cuenta de Meta, número, token permanente y plantilla `aviso_emergencia` (`docs/WHATSAPP.md`), probar.
- [ ] Los pasos de «Para dejar todo listo» se marcan solos cuando la conexión queda cargada; los que no se pueden comprobar
      (plazos, prueba final) los marca la gerencia o desarrollo con el botón del dashboard.

## Verificar después de publicar

- [ ] Función programada `recordatorios` (Netlify > Logs > Functions): debe correr a las 13:00 UTC (8:00 Bogotá) con respuesta 200.
- [ ] Portal en celular.
- [ ] Descarga de un adjunto: que el archivo abra bien.
- [ ] Un usuario de cada rol: ve solo lo que le corresponde.
- [ ] Plazos de primer contacto (`PLAZO_PRIMER_CONTACTO_H` en `src/lib/portal/model.ts`): 24 h cotización, 12 h emergencia, confirmados por David el 18/11/2026.

## Qué hacer cuando el cliente le pase cada dato

El panel «Para dejar todo listo» le dice al cliente cómo conseguir cada dato. Usted lo carga así:

| El cliente le pasa | Usted hace | Se marca solo cuando |
| --- | --- | --- |
| Buzón, contraseña de aplicación de Zoho, correos de cotizaciones y de emergencias | Ajustes > Correo de salida (servidor `smtppro.zoho.com`, puerto 465, usuario, contraseña, nombre) y Destinatarios. Pulsar «Probar conexión con el correo». Zoho puede usar otro servidor según la región de la cuenta | `MAIL_USERNAME` y `MAIL_TO` están definidos |
| ID de medición (G-…) y ID de propiedad | Cargar `GA_MEASUREMENT_ID` y `GA4_PROPERTY_ID`. Crear su cuenta de servicio (`docs/GA4.md`: proyecto en Google Cloud, activar «Google Analytics Data API», cuenta de servicio, clave JSON) y **enviarle al cliente el correo de la cuenta de servicio** para que lo agregue como Lector. Cargar `GA4_CLIENT_EMAIL` y `GA4_PRIVATE_KEY`; probar con el botón | Hay ID de medición y las credenciales de GA4 |
| Acceso de administrador en Meta Business, número dedicado y números del equipo | `docs/WHATSAPP.md`: app de Meta, producto WhatsApp, número, usuario del sistema con token permanente, plantilla `aviso_emergencia`. Cargar los cinco datos y probar | Token, ID de número, destinatarios y plantilla están definidos |
| Lista de personas con rol | Primero `PORTAL_ALLOWED_DOMAINS` en Ajustes; luego Usuarios > Nuevo usuario por cada una, y desactivar los `prueba.…` | Hay usuarios activos que no son de prueba |
| «Los plazos están bien» o plazos nuevos | Si cambian: `PLAZO_PRIMER_CONTACTO_H` en `src/lib/portal/model.ts` y publicar | Marcar a mano |
| Fecha para la prueba final | Hacerla juntos; ver «Verificar después de publicar» | Marcar a mano |

Nota sobre GA4: si el cliente prefiere no depender de su proyecto de Google Cloud, la cuenta de servicio puede ser de usted;
el cliente solo agrega ese correo como Lector. Los datos siguen siendo del cliente. Aclárelo con él.
