/* eslint-disable @next/next/no-img-element -- La portada de respaldo viene de YouTube. */
import { Imagen } from '@/components/Imagen'
import { VideoVista } from '@/components/VideoVista'
import type { Pieza } from '@/lib/vista'

const LLENAR = 'absolute inset-0 h-full w-full object-cover'

/** Proporción (ancho / alto) con que se muestra un trabajo en miniatura. */
export function proporcion(pieza: Pieza): number {
  const foto = pieza.foto
  if (pieza.tipo === 'foto') return foto?.width && foto.height ? foto.width / foto.height : 4 / 5
  return pieza.orientacion === 'vertical' ? 9 / 16 : 16 / 9
}

export function IconoReproducir() {
  return (
    <svg viewBox="0 0 24 24" className="ml-0.5 h-4 w-4" aria-hidden="true">
      <path d="M7 4.5v15l13-7.5z" fill="currentColor" />
    </svg>
  )
}

/**
 * Lo que se ve de un trabajo en miniatura, llenando su recuadro: la foto, la vista previa
 * sin sonido del video corto o la portada del video de YouTube.
 */
export function Medio({
  pieza,
  sizes,
  className = LLENAR,
}: {
  pieza: Pieza
  sizes: string
  className?: string
}) {
  if (pieza.tipo === 'video' && pieza.video) {
    return <VideoVista video={pieza.video} poster={pieza.portada?.src} className={className} />
  }

  if (pieza.tipo === 'youtube') {
    return pieza.portada ? (
      <Imagen imagen={pieza.portada} sizes={sizes} className={className} />
    ) : (
      <img
        src={`https://i.ytimg.com/vi/${pieza.youtubeId}/hqdefault.jpg`}
        alt=""
        loading="lazy"
        className={className}
      />
    )
  }

  if (pieza.tipo === 'foto' && pieza.foto) {
    return <Imagen imagen={pieza.foto} sizes={sizes} className={className} />
  }

  return null
}
