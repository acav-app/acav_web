import type { Metadata } from "next";
import { Manrope } from 'next/font/google'
import './assets/scss/tailwind.scss'
import './assets/css/material.css'

import { siteConfig } from "./config/site";
import WhatsappFloating from "./components/whatsapp-floating";

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
})


export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.seo.url),
  title: siteConfig.seo.title,
  description: siteConfig.seo.description,
  keywords: [...siteConfig.seo.keywords],
  authors: [{ name: siteConfig.brand.name }],
  creator: siteConfig.brand.name,
  openGraph: {
    title: siteConfig.seo.title,
    description: siteConfig.brand.tagline,
    url: siteConfig.seo.url,
    siteName: siteConfig.brand.name,
    images: [
      {
        url: siteConfig.seo.ogImage,
        width: 800,
        height: 600,
      },
    ],
    locale: siteConfig.seo.locale,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.seo.title,
    description: siteConfig.seo.description,
    images: [siteConfig.seo.ogImage],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="light scroll-smooth" dir="ltr">
      <body
        className={`${manrope.variable} font-manrope text-base text-slate-900 dark:text-white dark:bg-slate-900`}
      >
        {children}
        {siteConfig.contact.whatsapp ? <WhatsappFloating phone={siteConfig.contact.whatsapp} /> : null}
      </body>
    </html>
  );
}
