import 'lenis/dist/lenis.css'
import './globals.css'

import type { Metadata } from 'next'
import { Instrument_Sans, Instrument_Serif } from 'next/font/google'
import type { ReactNode } from 'react'

import { ScrollSuave } from '@/components/ScrollSuave'
import { obtenerSitio } from '@/lib/vista'

// Las fuentes se descargan al armar la página y se sirven desde la misma página (no desde Google).
const serif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-instrument-serif',
  display: 'swap',
})

const sans = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-instrument-sans',
  display: 'swap',
})

export async function generateMetadata(): Promise<Metadata> {
  const sitio = await obtenerSitio()
  const titulo = [sitio.nombre, sitio.profesion].filter(Boolean).join(' — ')
  const descripcion = `${sitio.nombre}: bodas, 15 años y eventos${sitio.ciudad ? ` en ${sitio.ciudad}` : ''}.`
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'),
    title: titulo,
    description: descripcion,
    icons: { icon: '/icono.svg' },
    openGraph: {
      title: titulo,
      description: descripcion,
      type: 'website',
      locale: 'es_CO',
      images: sitio.portadaEntrada ? [{ url: sitio.portadaEntrada.src }] : undefined,
    },
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
      </body>
    </html>
  )
}
