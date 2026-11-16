'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { IconoReproducir, Medio, proporcion } from '@/components/Medio'
import { Visor } from '@/components/Visor'
import { detalles } from '@/lib/detalles'
import { bloquearScroll } from '@/lib/scroll'
import type { Pieza } from '@/lib/vista'

const TAMANO_CUADRICULA = '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'

function Miniatura({ pieza, alAbrir }: { pieza: Pieza; alAbrir: () => void }) {
  return (
    <button
      type="button"
      onClick={alAbrir}
      aria-label={`Ver ${pieza.titulo}`}
      className="group block w-full text-left"
    >
      <div
        className="bg-suave relative overflow-hidden rounded-[4px]"
        style={{ aspectRatio: proporcion(pieza) }}
      >
        <Medio pieza={pieza} sizes={TAMANO_CUADRICULA} />
        {pieza.tipo !== 'foto' && (
          <span className="bg-fondo/90 text-tinta absolute bottom-3 left-3 grid h-10 w-10 place-items-center rounded-full transition-transform group-hover:scale-110">
            <IconoReproducir />
          </span>
        )}
      </div>
      <p className="mt-3 font-medium">{pieza.titulo}</p>
      {detalles(pieza) && <p className="text-gris text-sm">{detalles(pieza)}</p>}
    </button>
  )
}

/** Cuadrícula de trabajos de una categoría, en su propia página. Cada uno se abre en el visor. */
export function Galeria({ piezas }: { piezas: Pieza[] }) {
  const [indice, setIndice] = useState<number | null>(null)
  const tocado = useRef<HTMLElement | null>(null)
  const cerrarVisor = useCallback(() => setIndice(null), [])

  const abierto = indice !== null
  useEffect(() => {
    if (!abierto) return
    bloquearScroll(true)
    return () => {
      bloquearScroll(false)
      tocado.current?.focus({ preventScroll: true })
    }
  }, [abierto])

  if (piezas.length === 0) {
    return (
      <div className="px-5 py-32 text-center md:px-10">
        <p className="font-display text-4xl">Pronto habrá trabajos aquí</p>
      </div>
    )
  }

  return (
    <>
      <ul className="columns-1 gap-4 px-5 py-12 sm:columns-2 md:gap-6 md:px-10 md:py-16 lg:columns-3">
        {piezas.map((pieza, i) => (
          <li key={pieza.id} data-aparecer className="mb-8 break-inside-avoid md:mb-10">
            <Miniatura
              pieza={pieza}
              alAbrir={() => {
                tocado.current = document.activeElement as HTMLElement | null
                setIndice(i)
              }}
            />
          </li>
        ))}
      </ul>
      {indice !== null && (
        <Visor piezas={piezas} indice={indice} alCambiar={setIndice} alCerrar={cerrarVisor} />
      )}
    </>
  )
}
