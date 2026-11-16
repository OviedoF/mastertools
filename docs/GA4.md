# Conectar Google Analytics 4 al sitio y al dashboard

Todo es gratuito. La propiedad debe crearse con una cuenta de Google de Master Tools
(no personal), para que la empresa sea la dueña de los datos.

## 1. Crear la propiedad

1. Entrar a https://analytics.google.com con la cuenta de la empresa.
2. Administrar > Crear > Propiedad. Nombre: Master Tools. Zona horaria: Colombia. Moneda: peso colombiano.
3. Flujo de datos > Web > URL del sitio (la definitiva, p. ej. mastertools.tech; para pruebas, mastertools-demo.netlify.app).
4. Copiar el **ID de medición** (formato `G-XXXXXXXXXX`).
5. Administrar > Configuración de la propiedad: copiar el **ID de la propiedad** (solo números).

## 2. Activar la etiqueta en el sitio

Entrar al portal como Gerencia > **Ajustes > Google Analytics** y pegar el **ID de medición** `G-XXXXXXXXXX`.
No hace falta volver a publicar el sitio. (Alternativa: la variable `NEXT_PUBLIC_GA_ID` en Netlify; Ajustes tiene prioridad.)
Desde ahí el sitio envía visitas y cada clic de conversión
(llamar, WhatsApp, cotizar, emergencia, chat) como evento `cta_click`.
Sin la variable no se envía nada a Google.

## 3. Cuenta de servicio para que el portal lea los datos

1. https://console.cloud.google.com > crear un proyecto (o usar uno existente de la empresa).
2. APIs y servicios > Biblioteca > activar **Google Analytics Data API**.
3. IAM y administración > Cuentas de servicio > Crear. Nombre: `portal-analytics`. Sin roles.
4. En la cuenta creada: Claves > Agregar clave > JSON. Se descarga un archivo.
5. En Google Analytics: Administrar > Acceso a la propiedad > Agregar usuario con el correo de la cuenta de servicio
   (`...@...iam.gserviceaccount.com`), rol **Lector**.
6. En el portal, **Ajustes > Google Analytics** (rol Gerencia), cargar el ID de la propiedad, el correo de la cuenta de servicio
   (`client_email` del JSON) y la clave privada (`private_key` del JSON, completa). Pulsar **Probar conexión con Google Analytics**.
   Detalles y seguridad en `docs/AJUSTES.md`.

El archivo JSON no se sube al repositorio ni se comparte por chat: tras copiar los valores, se borra.

## 4. Ver los clics por botón (opcional)

El dashboard muestra el total de clics de conversión. Para desglosarlos por botón:
Administrar > Definiciones personalizadas > Crear dimensión personalizada >
Nombre `cta`, ámbito Evento, parámetro de evento `cta`. Los datos desglosados aparecen
desde ese momento (GA4 no los reconstruye hacia atrás).

## Notas

- Los datos de GA4 tardan hasta 24 a 48 horas en consolidarse; el portal los refresca cada 30 minutos.
- La etiqueta anonimiza la IP. Si la empresa quiere un aviso de cookies, debe agregarse antes de publicar en el dominio definitivo.
- Si el dashboard muestra "No se pudo leer Google Analytics", el mensaje indica la causa
  (credenciales mal copiadas, API sin activar o cuenta de servicio sin acceso a la propiedad).
