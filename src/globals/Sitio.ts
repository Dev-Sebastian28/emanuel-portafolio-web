import type { GlobalConfig } from 'payload'

import { revalidarGlobal } from '@/hooks/revalidar'

export const Sitio: GlobalConfig = {
  slug: 'sitio',
  label: 'Datos de la página',
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidarGlobal],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'General',
          fields: [
            { name: 'nombre', type: 'text', label: 'Nombre', required: true },
            {
              name: 'profesion',
              type: 'text',
              label: 'Qué hace',
              admin: {
                description: 'Sale debajo del nombre. Ej.: Videógrafo · Producción audiovisual.',
              },
            },
            { name: 'ciudad', type: 'text', label: 'Ciudad' },
          ],
        },
        {
          label: 'Entrada',
          description:
            'El video que se ve al abrir la página: 6 a 12 segundos, en bucle, sin sonido, de 4 a 5 Mbps.',
          fields: [
            {
              name: 'videoEntrada',
              type: 'upload',
              relationTo: 'media',
              label: 'Video de entrada (horizontal)',
              filterOptions: { mimeType: { contains: 'video' } },
            },
            {
              name: 'videoEntradaVertical',
              type: 'upload',
              relationTo: 'media',
              label: 'Video de entrada (vertical, para celular)',
              filterOptions: { mimeType: { contains: 'video' } },
            },
            {
              name: 'portadaEntrada',
              type: 'upload',
              relationTo: 'media',
              label: 'Imagen mientras carga el video',
              filterOptions: { mimeType: { contains: 'image' } },
            },
          ],
        },
        {
          label: 'Sobre mí',
          fields: [
            {
              name: 'retrato',
              type: 'upload',
              relationTo: 'media',
              label: 'Foto de retrato',
              filterOptions: { mimeType: { contains: 'image' } },
            },
            { name: 'tituloSobreMi', type: 'text', label: 'Título' },
            { name: 'sobreMi', type: 'textarea', label: 'Texto' },
            {
              name: 'etiquetas',
              type: 'array',
              label: 'Etiquetas',
              labels: { singular: 'Etiqueta', plural: 'Etiquetas' },
              fields: [{ name: 'texto', type: 'text', label: 'Texto', required: true }],
            },
          ],
        },
        {
          label: 'Contacto',
          fields: [
            { name: 'textoContacto', type: 'textarea', label: 'Texto de invitación' },
            {
              name: 'whatsapp',
              type: 'text',
              label: 'WhatsApp',
              admin: { description: 'Solo números, con el indicativo del país. Ej.: 573001234567' },
            },
            { name: 'email', type: 'email', label: 'Correo' },
            { name: 'instagram', type: 'text', label: 'Link de Instagram' },
          ],
        },
      ],
    },
  ],
}
