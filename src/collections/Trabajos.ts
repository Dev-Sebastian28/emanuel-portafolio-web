import type { CollectionConfig, Validate } from 'payload'

import { revalidarAlBorrar, revalidarAlCambiar } from '@/hooks/revalidar'
import { idDeYoutube } from '@/lib/youtube'

type Tipo = 'video' | 'youtube' | 'foto'

/** Hace obligatorio un campo solo cuando el trabajo es del tipo indicado. */
const obligatorioSi =
  (tipo: Tipo, mensaje: string): Validate =>
  (valor, { siblingData }) => {
    const datos = siblingData as { tipo?: Tipo }
    if (datos.tipo === tipo && !valor) return mensaje
    return true
  }

const linkDeYoutube: Validate = (valor, { siblingData }) => {
  const datos = siblingData as { tipo?: Tipo }
  if (datos.tipo !== 'youtube') return true
  if (!valor) return 'Pegue el link del video de YouTube.'
  return idDeYoutube(String(valor))
    ? true
    : 'Ese link no parece de YouTube. Cópielo desde el botón "Compartir".'
}

const esTipo =
  (...tipos: Tipo[]) =>
  (_: unknown, siblingData: { tipo?: Tipo }) =>
    tipos.includes(siblingData?.tipo as Tipo)

export const Trabajos: CollectionConfig = {
  slug: 'trabajos',
  labels: { singular: 'Trabajo', plural: 'Trabajos' },
  defaultSort: '-fecha',
  admin: {
    useAsTitle: 'titulo',
    defaultColumns: ['titulo', 'categoria', 'tipo', 'fecha', '_status'],
    description: 'Cada video, link de YouTube o foto que se muestra en una categoría.',
  },
  versions: {
    drafts: true,
  },
  access: {
    // El público solo ve lo publicado; con sesión iniciada se ven también los borradores.
    read: ({ req }) => (req.user ? true : { _status: { equals: 'published' } }),
  },
  hooks: {
    afterChange: [revalidarAlCambiar],
    afterDelete: [revalidarAlBorrar],
  },
  fields: [
    {
      name: 'titulo',
      type: 'text',
      label: 'Título',
      required: true,
      admin: { description: 'Por ejemplo: "Boda de Laura y Andrés".' },
    },
    {
      name: 'categoria',
      type: 'relationship',
      relationTo: 'categorias',
      label: 'Categoría',
      required: true,
    },
    {
      name: 'tipo',
      type: 'select',
      label: 'Tipo',
      required: true,
      defaultValue: 'video',
      options: [
        { label: 'Video corto (se sube aquí)', value: 'video' },
        { label: 'Video largo en YouTube', value: 'youtube' },
        { label: 'Foto', value: 'foto' },
      ],
    },
    {
      name: 'video',
      type: 'upload',
      relationTo: 'media',
      label: 'Video',
      filterOptions: { mimeType: { contains: 'video' } },
      validate: obligatorioSi('video', 'Suba el video.'),
      admin: {
        condition: esTipo('video'),
        description:
          'MP4, 1080p, 8 a 10 Mbps, con "Optimizar para web" activado. Hasta 1 o 2 minutos.',
      },
    },
    {
      name: 'youtube',
      type: 'text',
      label: 'Link de YouTube',
      validate: linkDeYoutube,
      admin: {
        condition: esTipo('youtube'),
        description: 'Puede estar como "No listado" en YouTube; igual se ve en la página.',
      },
    },
    {
      name: 'foto',
      type: 'upload',
      relationTo: 'media',
      label: 'Foto',
      filterOptions: { mimeType: { contains: 'image' } },
      validate: obligatorioSi('foto', 'Suba la foto.'),
      admin: { condition: esTipo('foto') },
    },
    {
      name: 'portada',
      type: 'upload',
      relationTo: 'media',
      label: 'Portada',
      filterOptions: { mimeType: { contains: 'image' } },
      validate: obligatorioSi('youtube', 'Los videos de YouTube necesitan una portada propia.'),
      admin: {
        condition: esTipo('video', 'youtube'),
        description: 'Imagen que se ve antes de reproducir. Mejor en alta calidad.',
      },
    },
    {
      name: 'orientacion',
      type: 'select',
      label: 'Orientación',
      defaultValue: 'horizontal',
      options: [
        { label: 'Horizontal', value: 'horizontal' },
        { label: 'Vertical (reel)', value: 'vertical' },
      ],
      admin: {
        position: 'sidebar',
        condition: esTipo('video', 'youtube'),
      },
    },
    {
      name: 'fecha',
      type: 'date',
      label: 'Fecha',
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMM yyyy' },
      },
    },
    {
      name: 'lugar',
      type: 'text',
      label: 'Lugar o cliente',
    },
    {
      name: 'descripcion',
      type: 'textarea',
      label: 'Descripción',
    },
  ],
}
