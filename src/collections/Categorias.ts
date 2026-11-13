import {
  APIError,
  type CollectionBeforeDeleteHook,
  type CollectionConfig,
  type Validate,
} from 'payload'

import { revalidarAlBorrar, revalidarAlCambiar } from '@/hooks/revalidar'
import { slugify } from '@/lib/slugify'

/** El nombre es obligatorio y no puede repetirse: de él sale el link de la categoría. */
const nombreValido: Validate = async (valor, { id, req }) => {
  const nombre = String(valor ?? '').trim()
  if (!nombre) {
    return 'Falta el nombre. Es el título de la tarjeta en la sección «Galería» de la página.'
  }
  const slug = slugify(nombre)
  if (!slug) return 'El nombre necesita al menos una letra o un número.'

  const repetida = await req.payload.find({
    collection: 'categorias',
    where: { and: [{ slug: { equals: slug } }, ...(id ? [{ id: { not_equals: id } }] : [])] },
    depth: 0,
    limit: 1,
    joins: false,
    req,
  })
  const otra = repetida.docs[0]
  return otra
    ? `Ya existe una categoría con un nombre igual o muy parecido («${otra.nombre}»). Hay que usar otro nombre.`
    : true
}

/** No deja borrar una categoría que todavía tiene trabajos: quedarían sin galería. */
const evitarBorrarConTrabajos: CollectionBeforeDeleteHook = async ({ id, req }) => {
  const { totalDocs } = await req.payload.count({
    collection: 'trabajos',
    where: { categoria: { equals: id } },
    req,
  })
  if (!totalDocs) return

  const categoria = await req.payload.findByID({
    collection: 'categorias',
    id,
    depth: 0,
    joins: false,
    req,
  })
  throw new APIError(
    `La categoría «${categoria.nombre}» no se puede borrar porque tiene ${totalDocs} ${
      totalDocs === 1 ? 'trabajo' : 'trabajos'
    }. Primero hay que pasarlos a otra categoría (o borrarlos); después ya se puede borrar.`,
    400,
    undefined,
    true,
  )
}

export const Categorias: CollectionConfig = {
  slug: 'categorias',
  labels: { singular: 'Categoría', plural: 'Categorías' },
  // Permite cambiar el orden arrastrando las categorías en la lista del panel.
  orderable: true,
  defaultSort: '_order',
  admin: {
    useAsTitle: 'nombre',
    defaultColumns: ['nombre', 'descripcion', 'updatedAt'],
    description:
      'Las galerías de la página (Bodas, 15 años, Eventos…). Cada una es una tarjeta en la sección «Galería»; al tocarla se abren sus trabajos. Para cambiar el orden en que salen, se arrastran desde el ícono ⠿ de la izquierda en esta lista.',
  },
  access: {
    read: () => true,
  },
  hooks: {
    beforeDelete: [evitarBorrarConTrabajos],
    afterChange: [revalidarAlCambiar],
    afterDelete: [revalidarAlBorrar],
  },
  fields: [
    {
      name: 'nombre',
      type: 'text',
      label: 'Nombre',
      required: true,
      validate: nombreValido,
      admin: {
        description: 'Título de la tarjeta en la página y de su galería. Por ejemplo: «Bodas».',
      },
    },
    {
      name: 'descripcion',
      type: 'textarea',
      label: 'Frase corta',
      admin: {
        description:
          'Opcional. Sale debajo del nombre, en la tarjeta de la categoría. Mejor una sola línea, por ejemplo: «Historias de amor contadas en video».',
      },
    },
    {
      name: 'portada',
      type: 'upload',
      relationTo: 'media',
      label: 'Portada',
      filterOptions: { mimeType: { contains: 'image' } },
      admin: {
        description:
          'La foto de la tarjeta en la sección «Galería». Se ve vertical (3:4), así que conviene una foto vertical o con el centro de interés en el medio. Sin portada, la tarjeta sale en gris con el nombre.',
      },
    },
    {
      name: 'videoPortada',
      type: 'upload',
      relationTo: 'media',
      label: 'Video de vista previa',
      filterOptions: { mimeType: { contains: 'video' } },
      admin: {
        description:
          'Opcional. Un clip corto (6 a 12 segundos), sin sonido, que se reproduce en la tarjeta en lugar de la portada. La portada se sigue usando mientras el video carga.',
      },
    },
    {
      name: 'trabajos',
      type: 'join',
      collection: 'trabajos',
      on: 'categoria',
      label: 'Trabajos de esta categoría',
      // Permite cambiar el orden de los trabajos dentro de la galería arrastrándolos.
      orderable: true,
      defaultLimit: 100,
      admin: {
        defaultColumns: ['titulo', 'tipo', '_status'],
        allowCreate: false,
        description:
          'Así salen en la galería de esta categoría, de arriba hacia abajo. Para cambiar el orden se arrastran desde el ícono ⠿. Los trabajos nuevos salen de primeros.',
      },
    },
    {
      name: 'slug',
      type: 'text',
      label: 'Nombre en el link',
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Se crea solo a partir del nombre, sin tildes ni eñes. Por ejemplo: 15-anos.',
      },
      hooks: {
        beforeValidate: [({ value, data }) => slugify(String(data?.nombre || value || ''))],
      },
    },
    {
      // Orden de antes de poder arrastrar. Ya no se edita (manda el orden arrastrado), pero se
      // deja para no borrar datos guardados y como respaldo mientras no se haya arrastrado nada.
      name: 'orden',
      type: 'number',
      label: 'Orden (antiguo)',
      defaultValue: 0,
      admin: { hidden: true },
    },
  ],
}
