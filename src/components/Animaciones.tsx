'use client'

import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(useGSAP, ScrollTrigger)

/**
 * Hace aparecer suavemente, al bajar, todo lo que tenga el atributo `data-aparecer`.
 * Si la persona pidió menos movimiento en su dispositivo, no se anima nada.
 */
export function Animaciones() {
  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.utils.toArray<HTMLElement>('[data-aparecer]').forEach((elemento) => {
        gsap.from(elemento, {
          y: 36,
          opacity: 0,
          duration: 1.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: elemento, start: 'top 88%', once: true },
        })
      })
    })
    return () => mm.revert()
  })

  return null
}
