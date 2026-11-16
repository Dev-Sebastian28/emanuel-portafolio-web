import 'lenis/dist/lenis.css'
import './globals.css'

import type { Metadata } from 'next'
import localFont from 'next/font/local'
import type { ReactNode } from 'react'

import { Analitica } from '@/components/Analitica'
import { ScrollSuave } from '@/components/ScrollSuave'
import { INDEXAR, URL_SITIO } from '@/lib/seo'
import { obtenerSitio } from '@/lib/vista'

// Las fuentes están guardadas en el proyecto (src/fonts, licencia libre OFL) y se sirven desde
// la misma página: no dependen de Google al armarla ni al abrirla.
const serif = localFont({
  src: [
    { path: '../../fonts/InstrumentSerif-Regular.ttf', style: 'normal', weight: '400' },
    { path: '../../fonts/InstrumentSerif-Italic.ttf', style: 'italic', weight: '400' },
  ],
  variable: '--font-instrument-serif',
  display: 'swap',
})

const sans = localFont({
  src: '../../fonts/InstrumentSans.ttf',
  weight: '400 700',
  variable: '--font-instrument-sans',
  display: 'swap',
})

/** Lo general para Google; cada página pone su título, descripción e imagen. */
export async function generateMetadata(): Promise<Metadata> {
  const sitio = await obtenerSitio()
  return {
    metadataBase: new URL(URL_SITIO),
    title: { default: sitio.nombre, template: `%s — ${sitio.nombre}` },
    applicationName: sitio.nombre,
    icons: { icon: '/icono.svg' },
    // Mientras no esté el dominio propio (INDEXAR=1), Google no la muestra.
    robots: INDEXAR ? { index: true, follow: true } : { index: false, follow: false },
    // Código de Search Console para comprobar que la página es de Emanuel.
    verification: process.env.NEXT_PUBLIC_GOOGLE_VERIFICACION
      ? { google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICACION }
      : undefined,
    openGraph: { type: 'website', locale: 'es_CO', siteName: sitio.nombre },
    twitter: { card: 'summary_large_image' },
  }
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={`${serif.variable} ${sans.variable}`}>
      <body className="font-sans">
        <noscript>
          <style>{'#pantalla-carga{display:none}'}</style>
        </noscript>
        <ScrollSuave />
        {children}
        <Analitica />
      </body>
    </html>
  )
}
