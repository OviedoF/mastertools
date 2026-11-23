# Aviso de emergencias por WhatsApp

Cada vez que llega una emergencia (por el formulario de emergencias o por Manta), el sitio puede enviar un mensaje de
WhatsApp al equipo de turno con el resumen: número de caso, nombre, teléfono, ciudad, falla y si hay riesgo.
Usa la **API oficial de WhatsApp Business (Cloud API de Meta)**. Es independiente del correo y de los avisos del portal:
si falla, la emergencia igual queda registrada, avisada por correo y en la campana del portal.

> Esto lo configura la empresa con su propia cuenta de Meta. No se puede probar sin esos datos, y la primera
> aprobación de la plantilla toma de unas horas a un par de días. Mientras tanto, el aviso por correo y por el portal funciona.

## Qué hay que tener

1. Una cuenta de **Meta Business** a nombre de Master Tools (business.facebook.com) verificada.
2. Un **número de teléfono dedicado** para el aviso (no puede estar activo en la app de WhatsApp normal).
   Puede ser un número nuevo; los destinatarios son los números del equipo.
   **Número definido por Master Tools (21 de noviembre de 2026): +57 312 425 9438.** No debe estar en uso en la app de WhatsApp.
3. Una **plantilla de mensaje aprobada**. Los mensajes que inicia la empresa, fuera de una conversación abierta
   por el cliente, solo pueden ser plantillas.

## Paso a paso

1. Entrar a https://developers.facebook.com con la cuenta de la empresa > Crear app > tipo **Empresa** > agregar el producto **WhatsApp**.
2. En WhatsApp > Configuración de la API: agregar y verificar el número. Copiar el **Identificador del número de teléfono**.
3. En business.facebook.com > Configuración del negocio > Usuarios > **Usuarios del sistema**: crear uno (rol Administrador),
   asignarle la app y generar un **token** con el permiso `whatsapp_business_messaging` (y `whatsapp_business_management`).
   Elegir **sin vencimiento**. Ese es el token permanente (el temporal de la pantalla de pruebas dura 24 horas y no sirve).
4. En el Administrador de WhatsApp > Plantillas de mensajes > Crear:
   - Categoría: **Utilidad**. Idioma: Español (`es`). Nombre: `aviso_emergencia`.
   - Cuerpo, con exactamente una variable:
     `Emergencia nueva en Master Tools: {{1}}. Ábrala en el portal para atenderla.`
   - Enviar a revisión y esperar la aprobación.
5. En el portal: **Ajustes > Aviso de emergencias por WhatsApp**, cargar:

| Ajuste | Valor |
| --- | --- |
| ID del número de WhatsApp Business | el identificador del paso 2 |
| Token de acceso permanente | el token del paso 3 (se guarda cifrado) |
| Nombre de la plantilla aprobada | `aviso_emergencia` |
| Idioma de la plantilla | `es` |
| Números que reciben el aviso | ya no es un ajuste de texto: es una lista en Ajustes > WhatsApp (agregar, editar, desactivar, quitar). Cada número puede recibir siempre o solo fuera de horario (lunes a viernes 8:00 a 16:00) |

6. Pulsar **Enviar mensaje de prueba por WhatsApp**. Debe llegar a cada número un mensaje de la plantilla con un texto de prueba.

## Segunda plantilla: servicios a técnicos (app de campo)

Con el mismo número y el mismo token, el portal avisa a cada técnico cuando le asignan, reasignan, reprograman o
cancelan un servicio. El mensaje trae un botón que abre el servicio en la app MT Campo.

1. En el Administrador de WhatsApp > Plantillas > Crear:
   - Categoría: **Utilidad**. Idioma: Español (`es`, el mismo de la primera). Nombre: `servicio_tecnico`.
   - Cuerpo, con exactamente dos variables (Meta no deja que el texto termine en una variable):
     `Hola {{1}}, hay una actualización en su orden de trabajo de campo: {{2}} Toque el botón para abrirlo en la app MT Campo.`
     Ejemplos para la revisión de Meta: {{1}} `Carlos`; {{2}} `le asignamos el servicio MT-2026-00012 · Cambio de medidor · Panadería La Espiga, Calle 30 # 21-45, Soledad, para el lunes 23 de noviembre a las 10:30 a. m.`
   - Botón: **Visitar sitio web** > tipo **Dinámico** > texto `Abrir servicio` > URL `https://mastertools.tech/campo/s/{{1}}`
     (ejemplo: `https://mastertools.tech/campo/s/3f2a9c1e-0000-0000-0000-000000000000`).
2. En el portal: **Ajustes > WhatsApp a los técnicos** > `servicio_tecnico`.
3. En **Usuarios**, cargar el teléfono de WhatsApp de cada técnico (es obligatorio al crear un técnico).
   Cada técnico debe escribirle antes un «hola» al número de avisos o aceptar recibir mensajes.
4. Pulsar **Enviar mensaje de prueba a los técnicos**.

Cada envío (o el motivo por el que no salió: sin configurar, sin teléfono, error de Meta) queda en la tabla
`campo_notificaciones`. Al avisar una asignación, el servicio pasa de *Programado* a *Notificado*.

Prueba sin enviar mensajes reales (servidor de Meta simulado, base local):
`DATABASE_URL=<local> npx tsx --conditions=react-server scripts/probar-whatsapp-campo.mts`

## Si no llega

El botón de prueba muestra el error de Meta. Los más comunes:

| Mensaje | Causa |
| --- | --- |
| `HTTP 401` / `Invalid OAuth access token` | Token vencido o sin el permiso. Generar uno permanente (paso 3) |
| `HTTP 400` · `template name does not exist` | La plantilla aún no está aprobada, o el nombre o el idioma no coinciden |
| `HTTP 400` · `Parameter ... invalid` | La plantilla tiene más de una variable o ninguna. Debe tener solo `{{1}}` |
| `HTTP 403` / `(#131030)` | El número destino no está permitido (cuentas en modo de prueba solo envían a números verificados) |
| Enviado pero no llega | El destinatario bloqueó el número o no tiene WhatsApp |

## Costo y límites

Meta cobra por conversación iniciada por la empresa (categoría Utilidad); con pocas emergencias al mes el costo es de centavos de dólar.
Consultar la tarifa vigente para Colombia en la documentación de Meta antes de activar. Un número de prueba de Meta permite hasta 5 destinatarios gratis.

## Seguridad

- El token se guarda cifrado en la base (ver `docs/AJUSTES.md`) y nunca se muestra en pantalla.
- El mensaje incluye el nombre y el teléfono de quien reporta la emergencia: enviarlo solo a personas del equipo.
- Para desactivarlo: en Ajustes, «Quitar» en cualquiera de los datos de WhatsApp (por ejemplo, el token), o desactive los números de la lista.
