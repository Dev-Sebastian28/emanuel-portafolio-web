import type { MetadataRoute } from 'next'

import { INDEXAR, URL_SITIO } from '@/lib/seo'

// Se arma una sola vez al publicar.
export const dynamic = 'force-static'

/** Le dice a Google qué puede revisar. Mientras no haya INDEXAR=1, nada. */
export default function robots(): MetadataRoute.Robots {
  if (!INDEXAR) return { rules: { userAgent: '*', disallow: '/' } }
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api/', '/vista-previa'] },
    sitemap: `${URL_SITIO}/sitemap.xml`,
    host: URL_SITIO,
  }
}
