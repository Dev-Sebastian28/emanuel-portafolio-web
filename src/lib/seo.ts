/**
 * Datos para Google: dirección de la página, zona, descripciones y la ficha del negocio.
 * Decisiones de Sebastian (16 nov 2026): video y fotografía, en Bogotá y alrededores, con
 * una página por categoría. Google la muestra solo con INDEXAR=1 (cuando esté el dominio).
 */
import type { CategoriaVista, Imagen, SitioVista } from '@/lib/vista'

export const URL_SITIO = (process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000').replace(
  /\/$/,
  '',
)

/** Mientras sea falso, se le pide a Google que no muestre la página. */
export const INDEXAR = process.env.INDEXAR === '1'

/** Donde trabaja Emanuel: Bogotá y los municipios cercanos donde se hacen eventos. */
export const ZONA = [
  'Bogotá',
  'Chía',
  'Cajicá',
  'Cota',
  'La Calera',
  'Sopó',
  'Tenjo',
  'Tabio',
  'Zipaquirá',
  'Guasca',
  'Subachoque',
]

/** "bodas, 15 años y eventos" */
export function enLista(nombres: string[]): string {
  const minusculas = nombres.map((n) => n.toLocaleLowerCase('es'))
  if (minusculas.length < 2) return minusculas.join('')
  return `${minusculas.slice(0, -1).join(', ')} y ${minusculas.at(-1)}`
}

export function descripcionSitio(sitio: SitioVista, categorias: string[]): string {
  const que = categorias.length ? enLista(categorias) : 'bodas, 15 años y eventos'
  return `Video y fotografía de ${que} en Bogotá y alrededores (Chía, Cajicá, La Calera y más). ${sitio.nombre} cuenta cada historia como se vivió.`
}

export function descripcionCategoria(sitio: SitioVista, categoria: CategoriaVista): string {
  if (categoria.descripcion) return categoria.descripcion
  const nombre = categoria.nombre.toLocaleLowerCase('es')
  return `Videos y fotos de ${nombre} en Bogotá y alrededores, por ${sitio.nombre}. Mire los trabajos y escriba para cotizar.`
}

/** Las fotos guardadas en la carpeta del panel vienen sin dominio; Google las necesita completas. */
export const absoluta = (src: string) => (/^https?:\/\//.test(src) ? src : `${URL_SITIO}${src}`)

export const imagenParaCompartir = (imagen?: Imagen) =>
  imagen ? [{ url: absoluta(imagen.src), width: imagen.width, height: imagen.height }] : undefined

/** Ficha del negocio para Google (schema.org): quién es, qué hace, dónde y cómo contactarlo. */
export function fichaNegocio(sitio: SitioVista, categorias: CategoriaVista[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${URL_SITIO}/#negocio`,
    name: sitio.nombre,
    description: descripcionSitio(
      sitio,
      categorias.map((c) => c.nombre),
    ),
    url: `${URL_SITIO}/`,
    image: sitio.portadaEntrada ? absoluta(sitio.portadaEntrada.src) : undefined,
    email: sitio.email,
    telephone: sitio.whatsapp ? `+${sitio.whatsapp}` : undefined,
    sameAs: sitio.instagram ? [sitio.instagram] : undefined,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Bogotá',
      addressRegion: 'Bogotá D.C.',
      addressCountry: 'CO',
    },
    areaServed: ZONA.map((name) => ({ '@type': 'City', name })),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Video y fotografía',
      itemListElement: categorias.map((c) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: `Video y fotografía de ${c.nombre.toLocaleLowerCase('es')}`,
          url: `${URL_SITIO}/${c.slug}`,
        },
      })),
    },
  }
}

export function migaDePan(categoria: CategoriaVista) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${URL_SITIO}/` },
      {
        '@type': 'ListItem',
        position: 2,
        name: categoria.nombre,
        item: `${URL_SITIO}/${categoria.slug}`,
      },
    ],
  }
}
