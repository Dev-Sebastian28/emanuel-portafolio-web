/**
 * Revisa si una foto o un video cumple lo recomendado para la página y explica qué pasa si no.
 * Solo avisa: el archivo se puede subir igual. Lo usan el panel y la subida de varias fotos.
 *
 * Lo recomendado (ver "Reglas de fotos y videos" en CLAUDE.md):
 * - Fotos: JPG en calidad máxima, de 3000 a 4000 px en el lado largo.
 * - Videos cortos: MP4 H.264, 1080p, de 8 a 10 Mbps. Los largos y los 4K van en YouTube.
 */

export type Aviso = { nivel: 'bien' | 'ojo' | 'grave'; texto: string }

const px = (n: number) => `${n.toLocaleString('es-CO')} px`

export const pesoLegible = (bytes: number) =>
  bytes >= 1024 ** 3
    ? `${(bytes / 1024 ** 3).toLocaleString('es-CO', { maximumFractionDigits: 1 })} GB`
    : `${(bytes / 1024 ** 2).toLocaleString('es-CO', { maximumFractionDigits: 1 })} MB`

const duracionLegible = (segundos: number) => {
  const s = Math.round(segundos)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')} min`
}

export function revisarFoto({ ancho, alto }: { ancho: number; alto: number }): Aviso[] {
  const ladoLargo = Math.max(ancho, alto)
  const medida = `${px(ancho)} × ${px(alto)}`

  if (ladoLargo < 1600) {
    return [
      {
        nivel: 'grave',
        texto: `La foto es muy pequeña (${medida}). En computadores y pantallas grandes se va a ver borrosa. Conviene exportarla de nuevo con el lado largo entre 3.000 y 4.000 px.`,
      },
    ]
  }
  if (ladoLargo < 3000) {
    return [
      {
        nivel: 'ojo',
        texto: `La foto mide ${medida}. En celular se ve bien, pero en pantallas grandes puede perder nitidez. Lo recomendado es de 3.000 a 4.000 px en el lado largo.`,
      },
    ]
  }
  return [
    { nivel: 'bien', texto: `Buen tamaño: ${medida}. Se va a ver nítida en cualquier pantalla.` },
  ]
}

export function revisarVideo({
  ancho,
  alto,
  duracion,
  peso,
}: {
  ancho: number
  alto: number
  /** En segundos. */
  duracion: number
  /** En bytes. */
  peso: number
}): Aviso[] {
  const avisos: Aviso[] = []
  const ladoCorto = Math.min(ancho, alto)
  const mbps = duracion > 0 ? (peso * 8) / duracion / 1_000_000 : 0
  const mbpsTexto = mbps.toLocaleString('es-CO', { maximumFractionDigits: 1 })

  if (ladoCorto > 1080) {
    avisos.push({
      nivel: 'ojo',
      texto: `El video es más grande que 1080p (${ancho} × ${alto}). Para la página basta 1080p: carga más rápido, sobre todo en celular. Los videos en 4K van mejor en YouTube.`,
    })
  } else if (ladoCorto > 0 && ladoCorto < 720) {
    avisos.push({
      nivel: 'grave',
      texto: `El video es de baja resolución (${ancho} × ${alto}) y se puede ver borroso. Lo recomendado es exportarlo en 1080p.`,
    })
  }

  if (mbps > 12) {
    avisos.push({
      nivel: 'ojo',
      texto: `El video pesa más de lo necesario (${mbpsTexto} Mbps, ${pesoLegible(peso)} en total). Exportarlo entre 8 y 10 Mbps hace que cargue rápido sin que se note la diferencia.`,
    })
  }

  if (duracion > 120) {
    avisos.push({
      nivel: 'ojo',
      texto: `El video dura ${duracionLegible(duracion)}. Los de más de 2 minutos van mejor en YouTube: se crea el trabajo con la opción "Video largo en YouTube" y se pega el link.`,
    })
  }

  if (avisos.length === 0 && duracion > 0) {
    avisos.push({
      nivel: 'bien',
      texto: `Cumple lo recomendado: ${ancho} × ${alto}, ${mbpsTexto} Mbps, ${duracionLegible(duracion)}.`,
    })
  }
  return avisos
}
