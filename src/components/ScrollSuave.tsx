'use client'

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { useEffect } from 'react'

import { registrarScroll } from '@/lib/scroll'

/** Desplazamiento suave con Lenis, sincronizado con las animaciones de GSAP. */
export function ScrollSuave() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    gsap.registerPlugin(ScrollTrigger)
    const lenis = new Lenis({ anchors: { offset: -72 }, autoRaf: false })
    registrarScroll(lenis)
    lenis.on('scroll', ScrollTrigger.update)

    const alRitmo = (tiempo: number) => lenis.raf(tiempo * 1000)
    gsap.ticker.add(alRitmo)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(alRitmo)
      lenis.destroy()
      registrarScroll(null)
    }
  }, [])

  return null
}
