import type { GlobalConfig, Validate } from 'payload'

import { revalidarGlobal } from '@/hooks/revalidar'

const nombreValido: Validate = (valor) =>
  String(valor ?? '').trim()
    ? true
    : 'Falta el nombre. Es el que sale en grande al abrir la página, arriba en el menú y en la pestaña del navegador.'

/** Número de WhatsApp: solo dígitos, con el indicativo del país (57 en Colombia). */
const whatsappValido: Validate = (valor) => {
  const texto = String(valor ?? '').trim()
  if (!texto) return true
  if (/[^\d\s+()-]/.test(texto)) {
    return 'El WhatsApp va solo con números, sin letras. Ejemplo: 573001234567.'
  }
  const digitos = texto.replace(/\D/g, '')
  if (digitos.length === 10 && digitos.startsWith('3')) {
    return 'Le falta el indicativo del país adelante: en Colombia es 57. Ejemplo: 573001234567.'
  }
  if (digitos.length < 11 || digitos.length > 15) {
    return 'El número parece incompleto o tiene dígitos de más. Va el indicativo del país y el número, todo junto: 573001234567.'
  }
  return true
}

const correoValido: Validate = (valor) => {
  const texto = String(valor ?? '').trim()
  if (!texto) return true
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(texto)
    ? true
    : 'Ese correo no está bien escrito. Debe verse así: nombre@gmail.com.'
}

const instagramValido: Validate = (valor) => {
  const texto = String(valor ?? '').trim()
  if (!texto) return true
  if (texto.startsWith('@')) {
    return 'Aquí va el link completo del perfil, no solo el @usuario. Ejemplo: https://www.instagram.com/emanuel.fonsecam/'
  }
  return /^https?:\/\/(www\.)?instagram\.com\/[^/\s?#]+/i.test(texto)
    ? true
    : 'Ese link no es de un perfil de Instagram. Se copia desde el perfil, en «Compartir perfil», y se ve así: https://www.instagram.com/emanuel.fonsecam/'
}

export const Sitio: GlobalConfig = {
  slug: 'sitio',
  label: 'Datos de la página',
  admin: {
    description:
      'Los textos y videos fijos de la página: la entrada, «Sobre mí» y el contacto. Los cambios se ven en la página apenas se guardan.',
  },
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
          description: 'Lo primero que se ve al abrir la página.',
          fields: [
            {
              name: 'nombre',
              type: 'text',
              label: 'Nombre',
              required: true,
              validate: nombreValido,
              admin: {
                description:
                  'Sale en grande en la entrada, arriba en el menú, en el pie de página y en la pestaña del navegador. También es lo que muestra Google como título.',
              },
            },
            {
              name: 'profesion',
              type: 'text',
              label: 'Qué hace',
              admin: {
                description:
                  'Sale encima del nombre en la entrada y junto al nombre en Google y en WhatsApp cuando se comparte el link. Ej.: Videógrafo · Producción audiovisual.',
              },
            },
            {
              name: 'ciudad',
              type: 'text',
              label: 'Ciudad',
              admin: {
                description:
                  'Sale en la entrada, al lado de «Qué hace», y en el pie de página. Ej.: Bogotá, Colombia.',
              },
            },
          ],
        },
        {
          label: 'Entrada',
          description:
            'El video del recuadro que se ve al abrir la página y que crece al bajar. De 6 a 12 segundos, en bucle, sin sonido, de 4 a 5 Mbps.',
          fields: [
            {
              name: 'videoEntrada',
              type: 'upload',
              relationTo: 'media',
              label: 'Video de entrada (horizontal)',
              filterOptions: { mimeType: { contains: 'video' } },
              admin: {
                description:
                  'El que se ve en computadores y tabletas. Horizontal (16:9), 1080p. Sin video, el recuadro sale en gris.',
              },
            },
            {
              name: 'videoEntradaVertical',
              type: 'upload',
              relationTo: 'media',
              label: 'Video de entrada (vertical, para celular)',
              filterOptions: { mimeType: { contains: 'video' } },
              admin: {
                description:
                  'Opcional. El que se ve en celulares, que llena mejor la pantalla. Vertical (9:16). Si se deja vacío, en celular se usa el horizontal.',
              },
            },
            {
              name: 'portadaEntrada',
              type: 'upload',
              relationTo: 'media',
              label: 'Imagen mientras carga el video',
              filterOptions: { mimeType: { contains: 'image' } },
              admin: {
                description:
                  'Se ve un instante mientras carga el video, y es la imagen que aparece cuando se comparte el link de la página por WhatsApp o redes. Lo ideal: un cuadro del mismo video.',
              },
            },
          ],
        },
        {
          label: 'Sobre mí',
          description: 'La sección que presenta a Emanuel, después de la galería.',
          fields: [
            {
              name: 'retrato',
              type: 'upload',
              relationTo: 'media',
              label: 'Foto de retrato',
              filterOptions: { mimeType: { contains: 'image' } },
              admin: {
                description:
                  'Foto de Emanuel, vertical (4:5). Sale al lado del texto. Sin foto, el recuadro sale en gris.',
              },
            },
            {
              name: 'tituloSobreMi',
              type: 'text',
              label: 'Título',
              admin: { description: 'El título grande de la sección. Ej.: «Hola, soy Emanuel».' },
            },
            {
              name: 'sobreMi',
              type: 'textarea',
              label: 'Texto',
              admin: {
                description:
                  'La presentación: quién es, cómo trabaja y qué lo diferencia. Lo ideal son 2 o 3 párrafos cortos; un renglón vacío separa los párrafos.',
              },
            },
            {
              name: 'etiquetas',
              type: 'array',
              label: 'Etiquetas',
              labels: { singular: 'Etiqueta', plural: 'Etiquetas' },
              admin: {
                description:
                  'Palabras cortas que salen como pastillas debajo del texto. Ej.: «Bodas», «Drone», «Edición». Mejor entre 3 y 6.',
              },
              fields: [
                {
                  name: 'texto',
                  type: 'text',
                  label: 'Texto',
                  required: true,
                  validate: (valor: unknown) =>
                    String(valor ?? '').trim()
                      ? true
                      : 'La etiqueta está vacía: hay que escribirla o quitarla.',
                },
              ],
            },
          ],
        },
        {
          label: 'Contacto',
          description:
            'La sección final de la página. Cada botón aparece solo si su dato está lleno.',
          fields: [
            {
              name: 'textoContacto',
              type: 'textarea',
              label: 'Texto de invitación',
              admin: {
                description:
                  'Sale debajo de «Trabajemos juntos». Una o dos frases que inviten a escribir.',
              },
            },
            {
              name: 'whatsapp',
              type: 'text',
              label: 'WhatsApp',
              validate: whatsappValido,
              admin: {
                description:
                  'Activa el botón de WhatsApp, que abre un chat con un mensaje de saludo ya escrito. Solo números, con el 57 adelante. Ej.: 573001234567.',
              },
            },
            {
              name: 'email',
              type: 'email',
              label: 'Correo',
              validate: correoValido,
              admin: { description: 'Activa el botón de correo.' },
            },
            {
              name: 'instagram',
              type: 'text',
              label: 'Link de Instagram',
              validate: instagramValido,
              admin: {
                description:
                  'Activa el botón de Instagram. El link completo del perfil, por ejemplo https://www.instagram.com/emanuel.fonsecam/',
              },
            },
          ],
        },
      ],
    },
  ],
}
