/**
 * Convierte lo que guarda el panel (Payload) en datos simples para los componentes.
 * No depende del servidor, así que también lo usa la vista previa, que corre en el navegador.
 */
import type { Media, Trabajo } from '@/payload-types'
import { idDeYoutube } from '@/lib/youtube'

export type Imagen = {
  src: string
  srcSet?: string
  width?: number
  height?: number
  alt: string
  desenfoque?: string
  /** Punto de enfoque marcado en el panel, en porcentaje. */
  enfoque?: { x: number; y: number }
}

export type ArchivoVideo = { src: string; tipo: string }

export type Pieza = {
  id: number
  titulo: string
  tipo: Trabajo['tipo']
  orientacion: 'horizontal' | 'vertical'
  portada?: Imagen
  video?: ArchivoVideo
  youtubeId?: string
  foto?: Imagen
  fecha?: string
  lugar?: string
  descripcion?: string
  /** Nombre de su categoría (se usa en el carrusel, donde se mezclan todas). */
  categoria?: string
}

export type CategoriaVista = {
  id: number
  nombre: string
  slug: string
  descripcion?: string
  portada?: Imagen
  videoPortada?: ArchivoVideo
  piezas: Pieza[]
}

export type SitioVista = {
  nombre: string
  profesion?: string
  ciudad?: string
  videoEntrada?: ArchivoVideo
  videoEntradaVertical?: ArchivoVideo
  portadaEntrada?: Imagen
  retrato?: Imagen
  tituloSobreMi?: string
  sobreMi?: string
  etiquetas: string[]
  textoContacto?: string
  whatsapp?: string
  email?: string
  instagram?: string
}

type Relacion = number | Media | null | undefined

const comoMedia = (valor: Relacion): Media | undefined =>
  valor && typeof valor === 'object' ? valor : undefined

export const texto = (valor: string | null | undefined) => valor?.trim() || undefined

export function aImagen(valor: Relacion): Imagen | undefined {
  const media = comoMedia(valor)
  if (!media?.url || !media.mimeType?.startsWith('image/')) return undefined

  const tamanos = Object.values(media.sizes ?? {})
    .map((t) => ({ url: t?.url, width: t?.width }))
    .filter((t): t is { url: string; width: number } => Boolean(t.url && t.width))
    .sort((a, b) => a.width - b.width)

  const principal = tamanos.find((t) => t.width >= 1600) ?? tamanos.at(-1)

  return {
    src: principal?.url ?? media.url,
    srcSet: tamanos.length ? tamanos.map((t) => `${t.url} ${t.width}w`).join(', ') : undefined,
    width: media.width ?? undefined,
    height: media.height ?? undefined,
    alt: media.alt ?? '',
    desenfoque: media.desenfoque ?? undefined,
    enfoque:
      media.focalX != null && media.focalY != null
        ? { x: media.focalX, y: media.focalY }
        : undefined,
  }
}

export function aVideo(valor: Relacion): ArchivoVideo | undefined {
  const media = comoMedia(valor)
  if (!media?.url || !media.mimeType?.startsWith('video/')) return undefined
  return { src: media.url, tipo: media.mimeType }
}

const formatoFecha = new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric' })

export function aPieza(trabajo: Trabajo): Pieza {
  return {
    id: trabajo.id,
    titulo: trabajo.titulo,
    tipo: trabajo.tipo,
    orientacion: trabajo.orientacion ?? 'horizontal',
    portada: aImagen(trabajo.portada),
    video: aVideo(trabajo.video),
    youtubeId: idDeYoutube(trabajo.youtube),
    foto: aImagen(trabajo.foto),
    fecha: trabajo.fecha ? formatoFecha.format(new Date(trabajo.fecha)) : undefined,
    lugar: texto(trabajo.lugar),
    descripcion: texto(trabajo.descripcion),
  }
}

/** Un trabajo solo se muestra si tiene lo necesario para verse. */
export function sePuedeMostrar(pieza: Pieza): boolean {
  if (pieza.tipo === 'video') return Boolean(pieza.video)
  if (pieza.tipo === 'youtube') return Boolean(pieza.youtubeId)
  return Boolean(pieza.foto)
}

/**
 * Ordena por la clave que se guarda al arrastrar en el panel. Los que todavía no tienen
 * clave quedan al final, en el orden en que llegaron (del más reciente al más antiguo).
 * Las claves se comparan letra por letra, que es como las arma Payload.
 */
export function ordenarPorClave<T>(lista: T[], clave: (item: T) => string | null | undefined) {
  return [...lista].sort((a, b) => {
    const ka = clave(a)
    const kb = clave(b)
    if (ka && kb) return ka < kb ? -1 : ka > kb ? 1 : 0
    if (ka) return -1
    if (kb) return 1
    return 0
  })
}
