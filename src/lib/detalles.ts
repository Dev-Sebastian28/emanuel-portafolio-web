import type { Pieza } from '@/lib/vista'

/** "Lugar · mes de año", o vacío si no hay ninguno de los dos. */
export const detalles = (pieza: Pieza) => [pieza.lugar, pieza.fecha].filter(Boolean).join(' · ')
