import type {
  CollectionBeforeChangeHook,
  CollectionConfig,
  PayloadRequest,
  Validate,
} from 'payload'
import { generateKeyBetween } from 'payload/shared'

import { revalidarAlBorrar, revalidarAlCambiar } from '@/hooks/revalidar'
import { idDeYoutube } from '@/lib/youtube'

type Tipo = 'video' | 'youtube' | 'foto'

/** Campo donde Payload guarda el orden del trabajo dentro de su categoría (ver Categorias.ts). */
const ORDEN_EN_CATEGORIA = '_trabajos_trabajos_order'

const idDe = (valor: unknown): number | string | undefined =>
  valor && typeof valor === 'object' && 'id' in valor
    ? (valor as { id: number | string }).id
    : (valor as number | string | undefined) || undefined

const obligatorio =
  (mensaje: string): Validate =>
  (valor) =>
    valor != null && String(valor).trim() !== '' ? true : mensaje

/**
 * Para los campos de archivo: obligatorio solo si el trabajo es de ese tipo, y además revisa
 * que el archivo elegido sea del tipo correcto (por ejemplo, que en "Video" no vaya una foto).
 */
const archivoSi =
  (tipo: Tipo, clase: 'video' | 'image', falta: string, equivocado: string): Validate =>
  async (valor, { siblingData, req }) => {
    if ((siblingData as { tipo?: Tipo }).tipo !== tipo) return true
    const id = idDe(valor)
    if (!id) return falta
    try {
      const media =
        valor && typeof valor === 'object' && 'mimeType' in valor
          ? (valor as { mimeType?: string })
          : await req.payload.findByID({ collection: 'media', id, depth: 0, req })
      return media.mimeType?.startsWith(`${clase}/`) ? true : equivocado
    } catch {
      return 'Ese archivo ya no existe. Hay que elegir o subir otro.'
    }
  }

const linkDeYoutube: Validate = (valor, { siblingData }) => {
  if ((siblingData as { tipo?: Tipo }).tipo !== 'youtube') return true
  if (!valor) return 'Falta pegar el link del video de YouTube.'
  return idDeYoutube(String(valor))
    ? true
    : 'Ese link no es de un video de YouTube. Se copia desde el botón «Compartir» del video y se ve así: https://youtu.be/…'
}

const esTipo =
  (...tipos: Tipo[]) =>
  (_: unknown, siblingData: { tipo?: Tipo }) =>
    tipos.includes(siblingData?.tipo as Tipo)

/**
 * Los trabajos nuevos salen de primeros en la galería de su categoría (Payload los pondría al
 * final). Lo mismo cuando un trabajo se pasa a otra categoría.
 */
const nuevosDePrimeros: CollectionBeforeChangeHook = async ({
  data,
  operation,
  originalDoc,
  req,
}) => {
  const categoria = idDe(data.categoria)
  const cambioDeCategoria =
    operation === 'update' && categoria && idDe(originalDoc?.categoria) !== categoria
  if (!categoria || data[ORDEN_EN_CATEGORIA] || (operation !== 'create' && !cambioDeCategoria)) {
    return data
  }

  const enLaCategoria = await req.payload.find({
    collection: 'trabajos',
    where: { categoria: { equals: categoria }, [ORDEN_EN_CATEGORIA]: { exists: true } },
    depth: 0,
    limit: 0,
    pagination: false,
    select: { [ORDEN_EN_CATEGORIA]: true },
    req,
  })
  // Se busca la menor comparando letra por letra, que es como Payload arma estas claves.
  const claves = enLaCategoria.docs
    .map((t) => (t as Record<string, unknown>)[ORDEN_EN_CATEGORIA])
    .filter((k): k is string => typeof k === 'string' && k !== '')
    .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
  data[ORDEN_EN_CATEGORIA] = generateKeyBetween(null, claves[0] ?? null)
  return data
}

/** Dirección de la vista previa, en el mismo servidor del panel. */
function urlVistaPrevia(req: PayloadRequest, id?: number | string): string {
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host')
  const protocolo =
    req.headers.get('x-forwarded-proto') ?? (host?.startsWith('localhost') ? 'http' : 'https')
  const base = host ? `${protocolo}://${host}` : process.env.NEXT_PUBLIC_SERVER_URL || ''
  return `${base}/vista-previa/trabajo${id ? `?id=${id}` : ''}`
}

