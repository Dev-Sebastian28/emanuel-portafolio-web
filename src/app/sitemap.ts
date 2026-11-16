import type { MetadataRoute } from 'next'

import { URL_SITIO } from '@/lib/seo'
import { obtenerPagina } from '@/lib/vista'

// Se arma una sola vez al publicar (y otra vez cada vez que Emanuel publica algo).
export const dynamic = 'force-static'

/** Lista de páginas para Google: la principal y una por categoría. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { categorias } = await obtenerPagina()
  const hoy = new Date()
  return [
    { url: `${URL_SITIO}/`, lastModified: hoy, changeFrequency: 'weekly', priority: 1 },
    ...categorias.map((c) => ({
      url: `${URL_SITIO}/${c.slug}`,
      lastModified: hoy,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ]
}
