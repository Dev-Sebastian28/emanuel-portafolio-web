import type Lenis from 'lenis'

/** Guarda el desplazamiento suave activo para poder pausarlo (por ejemplo, al abrir una galería). */
let actual: Lenis | null = null

export function registrarScroll(lenis: Lenis | null): void {
  actual = lenis
}

export function bloquearScroll(bloquear: boolean): void {
  if (bloquear) actual?.stop()
  else actual?.start()
  document.documentElement.style.overflow = bloquear ? 'hidden' : ''
}
