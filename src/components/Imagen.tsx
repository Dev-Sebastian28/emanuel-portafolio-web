/* eslint-disable @next/next/no-img-element -- Las versiones de cada foto se crean una sola vez al
   subirla (en el panel), así que se sirven tal cual en vez de pasar por el optimizador de Next. */
import type { Imagen as ImagenDatos } from '@/lib/vista'

type Props = {
  imagen: ImagenDatos
  /** Qué ancho ocupa la foto en pantalla, para que el navegador elija el tamaño justo. */
  sizes: string
  className?: string
  prioridad?: boolean
}

export function Imagen({ imagen, sizes, className, prioridad = false }: Props) {
  return (
    <img
      src={imagen.src}
      srcSet={imagen.srcSet}
      sizes={sizes}
      alt={imagen.alt}
      width={imagen.width}
      height={imagen.height}
      loading={prioridad ? 'eager' : 'lazy'}
      fetchPriority={prioridad ? 'high' : undefined}
      decoding="async"
      className={className}
      style={{
        backgroundImage: imagen.desenfoque ? `url(${imagen.desenfoque})` : undefined,
        backgroundSize: 'cover',
        objectPosition: imagen.enfoque ? `${imagen.enfoque.x}% ${imagen.enfoque.y}%` : undefined,
      }}
    />
  )
}
