'use client'

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'

import { IconoReproducir, Medio, proporcion } from '@/components/Medio'
import { Visor } from '@/components/Visor'
import { bloquearScroll } from '@/lib/scroll'
import type { Pieza } from '@/lib/vista'

/*
 * Carrusel de la selección (idea de wschupfer.com): filas de fotos y videos de distintos
 * tamaños que se mueven solas, despacio y sin fin. Se pueden arrastrar, el cursor las detiene
 * y al tocar un trabajo se abre en grande. Los tamaños están en globals.css (.carrusel).
 */

const FILAS = 2
/** Con menos trabajos que esto por fila, cada fila los muestra todos en otro orden. */
const MINIMO_POR_FILA = 5
/** Dónde arranca cada fila, para que no se vean iguales. */
const DESFASES = [0.12, 0.58]
/** Unos trabajos arriba y otros abajo dentro de su fila. */
const ALTURAS = ['self-start', 'self-end', 'self-start', 'self-center', 'self-end', 'self-start']

type Elemento = { pieza: Pieza; indice: number }

function repartir(piezas: Pieza[]): Elemento[][] {
  const elementos = piezas.map((pieza, indice) => ({ pieza, indice }))
  const filas = Math.min(FILAS, elementos.length)
  if (elementos.length >= filas * MINIMO_POR_FILA) {
    return Array.from({ length: filas }, (_, f) => elementos.filter((_, i) => i % filas === f))
  }
  const paso = Math.max(1, Math.floor(elementos.length / filas))
  return Array.from({ length: filas }, (_, f) =>
    elementos.map((_, i) => elementos[(i + f * paso) % elementos.length]),
  )
}

/**
 * Alterna una pieza de cada categoría para que las filas mezclen bodas, vehículos, shows, etc.,
 * en vez de salir en bloques del mismo trabajo. Dentro de cada categoría se respeta el orden
 * (lo más reciente primero).
 */
function mezclarCategorias(piezas: Pieza[]): Pieza[] {
  const grupos = new Map<string, Pieza[]>()
  for (const pieza of piezas) {
    const clave = pieza.categoria ?? ''
    const grupo = grupos.get(clave)
    if (grupo) grupo.push(pieza)
    else grupos.set(clave, [pieza])
  }
  const listas = [...grupos.values()]
  const salida: Pieza[] = []
  for (let i = 0; salida.length < piezas.length; i++) {
    for (const lista of listas) {
      const pieza = lista[i]
      if (pieza) salida.push(pieza)
    }
  }
  return salida
}

const CONSULTA_QUIETO = '(prefers-reduced-motion: reduce)'
const suscribirQuieto = (aviso: () => void) => {
  const consulta = window.matchMedia(CONSULTA_QUIETO)
  consulta.addEventListener('change', aviso)
  return () => consulta.removeEventListener('change', aviso)
}
/** Si el dispositivo pide "reducir movimiento", las filas quedan quietas y se deslizan a mano. */
const useQuieto = () =>
  useSyncExternalStore(
    suscribirQuieto,
    () => window.matchMedia(CONSULTA_QUIETO).matches,
    () => false,
  )

