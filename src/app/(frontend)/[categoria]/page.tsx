import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Animaciones } from '@/components/Animaciones'
import { Contacto } from '@/components/Contacto'
import { DatosGoogle } from '@/components/DatosGoogle'
import { Encabezado } from '@/components/Encabezado'
import { Galeria } from '@/components/Galeria'
import { Pie } from '@/components/Pie'
import { descripcionCategoria, imagenParaCompartir, migaDePan } from '@/lib/seo'
import { obtenerPagina } from '@/lib/vista'

/*
 * Una página por categoría (…/bodas, …/15-anos), para que Google pueda mostrar cada una
 * cuando alguien busca, por ejemplo, "videógrafo de bodas en Bogotá".
 */

export const revalidate = 3600
// Solo existen las categorías creadas en el panel; cualquier otra dirección da "no encontrada".
export const dynamicParams = false

type Props = { params: Promise<{ categoria: string }> }

export async function generateStaticParams() {
  const { categorias } = await obtenerPagina()
  return categorias.map((c) => ({ categoria: c.slug }))
}

async function buscar(slug: string) {
  const datos = await obtenerPagina()
  const categoria = datos.categorias.find((c) => c.slug === slug)
  return categoria ? { ...datos, categoria } : null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const datos = await buscar((await params).categoria)
  if (!datos) return {}
  const { sitio, categoria } = datos
  const titulo = `${categoria.nombre} en Bogotá — Video y fotografía`
  const descripcion = descripcionCategoria(sitio, categoria)
  const portada =
    categoria.portada ?? categoria.piezas.find((p) => p.portada || p.foto)?.portada
  return {
    title: titulo,
    description: descripcion,
    alternates: { canonical: `/${categoria.slug}` },
    openGraph: {
      title: `${titulo} — ${sitio.nombre}`,
      description: descripcion,
      url: `/${categoria.slug}`,
      images: imagenParaCompartir(portada),
    },
  }
}

export default async function PaginaCategoria({ params }: Props) {
  const datos = await buscar((await params).categoria)
  if (!datos) notFound()
  const { sitio, categoria, categorias } = datos
  const otras = categorias.filter((c) => c.id !== categoria.id)
  const n = categoria.piezas.length

  return (
    <>
      <DatosGoogle datos={migaDePan(categoria)} />
      <Encabezado nombre={sitio.nombre} inicio="/" />
      <main className="pt-28 md:pt-36">
        <header className="px-5 md:px-10">
          <nav aria-label="Ruta" className="etiqueta">
            <Link href="/#trabajos" className="hover:text-tinta transition-colors">
              Trabajos
            </Link>
            <span aria-hidden="true"> / </span>
            <span className="text-tinta">{categoria.nombre}</span>
          </nav>
          <h1 className="font-display mt-6 text-[clamp(3.5rem,11vw,10rem)] leading-[0.88] tracking-[-0.02em]">
            {categoria.nombre}
          </h1>
          <p className="text-gris mt-6 max-w-xl">{descripcionCategoria(sitio, categoria)}</p>
          <p className="etiqueta mt-4">
            {n} {n === 1 ? 'trabajo' : 'trabajos'}
          </p>
        </header>

        <Galeria piezas={categoria.piezas} />

        {otras.length > 0 && (
          <nav aria-label="Otras categorías" className="border-linea border-t px-5 py-16 md:px-10">
            <p className="etiqueta">Más trabajos</p>
            <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
              {otras.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/${c.slug}`}
                    className="font-display text-[clamp(2rem,4vw,3rem)] leading-none underline-offset-8 hover:underline"
                  >
                    {c.nombre}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <Contacto sitio={sitio} />
      </main>
      <Pie sitio={sitio} />
      <Animaciones />
    </>
  )
}
