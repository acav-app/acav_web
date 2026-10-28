This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Solicitud de ingreso ACAV

El formulario digital usa Firestore (borradores y auditoría), el bucket R2 existente y Resend para los emails. Configurá estas variables en desarrollo y en el entorno de despliegue:

```env
R2_ENDPOINT=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
SOLICITUD_ADMIN_EMAIL=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Las variables de Firebase Admin/cliente existentes también deben estar configuradas. Configurar además `ADMIN_ALLOWED_EMAILS` con una lista separada por comas de las cuentas autorizadas para ver DNI, documentación fiscal y auditoría. El panel digital bloquea el acceso si esta lista está vacía. `RESEND_FROM_EMAIL` debe pertenecer a un dominio verificado en Resend. En producción, `NEXT_PUBLIC_SITE_URL` debe ser el origen HTTPS público.

**Almacenamiento de documentos:** el flujo usa `R2_BUCKET`, compartido con el contenido del sitio. Las credenciales R2 necesitan permisos de lectura y escritura para subir, inspeccionar, copiar y borrar objetos. El navegador sube con URLs prefirmadas; configurá CORS en este bucket para el origen exacto del sitio (y `http://localhost:3000` en desarrollo), método `PUT` y los encabezados requeridos. **Si el bucket o `R2_PUBLIC_BASE` permite acceso público, los documentos del trámite también podrían ser accesibles por URL.** Los links de descarga del panel vencen en 60 segundos.

Configurar una regla de ciclo de vida para eliminar objetos del prefijo `solicitudes-ingreso-tmp/` luego de 1 día; ese prefijo solo contiene cargas temporales sin confirmar. Los documentos confirmados se copian a `solicitudes-ingreso/` dentro de `R2_BUCKET`.

El asistente guarda los borradores durante 30 días. Los enlaces de firma de aval vencen a los 10 días y solo se emiten en orden. Para mantener el control de abusos entre varias instancias de despliegue, reemplazar el rate limit en memoria por un límite compartido antes de exponer el endpoint a tráfico alto.

El PDF de cierre consolida los datos del trámite, la documentación declarada y las tres firmas. Los 12 archivos originales se descargan individualmente desde el panel administrativo; si `R2_BUCKET` es público, los enlaces del panel no impiden el acceso directo al objeto.

La rúbrica capturada en pantalla queda registrada como evidencia electrónica con timestamp, IP y navegador; no debe anunciarse como firma digital certificada ni como garantía de validez jurídica sin revisión legal específica.