function Tarjeta({
  elemento,
  posicion,
  repeticion,
  alAbrir,
}: {
  elemento: Elemento
  posicion: number
  /** Las repeticiones se pueden tocar, pero el teclado y los lectores de pantalla las saltan. */
  repeticion: boolean
  alAbrir: (indice: number) => void
}) {
  const { pieza, indice } = elemento
  const r = proporcion(pieza)
  const ancha = r >= 1.15

  return (
    <button
      type="button"
      onClick={() => alAbrir(indice)}
      tabIndex={repeticion ? -1 : undefined}
      data-indice={indice}
      aria-label={`Ver ${pieza.titulo}`}
      className={`group bg-suave relative block shrink-0 overflow-hidden rounded-[4px] [&_img]:pointer-events-none [&_video]:pointer-events-none ${
        ALTURAS[posicion % ALTURAS.length]
      }`}
      style={{
        // Ancho fijo según la forma, sin pasar de 3/4 del alto de la fila.
        width: `min(var(${ancha ? '--ancha' : '--angosta'}), calc(var(--alto) * 0.74 * ${r}))`,
        aspectRatio: r,
      }}
    >
      <Medio
        pieza={pieza}
        sizes={ancha ? '(min-width: 768px) 47vw, 78vw' : '(min-width: 768px) 23vw, 44vw'}
      />
      {pieza.tipo === 'youtube' && (
        <span className="bg-fondo/90 text-tinta absolute top-3 right-3 grid h-10 w-10 place-items-center rounded-full">
          <IconoReproducir />
        </span>
      )}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-black/45 to-transparent px-3 pt-12 pb-3 text-left text-[0.8rem] leading-snug text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 md:px-4 md:pb-4"
      >
        {pieza.titulo}
        {pieza.categoria && <span className="text-white/70"> — {pieza.categoria}</span>}
      </span>
    </button>
  )
}

