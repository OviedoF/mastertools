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
- [ ] Plazos de primer contacto (`PLAZO_PRIMER_CONTACTO_H` en `src/lib/portal/model.ts`): hoy 24 h cotización, 1 h emergencia, pendientes de confirmar con el cliente.
