# Configurar el botón de asociación

Los botones promocionales **Asociate**, **Quiero asociarme** y los CTA de asociación del banner principal comparten un único destino. Se puede cambiar desde el panel de administración sin modificar código ni volver a desplegar.

## Cambiar el destino

1. Ingresá al panel de ACAV.
2. En el menú, abrí **CTA Asociarse** (`/admin/configuracion/cta`).
3. Elegí el tipo de destino:
   - **Una URL**: ingresá una ruta interna como `/socios/asociate` o una URL completa `https://...`.
   - **WhatsApp**: ingresá el teléfono internacional con código de país, solo dígitos (por ejemplo, `5493511234567`) y el mensaje que debe aparecer precargado.
4. Presioná **Guardar destino**. El cambio se aplica a los botones del sitio.

Los enlaces externos y de WhatsApp se abren en una pestaña nueva. Si no existe una configuración guardada, el destino predeterminado es `/socios/asociate`.

## Botones afectados

La configuración se usa en el botón principal del encabezado, el menú, los pies de página y los CTA de asociación de Inicio, Socios, Quiénes somos y Convenios y Beneficios. También se aplica a los botones del banner administrable cuando su texto indica asociación o su destino es `/socios/asociate`.

Los botones internos del formulario de ingreso en `/socios/asociate` permanecen sin cambios para no interrumpir el proceso de solicitud.

## Para desarrolladores

- El enlace compartido está implementado en `src/app/components/association-cta.tsx`.
- El modo y los datos se guardan en Firestore, documento `siteSettings/associationCta`.
- La lectura pública se sirve desde `GET /api/association-cta`; la escritura requiere sesión de administración en `PUT /api/admin/association-cta`.
- Para conectar un nuevo CTA de asociación al destino global, usá `AssociationCtaLink`. Para CTA configurables en el banner, `isAssociationCta(label, href)` detecta los textos y rutas de asociación.
