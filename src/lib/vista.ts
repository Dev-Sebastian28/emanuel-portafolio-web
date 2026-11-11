/**
 * Convierte lo que viene del panel (Payload) en datos simples para la página.
 * Así los componentes no dependen de cómo guarda Payload cada cosa.
 */
import config from '@payload-config'
import { getPayload } from 'payload'

import type { Categoria, Media, Sitio, Trabajo } from '@/payload-types'
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

const texto = (valor: string | null | undefined) => valor?.trim() || undefined

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

function aPieza(trabajo: Trabajo): Pieza {
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
function sePuedeMostrar(pieza: Pieza): boolean {
  if (pieza.tipo === 'video') return Boolean(pieza.video)
  if (pieza.tipo === 'youtube') return Boolean(pieza.youtubeId)
  return Boolean(pieza.foto)
}

function aSitio(sitio: Sitio): SitioVista {
  return {
    nombre: texto(sitio.nombre) ?? 'Emanuel Fonseca',
    profesion: texto(sitio.profesion),
    ciudad: texto(sitio.ciudad),
    videoEntrada: aVideo(sitio.videoEntrada),
    videoEntradaVertical: aVideo(sitio.videoEntradaVertical),
    portadaEntrada: aImagen(sitio.portadaEntrada),
    retrato: aImagen(sitio.retrato),
    tituloSobreMi: texto(sitio.tituloSobreMi),
    sobreMi: texto(sitio.sobreMi),
    etiquetas: (sitio.etiquetas ?? []).map((e) => e.texto).filter(Boolean),
    textoContacto: texto(sitio.textoContacto),
    whatsapp: texto(sitio.whatsapp)?.replace(/\D/g, '') || undefined,
    email: texto(sitio.email),
    instagram: texto(sitio.instagram),
  }
}

export async function obtenerSitio(): Promise<SitioVista> {
  const payload = await getPayload({ config })
  return aSitio(await payload.findGlobal({ slug: 'sitio', depth: 1 }))
}

export async function obtenerPagina(): Promise<{
  sitio: SitioVista
  categorias: CategoriaVista[]
  /** Trabajos marcados con "Mostrar en el carrusel", del más reciente al más antiguo. */
  carrusel: Pieza[]
}> {
  const payload = await getPayload({ config })
  const [sitio, categorias, trabajos] = await Promise.all([
    payload.findGlobal({ slug: 'sitio', depth: 1 }),
    payload.find({ collection: 'categorias', sort: 'orden', depth: 1, limit: 100 }),
    payload.find({
      collection: 'trabajos',
      where: { _status: { equals: 'published' } },
      sort: '-fecha',
      depth: 1,
      limit: 1000,
    }),
  ])

  const idCategoria = (t: Trabajo) =>
    typeof t.categoria === 'object' ? t.categoria.id : t.categoria
  const nombres = new Map(categorias.docs.map((c: Categoria) => [c.id, c.nombre]))

  return {
    sitio: aSitio(sitio),
    carrusel: trabajos.docs
      .filter((t) => t.carrusel)
      .map((t) => ({ ...aPieza(t), categoria: nombres.get(idCategoria(t)) }))
      .filter(sePuedeMostrar),
    categorias: categorias.docs.map((c: Categoria) => ({
      id: c.id,
      nombre: c.nombre,
      slug: c.slug ?? String(c.id),
      descripcion: texto(c.descripcion),
      portada: aImagen(c.portada),
      videoPortada: aVideo(c.videoPortada),
      piezas: trabajos.docs
        .filter((t) => idCategoria(t) === c.id)
        .map(aPieza)
        .filter(sePuedeMostrar),
    })),
  }
}