function Fila({
  elementos,
  numero,
  quieto,
  alAbrir,
}: {
  elementos: Elemento[]
  numero: number
  quieto: boolean
  alAbrir: (indice: number) => void
}) {
  const marco = useRef<HTMLDivElement>(null)
  const pista = useRef<HTMLDivElement>(null)
  const juego = useRef<HTMLDivElement>(null)
  // El juego de trabajos se repite para que la fila no se acabe nunca.
  const [copias, setCopias] = useState(3)

  useEffect(() => {
    const m = marco.current
    const p = pista.current
    const j = juego.current
    if (quieto || !m || !p || !j) return

    let x = 0
    let periodo = 0
    let iniciado = false
    let visible = false
    let encima = false
    let enfocado = false
    let movido = false
    let inercia = 0
    let raf = 0
    let antes = 0
    let scrollAntes = window.scrollY
    let arrastre: {
      id: number
      x0: number
      y0: number
      desde: number
      ultimoX: number
      ultimoT: number
      vel: number
      activo: boolean
    } | null = null

    // Unos 35 px por segundo, hacia la derecha: más vivo que la referencia.
    const base = () => Math.min(46, Math.max(22, window.innerWidth * 0.026))
    const meta = () => (encima || enfocado ? 0 : base())
    let velocidad = base()

    const envolver = (valor: number) =>
      periodo > 0 ? (((valor % periodo) + periodo) % periodo) - periodo : valor
    const pintar = () => {
      p.style.transform = `translate3d(${x}px, 0, 0)`
    }

    const medir = () => {
      periodo = j.offsetWidth + (parseFloat(getComputedStyle(p).columnGap) || 0)
      if (!periodo) return
      setCopias((actual) => Math.max(actual, Math.ceil(m.clientWidth / periodo) + 3))
      if (!iniciado) {
        x = -periodo * DESFASES[numero % DESFASES.length]
        iniciado = true
      }
      if (!enfocado) x = envolver(x)
      pintar()
    }

    const cuadro = (t: number) => {
      raf = 0
      if (!visible) {
        antes = 0
        return
      }
      const dt = antes ? Math.min((t - antes) / 1000, 0.05) : 0
      antes = t
      // Al bajar por la página las filas se apuran un poco.
      const scroll = window.scrollY
      const empuje = dt ? Math.min((Math.abs(scroll - scrollAntes) / dt) * 0.1, 160) : 0
      scrollAntes = scroll
      velocidad += (meta() - velocidad) * Math.min(1, dt * 3)

      if (!arrastre?.activo) {
        x += (velocidad + (meta() ? empuje : 0) + inercia) * dt
        inercia *= Math.pow(0.04, dt)
        if (!enfocado) x = envolver(x)
        pintar()
      }
      raf = requestAnimationFrame(cuadro)
    }
    const arrancar = () => {
      if (!raf) raf = requestAnimationFrame(cuadro)
    }

    const alBajar = (e: PointerEvent) => {
      movido = false
      if (e.button !== 0) return
      arrastre = {
        id: e.pointerId,
        x0: e.clientX,
        y0: e.clientY,
        desde: x,
        ultimoX: e.clientX,
        ultimoT: e.timeStamp,
        vel: 0,
        activo: false,
      }
    }
    const alMover = (e: PointerEvent) => {
      if (!arrastre || e.pointerId !== arrastre.id) return
      const dx = e.clientX - arrastre.x0
      if (!arrastre.activo) {
        if (Math.abs(dx) < 6) return
        // En celular, si el dedo va hacia abajo, se deja bajar la página.
        if (Math.abs(e.clientY - arrastre.y0) > Math.abs(dx)) {
          arrastre = null
          return
        }
        arrastre.activo = true
        movido = true
        inercia = 0
        m.setPointerCapture(e.pointerId)
        m.classList.add('arrastrando')
      }
      const dt = e.timeStamp - arrastre.ultimoT
      if (dt > 0) arrastre.vel = ((e.clientX - arrastre.ultimoX) / dt) * 1000
      arrastre.ultimoX = e.clientX
      arrastre.ultimoT = e.timeStamp
      x = envolver(arrastre.desde + dx)
      pintar()
    }
    const alSoltar = () => {
      if (arrastre?.activo) {
        inercia = Math.max(-2400, Math.min(2400, arrastre.vel))
        m.classList.remove('arrastrando')
      }
      arrastre = null
    }
    // Si se arrastró, soltar no abre el trabajo.
    const alClic = (e: MouseEvent) => {
      if (!movido) return
      e.preventDefault()
      e.stopPropagation()
      movido = false
    }
    // Deslizar de lado con el trackpad también mueve la fila.
    const alRueda = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return
      e.preventDefault()
      x = envolver(x - e.deltaX)
      pintar()
    }
    const alEntrar = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') encima = true
    }
    const alSalir = () => {
      encima = false
    }
    // Con el teclado (Tab), la fila se detiene y acomoda el trabajo enfocado a la vista.
    const alEnfocar = (e: FocusEvent) => {
      if (!(e.target as HTMLElement).matches(':focus-visible')) return
      enfocado = true
      velocidad = 0
      requestAnimationFrame(() => {
        m.scrollLeft = 0
        const r = (e.target as HTMLElement).getBoundingClientRect()
        const c = m.getBoundingClientRect()
        const margen = 24
        if (r.left < c.left + margen) x += c.left + margen - r.left
        else if (r.right > c.right - margen) x -= r.right - (c.right - margen)
        pintar()
      })
    }
    const alDesenfocar = () => {
      enfocado = false
    }

    const observador = new IntersectionObserver(
      ([entrada]) => {
        visible = entrada.isIntersecting
        if (visible) {
          scrollAntes = window.scrollY
          arrancar()
        }
      },
      { rootMargin: '120px 0px' },
    )
    const tamano = new ResizeObserver(medir)

    observador.observe(m)
    tamano.observe(j)
    tamano.observe(m)
    m.addEventListener('pointerdown', alBajar)
    m.addEventListener('pointermove', alMover)
    m.addEventListener('pointerup', alSoltar)
    m.addEventListener('pointercancel', alSoltar)
    m.addEventListener('pointerenter', alEntrar)
    m.addEventListener('pointerleave', alSalir)
    m.addEventListener('click', alClic, true)
    m.addEventListener('wheel', alRueda, { passive: false })
    m.addEventListener('focusin', alEnfocar)
    m.addEventListener('focusout', alDesenfocar)

    return () => {
      cancelAnimationFrame(raf)
      observador.disconnect()
      tamano.disconnect()
      m.removeEventListener('pointerdown', alBajar)
      m.removeEventListener('pointermove', alMover)
      m.removeEventListener('pointerup', alSoltar)
      m.removeEventListener('pointercancel', alSoltar)
      m.removeEventListener('pointerenter', alEntrar)
      m.removeEventListener('pointerleave', alSalir)
      m.removeEventListener('click', alClic, true)
      m.removeEventListener('wheel', alRueda)
      m.removeEventListener('focusin', alEnfocar)
      m.removeEventListener('focusout', alDesenfocar)
      p.style.transform = ''
    }
  }, [quieto, numero])

  // La copia que se puede recorrer con el teclado; las demás son repeticiones de adorno.
  const principal = quieto ? 0 : 1
  const total = quieto ? 1 : copias

  return (
    <div
      ref={marco}
      data-fila
      className={`relative h-(--alto) ${
        quieto
          ? 'sin-barra overflow-x-auto px-5 md:px-10'
          : 'cursor-grab touch-pan-y overflow-hidden select-none'
      }`}
    >
      <div
        ref={pista}
        className={`flex h-full w-max gap-(--separacion) ${quieto ? '' : 'will-change-transform'}`}
      >
        {Array.from({ length: total }, (_, c) => (
          <div
            key={c}
            ref={c === principal ? juego : undefined}
            data-principal={c === principal || undefined}
            aria-hidden={c !== principal || undefined}
            className="flex h-full shrink-0 gap-(--separacion)"
          >
            {elementos.map((elemento, i) => (
              <Tarjeta
                key={`${elemento.pieza.id}-${i}`}
                elemento={elemento}
                posicion={i + numero}
                repeticion={c !== principal}
                alAbrir={alAbrir}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function Carrusel({ piezas }: { piezas: Pieza[] }) {
  const quieto = useQuieto()
  // El visor recorre esta misma lista: así el índice de cada tarjeta siempre apunta a su pieza.
  const orden = useMemo(() => mezclarCategorias(piezas), [piezas])
  const filas = useMemo(() => repartir(orden), [orden])
  const [abierto, setAbierto] = useState<number | null>(null)
  const anterior = useRef<HTMLElement | null>(null)

  const abrir = useCallback((indice: number) => {
    anterior.current = document.activeElement as HTMLElement | null
    setAbierto(indice)
  }, [])
  const cerrar = useCallback(() => setAbierto(null), [])

  const hayVisor = abierto !== null
  useEffect(() => {
    if (!hayVisor) return
    bloquearScroll(true)
    return () => {
      bloquearScroll(false)
      // Si se tocó una repetición, el foco vuelve al mismo trabajo en la copia principal.
      const tocado = anterior.current
      const destino =
        tocado?.tabIndex === -1
          ? tocado
              .closest('[data-fila]')
              ?.querySelector<HTMLElement>(
                `[data-principal] [data-indice="${tocado.dataset.indice}"]`,
              )
          : tocado
      destino?.focus({ preventScroll: true })
    }
  }, [hayVisor])

  if (filas.length === 0) return null

  return (
    <section id="seleccion" aria-label="Selección de trabajos" className="carrusel py-16 md:py-24">
      <div
        data-aparecer
        className="mb-6 flex items-baseline justify-between gap-6 px-5 md:mb-8 md:px-10"
      >
        <p className="etiqueta">Selección</p>
        <p className="etiqueta hidden md:block">
          {quieto ? 'Deslice para ver más' : 'Arrastre para explorar'}
        </p>
      </div>

      <div className="flex flex-col gap-4 md:gap-8">
        {filas.map((elementos, f) => (
          <Fila key={f} elementos={elementos} numero={f} quieto={quieto} alAbrir={abrir} />
        ))}
      </div>

      {abierto !== null && (
        <Visor piezas={orden} indice={abierto} alCambiar={setAbierto} alCerrar={cerrar} />
      )}
    </section>
  )
}