export const Trabajos: CollectionConfig = {
  slug: 'trabajos',
  labels: { singular: 'Trabajo', plural: 'Trabajos' },
  defaultSort: '-fecha',
  admin: {
    useAsTitle: 'titulo',
    defaultColumns: ['titulo', 'categoria', 'tipo', 'carrusel', 'fecha', '_status'],
    description:
      'Cada trabajo es un video, un link de YouTube o una foto, y sale en la galería de su categoría. Queda como borrador (no se ve en la página) hasta darle «Publicar cambios». El orden dentro de cada galería se cambia arrastrando, en la categoría.',
    components: {
      beforeList: ['/components/panel/BotonSubirFotos#BotonSubirFotos'],
    },
    // Botón para ver el trabajo como se verá en la página, con los cambios sin publicar.
    livePreview: {
      url: ({ data, req }) => urlVistaPrevia(req, data?.id),
      breakpoints: [
        { label: 'Celular', name: 'celular', width: 390, height: 844 },
        { label: 'Computador', name: 'computador', width: 1440, height: 900 },
      ],
    },
    preview: (doc, { req }) => urlVistaPrevia(req, doc?.id as number | undefined),
  },
  versions: {
    drafts: true,
  },
  access: {
    // El público solo ve lo publicado; con sesión iniciada se ven también los borradores.
    read: ({ req }) => (req.user ? true : { _status: { equals: 'published' } }),
  },
  hooks: {
    beforeChange: [nuevosDePrimeros],
    afterChange: [revalidarAlCambiar],
    afterDelete: [revalidarAlBorrar],
  },
  fields: [
    {
      name: 'titulo',
      type: 'text',
      label: 'Título',
      required: true,
      validate: obligatorio(
        'Falta el título. Es el nombre que sale debajo del trabajo en la galería, por ejemplo «Boda de Laura y Andrés».',
      ),
      admin: {
        description:
          'Sale debajo del trabajo en la galería y encima cuando se abre en grande. Por ejemplo: «Boda de Laura y Andrés».',
      },
    },
    {
      name: 'categoria',
      type: 'relationship',
      relationTo: 'categorias',
      label: 'Categoría',
      required: true,
      validate: obligatorio(
        'Falta elegir la categoría (Bodas, 15 años, Eventos…). Es la galería donde va a salir el trabajo.',
      ),
      admin: {
        description: 'La galería donde sale el trabajo. Se puede cambiar cuando se quiera.',
      },
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
      admin: {
        description:
          'Video corto: reels y clips de hasta 1 o 2 minutos, que se suben aquí. Video largo: el video completo del evento, que se sube a YouTube y aquí solo se pega el link. Foto: una foto suelta.',
      },
    },
    {
      name: 'video',
      type: 'upload',
      relationTo: 'media',
      label: 'Video',
      filterOptions: { mimeType: { contains: 'video' } },
      validate: archivoSi(
        'video',
        'video',
        'Falta subir el video. Sin él, el trabajo no aparece en la página.',
        'Ese archivo es una foto, no un video. Aquí va un video MP4; si es una foto, hay que cambiar el «Tipo» a «Foto».',
      ),
      admin: {
        condition: esTipo('video'),
        description:
          'En la galería se reproduce solo y sin sonido; al abrirlo, con sonido. MP4, 1080p, de 8 a 10 Mbps, con «Optimizar para web» activado. Hasta 1 o 2 minutos.',
      },
    },
    {
      name: 'youtube',
      type: 'text',
      label: 'Link de YouTube',
      validate: linkDeYoutube,
      admin: {
        condition: esTipo('youtube'),
        description:
          'El link del botón «Compartir» del video. Puede estar como «No listado» en YouTube: igual se ve en la página. El video no carga hasta que la persona le da reproducir, así la página sigue rápida.',
      },
    },
    {
      name: 'foto',
      type: 'upload',
      relationTo: 'media',
      label: 'Foto',
      filterOptions: { mimeType: { contains: 'image' } },
      validate: archivoSi(
        'foto',
        'image',
        'Falta subir la foto. Sin ella, el trabajo no aparece en la página.',
        'Ese archivo es un video, no una foto. Si es un video, hay que cambiar el «Tipo» a «Video corto».',
      ),
      admin: {
        condition: esTipo('foto'),
        description:
          'Sale en la galería con su forma original (vertical u horizontal) y en grande al abrirla. JPG en calidad máxima, de 3.000 a 4.000 px en el lado largo.',
      },
    },
    {
      name: 'portada',
      type: 'upload',
      relationTo: 'media',
      label: 'Portada',
      filterOptions: { mimeType: { contains: 'image' } },
      validate: archivoSi(
        'youtube',
        'image',
        'Los videos de YouTube necesitan una portada propia: es la imagen que se ve en la galería antes de darle reproducir.',
        'La portada tiene que ser una foto, no un video.',
      ),
      admin: {
        condition: esTipo('video', 'youtube'),
        description:
          'La imagen que se ve antes de que el video empiece. En los de YouTube es obligatoria y reemplaza la de YouTube, que suele verse de baja calidad. Mejor en alta calidad y con la misma forma del video.',
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
        description:
          'La forma del video. Cambia el recuadro en la galería y en el visor: horizontal (16:9) o vertical (9:16).',
      },
    },
    {
      name: 'carrusel',
      type: 'checkbox',
      label: 'Mostrar en el carrusel',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description:
          'Aparece en las filas de fotos y videos que se mueven al inicio de la página. Conviene marcar lo mejor de cada categoría, unos 20 trabajos en total.',
      },
    },
    {
      name: 'fecha',
      type: 'date',
      label: 'Fecha',
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMM yyyy' },
        description:
          'Cuándo fue el evento. Sale como mes y año («noviembre de 2026») debajo del título. El carrusel muestra primero lo más reciente.',
      },
    },
    {
      name: 'lugar',
      type: 'text',
      label: 'Lugar o cliente',
      admin: {
        description:
          'Opcional. Sale al lado de la fecha, por ejemplo: «Hacienda El Noviciado, Cota».',
      },
    },
    {
      name: 'descripcion',
      type: 'textarea',
      label: 'Descripción',
      admin: {
        description:
          'Opcional. Por ahora no se muestra en la página; queda guardada para usarla más adelante (por ejemplo, para Google).',
      },
    },
  ],
}
