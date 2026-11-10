import type { CollectionBeforeChangeHook, CollectionConfig, ImageSize } from 'payload'
import sharp from 'sharp'

import { revalidarAlBorrar, revalidarAlCambiar } from '@/hooks/revalidar'

/** Los 5 tamaños que se crean al subir una foto, de celular a pantallas 4K. */
const tamano = (name: string, width: number): ImageSize => ({
  name,
  width,
  withoutEnlargement: true,
  formatOptions: { format: 'webp', options: { quality: 82 } },
})

/** Guarda una versión diminuta y borrosa de la foto para mostrarla mientras carga la nítida. */
const crearDesenfoque: CollectionBeforeChangeHook = async ({ data, req }) => {
  const archivo = req.file
  if (!archivo?.data || !archivo.mimetype?.startsWith('image/')) return data
  try {
    const miniatura = await sharp(archivo.data).rotate().resize(24).webp({ quality: 40 }).toBuffer()
    data.desenfoque = `data:image/webp;base64,${miniatura.toString('base64')}`
  } catch {
    // Si la foto no se puede leer, se sube igual, solo que sin la versión borrosa.
  }
  return data
}

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Archivo', plural: 'Archivos' },
  admin: {
    description:
      'Fotos y videos cortos. Fotos: JPG en calidad máxima, lado largo de 3000 a 4000 px. Videos: MP4, 1080p, 8 a 10 Mbps, con "Optimizar para web". Los videos largos van en YouTube.',
    defaultColumns: ['filename', 'alt', 'mimeType', 'updatedAt'],
  },
  access: {
    read: () => true,
  },
  hooks: {
    beforeChange: [crearDesenfoque],
    afterChange: [revalidarAlCambiar],
    afterDelete: [revalidarAlBorrar],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Descripción corta',
      admin: {
        description:
          'Qué se ve en el archivo. La usan Google y las personas que usan lector de pantalla.',
      },
    },
    {
      name: 'desenfoque',
      type: 'text',
      admin: { hidden: true },
    },
  ],
  upload: {
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'video/mp4', 'video/webm'],
    focalPoint: true,
    adminThumbnail: 'xs',
    imageSizes: [
      tamano('xs', 640),
      tamano('sm', 1080),
      tamano('md', 1600),
      tamano('lg', 2400),
      tamano('xl', 3840),
    ],
  },
}
