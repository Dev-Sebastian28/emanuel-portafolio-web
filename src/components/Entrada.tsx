'use client'

import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useRef } from 'react'

import { EVENTO_LISTA } from '@/components/PantallaCarga'
import type { SitioVista } from '@/lib/vista'

gsap.registerPlugin(useGSAP, ScrollTrigger)

/*
 * Entrada "visor de grabación" (elegida el 10 nov 2026; prototipo en
 * prototipos/entrada-visor.html). El nombre en grande y, en el centro, la pantalla de una
 * cámara grabando con el video de entrada. Al bajar, la pantalla crece hasta llenarlo todo.
 * El cuadro de enfoque sigue al cursor. Los estilos están en globals.css (.visor).
 */

const FPS = 24
const dos = (n: number) => String(n).padStart(2, '0')

/** Tamaño inicial del visor: horizontal en computador, vertical en celular. */
function tamanoInicial() {
  const vw = window.innerWidth
  const vh = window.innerHeight
  if (vh > vw) {
    const w = Math.min(vw * 0.56, vh * 0.259)
    return { w, h: (w * 16) / 9 }
  }
  const w = Math.min(vw * 0.36, vh * 0.64)
  return { w, h: (w * 9) / 16 }
}

export function Entrada({ sitio, categorias }: { sitio: SitioVista; categorias: string[] }) {
  const seccion = useRef<HTMLElement>(null)
  const escenario = useRef<HTMLDivElement>(null)
  const marco = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const contador = useRef<HTMLSpanElement>(null)
  const grabando = useRef<HTMLSpanElement>(null)
  const enfoque = useRef<HTMLDivElement>(null)

  const [primera, ...resto] = sitio.nombre.split(/\s+/).filter(Boolean)
  const segunda = resto.join(' ')
  const hayVideo = Boolean(sitio.videoEntrada || sitio.videoEntradaVertical)

  useGSAP(
    () => {
      const esc = escenario.current
      const mar = marco.current
      const vid = video.current
      const foco = enfoque.current
      if (!esc || !mar || !foco) return

      const encenderRec = () => {
        grabando.current?.classList.add('grabando')
        if (grabando.current?.lastElementChild) grabando.current.lastElementChild.textContent = 'REC'
      }

      const ubicarPista = () =>
        esc.style.setProperty('--alto-visor', `${tamanoInicial().h}px`)
      ubicarPista()
      ScrollTrigger.addEventListener('refreshInit', ubicarPista)

      const mm = gsap.matchMedia()

      // Con "reducir movimiento": todo quieto, el video en pausa y el visor ya grabando.
      mm.add('(prefers-reduced-motion: reduce)', () => {
        encenderRec()
        vid?.pause()
      })

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // Contador de tiempo a 24 cuadros por segundo; corre más rápido mientras se baja.
        let corriendo = false
        let segundos = 0
        let velocidad = 1
        let yAntes = window.scrollY
        const contar = (_t: number, dt: number) => {
          const y = window.scrollY
          const v = Math.abs(y - yAntes) / Math.max(dt, 1)
          yAntes = y
          velocidad += (1 + Math.min(v * 22, 48) - velocidad) * 0.1
          if (!corriendo || !contador.current) return
          segundos += (dt / 1000) * velocidad
          const f = Math.floor(segundos * FPS)
          contador.current.textContent = [
            Math.floor(f / (FPS * 3600)),
            Math.floor(f / (FPS * 60)) % 60,
            Math.floor(f / FPS) % 60,
            f % FPS,
          ]
            .map(dos)
            .join(':')
        }
        gsap.ticker.add(contar)

        // El video solo corre cuando está a la vista.
        const observador = new IntersectionObserver(
          ([e]) => (e.isIntersecting ? vid?.play().catch(() => {}) : vid?.pause()),
          { threshold: 0.05 },
        )
        if (vid) observador.observe(mar)

        // 1. Cuando termina la pantalla de carga: sube el nombre y se abre el visor.
        const intro = gsap
          .timeline({ paused: true, defaults: { ease: 'expo.out' } })
          .from('[data-palabra]', { yPercent: 110, duration: 1.2, stagger: 0.1 }, 0.15)
          .fromTo(
            mar,
            { clipPath: 'inset(50% 0% 50% 0%)' },
            { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'power3.inOut' },
            0.35,
          )
          .from('[data-hud]', { opacity: 0, duration: 0.5, ease: 'power1.out' }, 1.1)
          .from('[data-sub]', { opacity: 0, y: 14, duration: 0.9 }, 0.9)
          .add(() => {
            encenderRec()
            corriendo = true
          }, 1.7)
        const empezar = () => intro.play()
        if (document.documentElement.dataset.lista) empezar()
        else window.addEventListener(EVENTO_LISTA, empezar, { once: true })

        // 2. Al bajar: el visor crece hasta llenar la pantalla y aparecen las categorías.
        gsap
          .timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: seccion.current,
              start: 'top top',
              end: () => `+=${window.innerHeight * 1.5}`,
              pin: esc,
              scrub: true,
              invalidateOnRefresh: true,
            },
          })
          .fromTo(
            mar,
            { width: () => tamanoInicial().w, height: () => tamanoInicial().h },
            {
              width: () => window.innerWidth,
              height: () => window.innerHeight,
              ease: 'power2.inOut',
              duration: 0.72,
            },
            0,
          )
          .fromTo(
            '[data-hud]',
            { '--hdr': '0px' },
            { '--hdr': '64px', ease: 'power2.inOut', duration: 0.72 },
            0,
          )
          .to('[data-nombre="1"]', { xPercent: -12, yPercent: -55, duration: 0.6, ease: 'power1.in' }, 0)
          .to('[data-nombre="2"]', { xPercent: 12, yPercent: 55, duration: 0.6, ease: 'power1.in' }, 0)
          .to('[data-sub]', { autoAlpha: 0, duration: 0.12 }, 0)
          .to('[data-esquina]', { opacity: 0, duration: 0.12 }, 0.74)
          .to('[data-detalle]', { opacity: 0, duration: 0.12 }, 0.78)
          .fromTo(
            '[data-titulo]',
            { autoAlpha: 0, y: 30 },
            { autoAlpha: 1, y: 0, duration: 0.16, ease: 'power2.out' },
            0.8,
          )
          .to({}, { duration: 0.1 })

        // 3. Cuadro de enfoque: sigue al cursor y "enfoca" cuando se queda quieto.
        const fino = window.matchMedia('(pointer: fine)').matches
        const mx = gsap.quickTo(foco, 'x', { duration: 0.28, ease: 'power3.out' })
        const my = gsap.quickTo(foco, 'y', { duration: 0.28, ease: 'power3.out' })
        let espera: ReturnType<typeof setTimeout> | undefined
        let pos = { x: 0, y: 0 }
        let ultimo = { x: -999, y: -999 }
        const sobreVideo = () => {
          const s = esc.getBoundingClientRect()
          const r = mar.getBoundingClientRect()
          const x = pos.x + s.left
          const y = pos.y + s.top
          return x > r.left && x < r.right && y > r.top && y < r.bottom
        }
        const enfocar = () => {
          if (Math.hypot(pos.x - ultimo.x, pos.y - ultimo.y) < 40) return
          ultimo = { ...pos }
          foco.classList.add('fijo')
          gsap
            .timeline()
            .fromTo(foco, { scale: 1.35 }, { scale: 1, duration: 0.32, ease: 'power3.out' })
            .to(foco, { opacity: 0.35, duration: 0.06, repeat: 3, yoyo: true }, '<0.1')
          if (sobreVideo() && vid) {
            gsap.fromTo(
              vid,
              { filter: 'blur(0px)' },
              {
                keyframes: [
                  { filter: 'blur(2.5px)', duration: 0.14 },
                  { filter: 'blur(0px)', duration: 0.26 },
                ],
                ease: 'power1.inOut',
              },
            )
          }
        }
        const alMover = (e: PointerEvent) => {
          const s = esc.getBoundingClientRect()
          pos = { x: e.clientX - s.left, y: e.clientY - s.top }
          mx(pos.x)
          my(pos.y)
          foco.classList.toggle('sobre', sobreVideo())
          foco.classList.remove('fijo')
          gsap.to(foco, { opacity: 1, duration: 0.2, overwrite: 'auto' })
          clearTimeout(espera)
          espera = setTimeout(enfocar, 240)
        }
        const alSalir = () => gsap.to(foco, { opacity: 0, duration: 0.2 })
        const alTocar = (e: PointerEvent) => {
          const s = esc.getBoundingClientRect()
          pos = { x: e.clientX - s.left, y: e.clientY - s.top }
          gsap.set(foco, { x: pos.x, y: pos.y, opacity: 1 })
          ultimo = { x: -999, y: -999 }
          foco.classList.toggle('sobre', sobreVideo())
          enfocar()
          gsap.to(foco, { opacity: 0, duration: 0.4, delay: 1.1 })
        }
        if (fino) {
          esc.addEventListener('pointermove', alMover)
          esc.addEventListener('pointerleave', alSalir)
        } else {
          esc.addEventListener('pointerdown', alTocar)
        }

        return () => {
          gsap.ticker.remove(contar)
          observador.disconnect()
          clearTimeout(espera)
          window.removeEventListener(EVENTO_LISTA, empezar)
          esc.removeEventListener('pointermove', alMover)
          esc.removeEventListener('pointerleave', alSalir)
          esc.removeEventListener('pointerdown', alTocar)
        }
      })

      return () => {
        ScrollTrigger.removeEventListener('refreshInit', ubicarPista)
        mm.revert()
      }
    },
    { scope: seccion },
  )

  return (
    <section id="inicio" ref={seccion} aria-label="Inicio" className="visor">
      <div ref={escenario} className="visor-escenario">
        <h1 className="visor-nombre font-display" aria-label={sitio.nombre}>
          <span data-nombre="1" className="visor-palabra visor-palabra-1" aria-hidden="true">
            <span data-palabra className="block">
              {primera}
            </span>
          </span>
          {segunda && (
            <span data-nombre="2" className="visor-palabra visor-palabra-2" aria-hidden="true">
              <span data-palabra className="block">
                {segunda}
              </span>
            </span>
          )}
        </h1>

        {(sitio.profesion || sitio.ciudad) && (
          <p data-sub className="visor-oficio">
            {sitio.profesion && <strong>{sitio.profesion}</strong>}
            {sitio.ciudad}
          </p>
        )}

        <div ref={marco} className="visor-marco">
          {hayVideo ? (
            <video
              ref={video}
              muted
              loop
              playsInline
              autoPlay
              preload="auto"
              poster={sitio.portadaEntrada?.src}
              aria-hidden="true"
            >
              {sitio.videoEntradaVertical && (
                <source
                  src={sitio.videoEntradaVertical.src}
                  type={sitio.videoEntradaVertical.tipo}
                  media="(orientation: portrait)"
                />
              )}
              {sitio.videoEntrada && (
                <source src={sitio.videoEntrada.src} type={sitio.videoEntrada.tipo} />
              )}
            </video>
          ) : (
            <div className="visor-sin-video">
              Aquí va el video de entrada.
              <br />
              Se sube en el panel: Datos de la página → Entrada.
            </div>
          )}
          <div className="visor-sombra" />
          <div data-hud className="visor-hud" aria-hidden="true">
            <span ref={grabando} className="visor-rec">
              <i />
              <em>STBY</em>
            </span>
            <span ref={contador} className="visor-tc">
              00:00:00:00
            </span>
            <span data-detalle className="visor-formato">
              4K&nbsp;&nbsp;24p
            </span>
            <span data-detalle className="visor-bateria">
              <b>
                <span />
                <span />
                <span />
                <span />
              </b>
            </span>
            <span data-esquina className="visor-esquina arriba izquierda" />
            <span data-esquina className="visor-esquina arriba derecha" />
            <span data-esquina className="visor-esquina abajo izquierda" />
            <span data-esquina className="visor-esquina abajo derecha" />
          </div>
        </div>

        {categorias.length > 0 && (
          <div data-titulo className="visor-titulo">
            <h2 className="font-display">
              {categorias.map((c) => (
                <span key={c}>{c}</span>
              ))}
            </h2>
          </div>
        )}

        <a data-sub href="#seleccion" className="visor-pista">
          Ver trabajos <i aria-hidden="true">↓</i>
        </a>
        <div ref={enfoque} className="visor-enfoque" aria-hidden="true" />
      </div>
    </section>
  )
}
