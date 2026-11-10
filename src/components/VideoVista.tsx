'use client'

import { useEffect, useRef } from 'react'

import type { ArchivoVideo } from '@/lib/vista'

type Props = {
  video: ArchivoVideo
  poster?: string
  className?: string
}

/**
 * Vista previa sin sonido: solo se descarga y reproduce cuando está en pantalla,
 * así no gasta los datos del celular con videos que la persona no está viendo.
 */
export function VideoVista({ video, poster, className }: Props) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const elemento = ref.current
    if (!elemento) return
    const menosMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting && !menosMovimiento) elemento.play().catch(() => {})
        else elemento.pause()
      },
      { threshold: 0.35 },
    )
    observador.observe(elemento)
    return () => observador.disconnect()
  }, [])

  return (
    <video
      ref={ref}
      className={className}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
    >
      <source src={video.src} type={video.tipo} />
    </video>
  )
}
