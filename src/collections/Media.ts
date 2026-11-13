import {
  APIError,
  type CollectionBeforeChangeHook,
  type CollectionBeforeDeleteHook,
  type CollectionBeforeOperationHook,
  type CollectionConfig,
  type ImageSize,
} from 'payload'
import sharp from 'sharp'

import { revalidarAlBorrar, revalidarAlCambiar } from '@/hooks/revalidar'
import { quitarGps } from '@/lib/quitarGps'

/** Los 5 tamaños que se crean al subir una foto, de celular a pantallas 4K. */
const tamano = (name: string, width: number): ImageSize => ({
  name,
  width,
  withoutEnlargement: true,
  formatOptions: { format: 'webp', options: { quality: 82 } },
})

const FORMATOS = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'video/mp4', 'video/webm']
const EXTENSIONES = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'mp4', 'webm']

/** Explica por qué no se puede subir un archivo y qué hacer, según su formato. */
function mensajeDeFormato(nombre: string, tipo: string): string {
  const extension = nombre.split('.').pop()?.toLowerCase() ?? ''
  if (extension === 'mov' || tipo === 'video/quicktime') {
    return `«${nombre}» es un video .MOV (como los del iPhone) y no se puede subir así. Hay que exportarlo en MP4 (H.264, 1080p, de 8 a 10 Mbps) y subir ese.`
  }
  if (['heic', 'heif'].includes(extension) || tipo.startsWith('image/hei')) {
    return `«${nombre}» es una foto .HEIC (formato del iPhone) y no se puede subir así. Hay que exportarla o convertirla a JPG en calidad máxima.`
  }
  if (['tif', 'tiff', 'dng', 'cr2', 'cr3', 'nef', 'arw', 'raf', 'orf', 'psd'].includes(extension)) {
    return `«${nombre}» es un archivo de edición o RAW (.${extension.toUpperCase()}). Hay que exportarlo en JPG, calidad máxima, de 3.000 a 4.000 px en el lado largo.`
  }
  return `«${nombre}» no se puede subir porque su formato no es compatible. Se aceptan fotos JPG, PNG, WEBP o AVIF y videos MP4 o WEBM.`
}

/**
 * Antes de guardar un archivo nuevo:
 * - Revisa el formato y, si no sirve, explica qué hacer.
 * - Le borra a las fotos JPG la ubicación GPS, sin volver a comprimirlas.
 */
const revisarYLimpiar: CollectionBeforeOperationHook = ({ args, operation, req }) => {
  const archivo = req.file
  if (!archivo || (operation !== 'create' && operation !== 'update')) return args

  const extension = archivo.name.split('.').pop()?.toLowerCase() ?? ''
  if (!FORMATOS.includes(archivo.mimetype) && !EXTENSIONES.includes(extension)) {
    throw new APIError(mensajeDeFormato(archivo.name, archivo.mimetype), 400, undefined, true)
  }

  // Solo si el archivo llegó completo al servidor (con R2, a veces llega solo el principio).
  const completo =
    archivo.data?.length > 0 && (!archivo.size || archivo.data.length === archivo.size)
  if (archivo.mimetype === 'image/jpeg' && completo) {
    const { datos, habiaGps } = quitarGps(archivo.data)
    if (habiaGps) {
      archivo.data = datos
      archivo.size = datos.length
      // Si el navegador ya lo había subido directo a R2, así Payload vuelve a subir la versión limpia.
      delete (archivo as { clientUploadContext?: unknown }).clientUploadContext
    }
  }
  return args
}

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

/** No deja borrar un archivo que se está usando: el trabajo o la sección quedaría vacía. */
const evitarBorrarSiSeUsa: CollectionBeforeDeleteHook = async ({ id, req }) => {
  const usos: string[] = []
  const igualA = { equals: id }

  const trabajos = await req.payload.find({
    collection: 'trabajos',
    where: { or: [{ video: igualA }, { foto: igualA }, { portada: igualA }] },
    draft: true,
    depth: 0,
    limit: 5,
    req,
  })
  for (const t of trabajos.docs) usos.push(`el trabajo «${t.titulo}»`)
  if (trabajos.totalDocs > trabajos.docs.length) {
    usos.push(`${trabajos.totalDocs - trabajos.docs.length} trabajos más`)
  }

  const categorias = await req.payload.find({
    collection: 'categorias',
    where: { or: [{ portada: igualA }, { videoPortada: igualA }] },
    depth: 0,
    limit: 10,
    joins: false,
    req,
  })
  for (const c of categorias.docs) usos.push(`la portada de la categoría «${c.nombre}»`)

  const sitio = await req.payload.findGlobal({ slug: 'sitio', depth: 0, req })
  const mismo = (valor: unknown) => valor != null && String(valor) === String(id)
  if (mismo(sitio.videoEntrada)) usos.push('el video de entrada de la página')
  if (mismo(sitio.videoEntradaVertical)) usos.push('el video de entrada para celular')
  if (mismo(sitio.portadaEntrada)) usos.push('la imagen de la entrada de la página')
  if (mismo(sitio.retrato)) usos.push('la foto de "Sobre mí"')

  if (usos.length) {
    throw new APIError(
      `Este archivo no se puede borrar porque se está usando en ${usos.join(', ')}. Primero hay que cambiarlo o quitarlo allí; después ya se puede borrar.`,
      400,
      undefined,
      true,
    )
  }
}

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Archivo', plural: 'Archivos' },
  admin: {
    description:
      'Todas las fotos y videos cortos de la página. Aquí se guardan; para que aparezcan en la página hay que usarlos en un trabajo, en una categoría o en "Datos de la página". Fotos: JPG en calidad máxima, de 3.000 a 4.000 px en el lado largo. Videos: MP4, 1080p, de 8 a 10 Mbps, con "Optimizar para web". Los videos largos van en YouTube.',
    defaultColumns: ['filename', 'alt', 'mimeType', 'updatedAt'],
  },
  access: {
    read: () => true,
  },
  hooks: {
    beforeOperation: [revisarYLimpiar],
    beforeChange: [crearDesenfoque],
    beforeDelete: [evitarBorrarSiSeUsa],
    afterChange: [revalidarAlCambiar],
    afterDelete: [revalidarAlBorrar],
  },
  fields: [
    {
      name: 'avisos',
      type: 'ui',
      admin: {
        components: { Field: '/components/panel/AvisosArchivo#AvisosArchivo' },
      },
    },
    {
      name: 'alt',
      type: 'text',
      label: 'Descripción corta',
      admin: {
        description:
          'Qué se ve en la foto o el video, en pocas palabras (por ejemplo: «Novios saliendo de la iglesia»). No se ve en la página, pero Google la usa para entender las fotos y la leen en voz alta los celulares de personas con discapacidad visual.',
      },
    },
    {
      name: 'desenfoque',
      type: 'text',
      admin: { hidden: true },
    },
  ],
  upload: {
    mimeTypes: FORMATOS,
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
