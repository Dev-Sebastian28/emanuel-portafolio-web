'use client'

import { useEffect, useState } from 'react'

/** Avisa a toda la página que la pantalla de carga terminó (la entrada arranca su animación). */
export const EVENTO_LISTA = 'pagina-lista'

export function PantallaCarga({ letra }: { letra: string }) {
  const [oculta, setOculta] = useState(false)

  useEffect(() => {
    let temporizador: ReturnType<typeof setTimeout>
    const terminar = () => {
      clearTimeout(temporizador)
      temporizador = setTimeout(() => {
        setOculta(true)
        document.documentElement.dataset.lista = 'true'
        window.dispatchEvent(new Event(EVENTO_LISTA))
      }, 600)
    }
    // Solo se espera a las letras (el nombre grande es lo primero que se ve), no a fotos ni videos.
    // Si las letras tardan, la pantalla de carga se quita igual a los 2,5 segundos.
    const respaldo = setTimeout(terminar, 2500)
    document.fonts.ready.then(terminar)
    return () => {
      clearTimeout(temporizador)
      clearTimeout(respaldo)
    }
  }, [])

  return (
    <div
      id="pantalla-carga"
      aria-hidden="true"
      className={`pantalla-carga bg-fondo fixed inset-0 z-[100] grid place-items-center transition-[opacity,visibility] duration-700 ${
        oculta ? 'invisible opacity-0' : ''
      }`}
    >
      <span className="font-display animate-pulse text-[7rem] leading-none motion-reduce:animate-none">
        {letra}
      </span>
    </div>
  )
}
