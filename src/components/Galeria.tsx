'use client'

/* eslint-disable @next/next/no-img-element -- La portada de respaldo viene de YouTube. */
import { useCallback, useEffect, useRef, useState } from 'react'

import { Imagen } from '@/components/Imagen'
import { VideoVista } from '@/components/VideoVista'
import { Visor } from '@/components/Visor'
import { detalles } from '@/lib/detalles'
import { bloquearScroll } from '@/lib/scroll'
import type { CategoriaVista, Pieza } from '@/lib/vista'

const TAMANO_CUADRICULA = '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'

function IconoReproducir() {
  return (
    <svg viewBox="0 0 24 24" className="ml-0.5 h-4 w-4" aria-hidden="true">
      <path d="M7 4.5v15l13-7.5z" fill="currentColor" />
    </svg>
  )
}

function Miniatura({ pieza, alAbrir }: { pieza: Pieza; alAbrir: () => void }) {
  const foto = pieza.foto
  const proporcion =
    pieza.tipo === 'foto'
      ? foto?.width && foto.height
        ? `${foto.width} / ${foto.height}`
        : '4 / 5'
      : pieza.orientacion === 'vertical'
        ? '9 / 16'
        : '16 / 9'

  return (
    <button
      type="button"
      onClick={alAbrir}
      aria-label={`Ver ${pieza.titulo}`}
      className="group block w-full text-left"
    >
      <div
        className="bg-suave relative overflow-hidden rounded-[4px]"
        style={{ aspectRatio: proporcion }}
      >
        {pieza.tipo === 'video' && pieza.video && (
          <VideoVista
            video={pieza.video}
            poster={pieza.portada?.src}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        {pieza.tipo === 'youtube' &&
          (pieza.portada ? (
            <Imagen
              imagen={pieza.portada}
              sizes={TAMANO_CUADRICULA}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <img
              src={`https://i.ytimg.com/vi/${pieza.youtubeId}/hqdefault.jpg`}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
          ))}
        {pieza.tipo === 'foto' && foto && (
          <Imagen
            imagen={foto}
            sizes={TAMANO_CUADRICULA}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
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

type Props = { categoria: CategoriaVista; alCerrar: () => void }

export function Galeria({ categoria, alCerrar }: Props) {
  const [indice, setIndice] = useState<number | null>(null)
  const botonCerrar = useRef<HTMLButtonElement>(null)
  const { piezas } = categoria

  useEffect(() => {
    const anterior = document.activeElement as HTMLElement | null
    bloquearScroll(true)
    botonCerrar.current?.focus()
    return () => {
      bloquearScroll(false)
      anterior?.focus()
    }
  }, [])

  const cerrarVisor = useCallback(() => setIndice(null), [])

  useEffect(() => {
    // Con una foto o video abierto, Escape cierra primero ese visor (lo maneja el Visor).
    if (indice !== null) return
    const alPresionar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') alCerrar()
    }
    window.addEventListener('keydown', alPresionar)
    return () => window.removeEventListener('keydown', alPresionar)
  }, [indice, alCerrar])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Galería de ${categoria.nombre}`}
      data-lenis-prevent
      className="bg-fondo fixed inset-0 z-50 overflow-y-auto overscroll-contain"
    >
      <div className="bg-fondo/90 border-linea sticky top-0 z-10 flex items-center justify-between gap-4 border-b px-5 py-4 backdrop-blur-md md:px-10">
        <div className="flex items-baseline gap-4">
          <h2 className="font-display text-3xl leading-none md:text-4xl">{categoria.nombre}</h2>
          <span className="text-gris text-sm">
            {piezas.length} {piezas.length === 1 ? 'trabajo' : 'trabajos'}
          </span>
        </div>
        <button
          ref={botonCerrar}
          type="button"
          onClick={alCerrar}
          className="border-linea hover:bg-tinta hover:text-fondo rounded-full border px-5 py-2 text-sm transition-colors"
        >
          Cerrar
        </button>
      </div>

      {piezas.length === 0 ? (
        <div className="px-5 py-32 text-center md:px-10">
          <p className="font-display text-4xl">Pronto habrá trabajos aquí</p>
        </div>
      ) : (
        <ul className="columns-1 gap-4 px-5 py-8 sm:columns-2 md:gap-6 md:px-10 md:py-12 lg:columns-3">
          {piezas.map((pieza, i) => (
            <li key={pieza.id} className="mb-8 break-inside-avoid md:mb-10">
              <Miniatura pieza={pieza} alAbrir={() => setIndice(i)} />
            </li>
          ))}
        </ul>
      )}

      {indice !== null && (
        <Visor piezas={piezas} indice={indice} alCambiar={setIndice} alCerrar={cerrarVisor} />
      )}
    </div>
  )
}
