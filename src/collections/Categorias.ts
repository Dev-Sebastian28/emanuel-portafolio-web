import type { CollectionConfig } from 'payload'

import { revalidarAlBorrar, revalidarAlCambiar } from '@/hooks/revalidar'
import { slugify } from '@/lib/slugify'

export const Categorias: CollectionConfig = {
  slug: 'categorias',
  labels: { singular: 'Categoría', plural: 'Categorías' },
  defaultSort: 'orden',
  admin: {
    useAsTitle: 'nombre',
    defaultColumns: ['nombre', 'orden', 'updatedAt'],
    description: 'Las secciones del portafolio, por ejemplo Bodas, 15 años o Eventos.',
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidarAlCambiar],
    afterDelete: [revalidarAlBorrar],
  },
  fields: [
    {
      name: 'nombre',
      type: 'text',
      label: 'Nombre',
      required: true,
    },
    {
      name: 'descripcion',
      type: 'textarea',
      label: 'Frase corta',
      admin: { description: 'Opcional. Sale debajo del nombre en la tarjeta.' },
    },
    {
      name: 'portada',
      type: 'upload',
      relationTo: 'media',
      label: 'Portada',
      filterOptions: { mimeType: { contains: 'image' } },
    },
    {
      name: 'videoPortada',
      type: 'upload',
      relationTo: 'media',
      label: 'Video de vista previa',
      filterOptions: { mimeType: { contains: 'video' } },
      admin: {
        description:
          'Opcional. Clip corto sin sonido (6 a 12 segundos) que se reproduce en la tarjeta en vez de la portada.',
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
        description: 'Se llena solo a partir del nombre.',
      },
      hooks: {
        beforeValidate: [({ value, data }) => slugify(String(value || data?.nombre || ''))],
      },
    },
    {
      name: 'orden',
      type: 'number',
      label: 'Orden',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Las de número menor salen primero.',
      },
    },
  ],
}
