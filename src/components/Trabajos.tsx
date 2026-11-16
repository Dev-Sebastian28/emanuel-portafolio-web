'use client'

import Link from 'next/link'
import { useRef } from 'react'

import { Imagen } from '@/components/Imagen'
import { Marcador } from '@/components/Marcador'
import { VideoVista } from '@/components/VideoVista'
import type { CategoriaVista } from '@/lib/vista'

const cuenta = (n: number) => `${n} ${n === 1 ? 'trabajo' : 'trabajos'}`

const claseMedio =
  'absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]'

export function Trabajos({ categorias }: { categorias: CategoriaVista[] }) {
  const pista = useRef<HTMLDivElement>(null)

  const mover = (direccion: 1 | -1) => {
    const el = pista.current
    if (el) el.scrollBy({ left: direccion * el.clientWidth * 0.8, behavior: 'smooth' })
  }

  return (
    <section id="trabajos" className="border-linea border-t py-24 md:py-36">
      <div data-aparecer className="flex items-end justify-between gap-6 px-5 md:px-10">
        <div>
          <p className="etiqueta">Trabajos</p>
          <h2 className="font-display mt-4 text-[clamp(3rem,8vw,7rem)] leading-[0.9]">Galería</h2>
          <p className="text-gris mt-5 max-w-md">
            Cada categoría abre su galería de videos y fotos.
          </p>
        </div>
        {categorias.length > 1 && (
          <div className="hidden gap-2 md:flex">
            {([-1, 1] as const).map((direccion) => (
              <button
                key={direccion}
                type="button"
                onClick={() => mover(direccion)}
                aria-label={direccion === -1 ? 'Categorías anteriores' : 'Más categorías'}
                className="border-linea hover:bg-tinta hover:text-fondo grid h-12 w-12 place-items-center rounded-full border transition-colors"
              >
                <span aria-hidden="true">{direccion === -1 ? '←' : '→'}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {categorias.length === 0 ? (
        <p className="text-gris mt-12 px-5 md:px-10">Pronto habrá trabajos aquí.</p>
      ) : (
        <div
          ref={pista}
          className="sin-barra mt-12 flex [scroll-snap-type:x_mandatory] scroll-px-5 gap-4 overflow-x-auto px-5 pb-2 md:mt-16 md:scroll-px-10 md:gap-6 md:px-10"
        >
          {categorias.map((categoria, i) => (
            <Link
              key={categoria.id}
              href={`/${categoria.slug}`}
              data-aparecer
              aria-label={`Abrir ${categoria.nombre}: ${cuenta(categoria.piezas.length)}`}
              className="group block w-[78vw] shrink-0 snap-start text-left sm:w-[44vw] lg:w-[30vw]"
            >
              <div className="bg-suave relative aspect-[3/4] overflow-hidden rounded-[4px]">
                {categoria.videoPortada ? (
                  <VideoVista
                    video={categoria.videoPortada}
                    poster={categoria.portada?.src}
                    className={claseMedio}
                  />
                ) : categoria.portada ? (
                  <Imagen
                    imagen={categoria.portada}
                    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 44vw, 78vw"
                    className={claseMedio}
                  />
                ) : (
                  <Marcador texto={categoria.nombre} detalle="Portada pendiente" />
                )}
                <span className="bg-fondo/90 text-tinta absolute top-4 left-4 rounded-full px-3 py-1 text-xs tracking-[0.18em] tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <div className="mt-5 flex items-baseline justify-between gap-4">
                <h3 className="font-display text-[clamp(2rem,3vw,2.75rem)] leading-none">
                  {categoria.nombre}
                </h3>
                <span className="text-gris text-sm whitespace-nowrap">
                  {cuenta(categoria.piezas.length)}
                </span>
              </div>
              {categoria.descripcion && (
                <p className="text-gris mt-2 text-sm">{categoria.descripcion}</p>
              )}
              <span className="mt-4 inline-flex items-center gap-2 text-sm underline-offset-4 group-hover:underline">
                Ver galería <span aria-hidden="true">→</span>
              </span>
            </Link>
          ))}
        </div>
      )}

    </section>
  )
}
