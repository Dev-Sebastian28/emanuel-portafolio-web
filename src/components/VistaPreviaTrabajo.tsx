'use client'

import { useLivePreview } from '@payloadcms/live-preview-react'

import { IconoReproducir, Medio, proporcion } from '@/components/Medio'
import { ContenidoVisor } from '@/components/Visor'
import { detalles } from '@/lib/detalles'
import { aPieza, sePuedeMostrar } from '@/lib/mapeo'
import type { Trabajo } from '@/payload-types'

const QUE_FALTA: Record<Trabajo['tipo'], string> = {
  video: 'subir el video',
  youtube: 'pegar un link de YouTube que funcione',
  foto: 'subir la foto',
}

function Nota({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-5 py-24 text-center md:px-10">
      <p className="text-gris mx-auto max-w-md text-lg">{children}</p>
    </div>
  )
}

/**
 * Muestra un trabajo como se verá en la página: en la galería y abierto en grande.
 * Dentro del panel se actualiza mientras se escribe, aunque no se haya guardado.
 */
export function VistaPreviaTrabajo({
  inicial,
  servidor,
}: {
  inicial: Trabajo | null
  servidor: string
}) {
  const { data: trabajo } = useLivePreview<Partial<Trabajo>>({
    initialData: inicial ?? {},
    serverURL: servidor,
    depth: 1,
  })

  const publicado = trabajo._status === 'published'
  const categoria =
    trabajo.categoria && typeof trabajo.categoria === 'object'
      ? trabajo.categoria.nombre
      : undefined

  const encabezado = (
    <header className="border-linea flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4 md:px-10">
      <p className="etiqueta">Vista previa</p>
      <span
        className={`rounded-full px-3 py-1 text-xs ${publicado ? 'bg-tinta text-fondo' : 'bg-suave'}`}
      >
        {publicado ? 'Publicado' : 'Borrador · todavía no se ve en la página'}
      </span>
    </header>
  )

  if (!trabajo.tipo) {
    return (
      <main className="min-h-svh">
        {encabezado}
        <Nota>Cuando se llenen los datos del trabajo, aquí aparece cómo se verá en la página.</Nota>
      </main>
    )
  }

  const pieza = aPieza({
    ...trabajo,
    id: trabajo.id ?? 0,
    titulo: trabajo.titulo?.trim() || 'Sin título',
  } as Trabajo)

  if (!sePuedeMostrar(pieza)) {
    return (
      <main className="min-h-svh">
        {encabezado}
        <Nota>
          Todavía no hay nada que mostrar: falta {QUE_FALTA[pieza.tipo]}. Mientras falte, este
          trabajo no aparece en la página.
        </Nota>
      </main>
    )
  }

  return (
    <main className="min-h-svh pb-16">
      {encabezado}

      <section className="px-5 py-10 md:px-10">
        <p className="etiqueta">En la galería{categoria ? ` de ${categoria}` : ''}</p>
        <div className="mt-6 w-full sm:w-1/2 lg:w-1/3">
          <div
            className="bg-suave relative overflow-hidden rounded-[4px]"
            style={{ aspectRatio: proporcion(pieza) }}
          >
            <Medio pieza={pieza} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
            {pieza.tipo !== 'foto' && (
              <span className="bg-fondo/90 text-tinta absolute bottom-3 left-3 grid h-10 w-10 place-items-center rounded-full">
                <IconoReproducir />
              </span>
            )}
          </div>
          <p className="mt-3 font-medium">{pieza.titulo}</p>
          {detalles(pieza) && <p className="text-gris text-sm">{detalles(pieza)}</p>}
        </div>
      </section>

      <section className="border-linea border-t px-5 py-10 md:px-10">
        <p className="etiqueta">Al abrirlo en grande</p>
        <div className="mt-6 flex justify-center">
          <ContenidoVisor pieza={pieza} />
        </div>
        <div className="mt-5 text-center">
          <p className="font-display text-2xl leading-tight">{pieza.titulo}</p>
          {detalles(pieza) && <p className="text-gris text-sm">{detalles(pieza)}</p>}
        </div>
      </section>

      {trabajo.carrusel && (
        <p className="text-gris border-linea border-t px-5 pt-8 text-center text-sm md:px-10">
          También sale en el carrusel del inicio de la página.
        </p>
      )}
    </main>
  )
}
