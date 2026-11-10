'use client'

import { useEffect, useRef } from 'react'

import { Imagen } from '@/components/Imagen'
import { detalles } from '@/lib/detalles'
import type { Pieza } from '@/lib/vista'

type Props = {
  piezas: Pieza[]
  indice: number
  alCambiar: (indice: number) => void
  alCerrar: () => void
}

const ALTO_MAXIMO = 'max-h-[calc(100svh-11rem)]'

function Contenido({ pieza }: { pieza: Pieza }) {
  if (pieza.tipo === 'video' && pieza.video) {
    return (
      <video
        key={pieza.id}
        controls
        autoPlay
        playsInline
        poster={pieza.portada?.src}
        className={`${ALTO_MAXIMO} max-w-full rounded-[4px]`}
      >
        <source src={pieza.video.src} type={pieza.video.tipo} />
      </video>
    )
  }

  if (pieza.tipo === 'youtube' && pieza.youtubeId) {
    const vertical = pieza.orientacion === 'vertical'
    return (
      <div
        className={`${ALTO_MAXIMO} bg-suave overflow-hidden rounded-[4px] ${
          vertical
            ? 'aspect-[9/16] h-[calc(100svh-11rem)]'
            : 'aspect-video w-full max-w-[min(72rem,calc((100svh-11rem)*16/9))]'
        }`}
      >
        {/* Modo privado de YouTube: no deja cookies de rastreo hasta que la persona reproduce. */}
        <iframe
          key={pieza.id}
          src={`https://www.youtube-nocookie.com/embed/${pieza.youtubeId}?autoplay=1&rel=0&playsinline=1`}
          title={pieza.titulo}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
    )
  }

  if (pieza.tipo === 'foto' && pieza.foto) {
    return (
      <Imagen
        key={pieza.id}
        imagen={pieza.foto}
        sizes="100vw"
        prioridad
        className={`${ALTO_MAXIMO} h-auto w-auto max-w-full rounded-[4px] object-contain`}
      />
    )
  }

  return null
}

/** Muestra un trabajo en grande. Flechas o deslizar para pasar al siguiente; Escape para cerrar. */
export function Visor({ piezas, indice, alCambiar, alCerrar }: Props) {
  const botonCerrar = useRef<HTMLButtonElement>(null)
  const inicioToque = useRef<number | null>(null)
  const pieza = piezas[indice]
  const total = piezas.length

  const ir = (paso: number) => alCambiar((indice + paso + total) % total)

  useEffect(() => {
    botonCerrar.current?.focus()
  }, [])

  useEffect(() => {
    const alPresionar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') alCerrar()
      if (total > 1 && e.key === 'ArrowRight') alCambiar((indice + 1) % total)
      if (total > 1 && e.key === 'ArrowLeft') alCambiar((indice - 1 + total) % total)
    }
    window.addEventListener('keydown', alPresionar)
    return () => window.removeEventListener('keydown', alPresionar)
  }, [indice, total, alCambiar, alCerrar])

  if (!pieza) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={pieza.titulo}
      className="bg-fondo fixed inset-0 z-[60] flex flex-col"
      onTouchStart={(e) => {
        inicioToque.current = e.touches[0]?.clientX ?? null
      }}
      onTouchEnd={(e) => {
        const inicio = inicioToque.current
        const fin = e.changedTouches[0]?.clientX
        if (inicio == null || fin == null || total < 2) return
        if (Math.abs(fin - inicio) > 60) ir(fin < inicio ? 1 : -1)
      }}
    >
      <div className="flex items-center justify-between px-5 py-4 md:px-10">
        <p className="text-gris text-sm tabular-nums">
          {indice + 1} / {total}
        </p>
        <button
          ref={botonCerrar}
          type="button"
          onClick={alCerrar}
          className="border-linea hover:bg-tinta hover:text-fondo rounded-full border px-5 py-2 text-sm transition-colors"
        >
          Cerrar
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-5 md:px-24">
        <Contenido pieza={pieza} />
        {total > 1 &&
          ([-1, 1] as const).map((paso) => (
            <button
              key={paso}
              type="button"
              onClick={() => ir(paso)}
              aria-label={paso === -1 ? 'Anterior' : 'Siguiente'}
              className={`border-linea bg-fondo/90 hover:bg-tinta hover:text-fondo absolute top-1/2 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full border transition-colors md:grid ${
                paso === -1 ? 'left-6' : 'right-6'
              }`}
            >
              <span aria-hidden="true">{paso === -1 ? '←' : '→'}</span>
            </button>
          ))}
      </div>

      <div className="px-5 py-5 text-center md:px-10">
        <p className="font-display text-2xl leading-tight">{pieza.titulo}</p>
        {detalles(pieza) && <p className="text-gris text-sm">{detalles(pieza)}</p>}
      </div>
    </div>
  )
}
