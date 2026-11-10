'use client'

import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useRef } from 'react'

import { Marcador } from '@/components/Marcador'
import { EVENTO_LISTA } from '@/components/PantallaCarga'
import type { SitioVista } from '@/lib/vista'

gsap.registerPlugin(useGSAP, ScrollTrigger)

export function Entrada({ sitio }: { sitio: SitioVista }) {
  const seccion = useRef<HTMLElement>(null)
  const palabras = sitio.nombre.split(/\s+/).filter(Boolean)
  const hayVideo = Boolean(sitio.videoEntrada || sitio.videoEntradaVertical)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // 1. El nombre sube palabra por palabra cuando termina la pantalla de carga.
        const intro = gsap
          .timeline({ paused: true })
          .from('[data-palabra]', {
            yPercent: 110,
            duration: 1.2,
            ease: 'power4.out',
            stagger: 0.12,
          })
          .from('[data-sub]', { opacity: 0, y: 12, duration: 0.8, ease: 'power2.out' }, '-=0.7')
          .from('[data-marco]', { opacity: 0, y: 40, duration: 1, ease: 'power3.out' }, '-=0.6')

        const empezar = () => intro.play()
        if (document.documentElement.dataset.lista) empezar()
        else window.addEventListener(EVENTO_LISTA, empezar, { once: true })

        // 2. Al bajar, el video crece hasta ocupar todo el ancho.
        gsap.fromTo(
          '[data-marco]',
          { scale: 0.9, borderRadius: 18 },
          {
            scale: 1,
            borderRadius: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: '[data-marco]',
              start: 'top 85%',
              end: 'top 15%',
              scrub: true,
            },
          },
        )

        return () => window.removeEventListener(EVENTO_LISTA, empezar)
      })
      return () => mm.revert()
    },
    { scope: seccion },
  )

  // Luz suave que sigue al cursor o al dedo, como en el diseño original.
  const moverLuz = (x: number, y: number) => {
    const el = seccion.current
    if (!el) return
    const caja = el.getBoundingClientRect()
    el.style.setProperty('--x', `${x - caja.left}px`)
    el.style.setProperty('--y', `${y - caja.top}px`)
  }

  return (
    <section
      id="inicio"
      ref={seccion}
      aria-label="Inicio"
      onPointerMove={(e) => moverLuz(e.clientX, e.clientY)}
      className="relative px-5 pt-32 pb-16 md:px-10 md:pt-40"
    >
      <div className="luz pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="relative">
        {sitio.profesion && (
          <p data-sub className="etiqueta mb-6">
            {sitio.profesion}
            {sitio.ciudad && <span className="text-gris/70"> — {sitio.ciudad}</span>}
          </p>
        )}
        <h1 className="font-display text-[clamp(4.5rem,17vw,17rem)] leading-[0.86] tracking-[-0.025em]">
          {palabras.map((palabra, i) => (
            <span key={`${palabra}-${i}`} className="block overflow-hidden pb-[0.06em]">
              <span data-palabra className={`block ${i % 2 === 1 ? 'italic' : ''}`}>
                {palabra}
              </span>
            </span>
          ))}
        </h1>
      </div>

      <div
        data-marco
        className="bg-suave relative mt-12 aspect-[9/16] w-full overflow-hidden rounded-[18px] sm:aspect-video md:mt-16"
      >
        {hayVideo ? (
          <video
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            poster={sitio.portadaEntrada?.src}
            aria-hidden="true"
          >
            {sitio.videoEntradaVertical && (
              <source
                src={sitio.videoEntradaVertical.src}
                type={sitio.videoEntradaVertical.tipo}
                media="(max-width: 639px)"
              />
            )}
            {sitio.videoEntrada && (
              <source src={sitio.videoEntrada.src} type={sitio.videoEntrada.tipo} />
            )}
          </video>
        ) : (
          <Marcador
            texto="Video de entrada"
            detalle="Se sube desde el panel: Datos de la página → Entrada."
          />
        )}
      </div>

      <a
        href="#trabajos"
        className="text-gris hover:text-tinta mt-8 inline-flex items-center gap-2 text-sm transition-colors"
      >
        Ver trabajos <span aria-hidden="true">↓</span>
      </a>
    </section>
  )
}
