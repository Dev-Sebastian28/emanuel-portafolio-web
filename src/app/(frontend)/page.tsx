import { Animaciones } from '@/components/Animaciones'
import { Contacto } from '@/components/Contacto'
import { Encabezado } from '@/components/Encabezado'
import { Entrada } from '@/components/Entrada'
import { PantallaCarga } from '@/components/PantallaCarga'
import { Pie } from '@/components/Pie'
import { SobreMi } from '@/components/SobreMi'
import { Trabajos } from '@/components/Trabajos'
import { obtenerPagina } from '@/lib/vista'

// La página se arma antes de publicarse y se vuelve a armar sola cuando se publica algo en el panel.
export const revalidate = 3600

export default async function Inicio() {
  const { sitio, categorias } = await obtenerPagina()

  return (
    <>
      <PantallaCarga letra={sitio.nombre.charAt(0)} />
      <Encabezado nombre={sitio.nombre} />
      <main>
        <Entrada sitio={sitio} />
        <Trabajos categorias={categorias} />
        <SobreMi sitio={sitio} />
        <Contacto sitio={sitio} />
      </main>
      <Pie sitio={sitio} />
      <Animaciones />
    </>
  )
}
