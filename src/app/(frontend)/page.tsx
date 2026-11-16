import type { Metadata } from 'next'

import { Animaciones } from '@/components/Animaciones'
import { Carrusel } from '@/components/Carrusel'
import { Contacto } from '@/components/Contacto'
import { DatosGoogle } from '@/components/DatosGoogle'
import { Encabezado } from '@/components/Encabezado'
import { Entrada } from '@/components/Entrada'
import { PantallaCarga } from '@/components/PantallaCarga'
import { Pie } from '@/components/Pie'
import { SobreMi } from '@/components/SobreMi'
import { Trabajos } from '@/components/Trabajos'
import { descripcionSitio, fichaNegocio, imagenParaCompartir } from '@/lib/seo'
import { obtenerPagina } from '@/lib/vista'

// La página se arma antes de publicarse y se vuelve a armar sola cuando se publica algo en el panel.
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const { sitio, categorias } = await obtenerPagina()
  const titulo = `${sitio.nombre} — Video y fotografía de bodas y eventos en Bogotá`
  const descripcion = descripcionSitio(
    sitio,
    categorias.map((c) => c.nombre),
  )
  return {
    title: { absolute: titulo },
    description: descripcion,
    alternates: { canonical: '/' },
    openGraph: {
      title: titulo,
      description: descripcion,
      url: '/',
      images: imagenParaCompartir(sitio.portadaEntrada),
    },
  }
}

export default async function Inicio() {
  const { sitio, categorias, carrusel } = await obtenerPagina()

  // Orden pedido por el cliente: entrada, carrusel, galería por categorías, sobre mí y contacto.
  return (
    <>
      <DatosGoogle datos={fichaNegocio(sitio, categorias)} />
      <PantallaCarga letra={sitio.nombre.charAt(0)} />
      <Encabezado nombre={sitio.nombre} />
      <main>
        <Entrada sitio={sitio} categorias={categorias.map((c) => c.nombre)} />
        <Carrusel piezas={carrusel} />
        <Trabajos categorias={categorias} />
        <SobreMi sitio={sitio} />
        <Contacto sitio={sitio} />
      </main>
      <Pie sitio={sitio} />
      <Animaciones />
    </>
  )
}
