/**
 * Lee del panel (Payload) lo que muestra la página pública y lo deja en datos simples.
 * La conversión de cada cosa está en `mapeo.ts`, que también usa la vista previa.
 */
import config from '@payload-config'
import { getPayload } from 'payload'

import {
  aImagen,
  aPieza,
  aVideo,
  ordenarPorClave,
  sePuedeMostrar,
  texto,
  type CategoriaVista,
  type Pieza,
  type SitioVista,
} from '@/lib/mapeo'
import type { Categoria, Sitio, Trabajo } from '@/payload-types'

export type { ArchivoVideo, CategoriaVista, Imagen, Pieza, SitioVista } from '@/lib/mapeo'
export { aImagen, aVideo } from '@/lib/mapeo'

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

/** Campo donde Payload guarda el orden de cada trabajo dentro de su categoría. */
const ORDEN_EN_CATEGORIA = '_trabajos_trabajos_order'

export async function obtenerPagina(): Promise<{
  sitio: SitioVista
  categorias: CategoriaVista[]
  /** Trabajos marcados con "Mostrar en el carrusel", del más reciente al más antiguo. */
  carrusel: Pieza[]
}> {
  const payload = await getPayload({ config })
  const [sitio, categorias, trabajos] = await Promise.all([
    payload.findGlobal({ slug: 'sitio', depth: 1 }),
    // `joins: false`: la lista de trabajos dentro de cada categoría es solo para ordenarlos
    // en el panel; aquí no hace falta.
    payload.find({ collection: 'categorias', depth: 1, limit: 100, joins: false }),
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

  // El orden lo decide Emanuel arrastrando en el panel. Lo que todavía no se ha movido sigue
  // el orden de antes: las categorías por su número de orden y los trabajos por fecha.
  const categoriasEnOrden = ordenarPorClave(
    [...categorias.docs].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0)),
    (c) => c._order,
  )

  return {
    sitio: aSitio(sitio),
    carrusel: trabajos.docs
      .filter((t) => t.carrusel)
      .map((t) => ({ ...aPieza(t), categoria: nombres.get(idCategoria(t)) }))
      .filter(sePuedeMostrar),
    categorias: categoriasEnOrden.map((c: Categoria) => ({
      id: c.id,
      nombre: c.nombre,
      slug: c.slug ?? String(c.id),
      descripcion: texto(c.descripcion),
      portada: aImagen(c.portada),
      videoPortada: aVideo(c.videoPortada),
      piezas: ordenarPorClave(
        trabajos.docs.filter((t) => idCategoria(t) === c.id),
        (t) => t[ORDEN_EN_CATEGORIA],
      )
        .map(aPieza)
        .filter(sePuedeMostrar),
    })),
  }
}
