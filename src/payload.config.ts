import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { es } from '@payloadcms/translations/languages/es'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { Categorias } from './collections/Categorias'
import { Media } from './collections/Media'
import { Trabajos } from './collections/Trabajos'
import { Users } from './collections/Users'
import { Sitio } from './globals/Sitio'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Con las variables de R2 llenas, los archivos van a Cloudflare R2 (subida directa desde el
// navegador). Sin ellas, se guardan en la carpeta /media del computador.
const usarR2 = Boolean(process.env.S3_BUCKET)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: ' · Panel de Emanuel',
      icons: [{ rel: 'icon', type: 'image/svg+xml', url: '/icono.svg' }],
    },
    components: {
      // La "E" del diseño en vez del logo de Payload. Cuando llegue el logo de Emanuel, se cambia
      // en estos dos archivos.
      graphics: {
        Logo: '/components/panel/Logo#Logo',
        Icon: '/components/panel/Icono#Icono',
      },
      views: {
        subirFotos: {
          Component: '/components/panel/SubirFotos#SubirFotos',
          path: '/subir-fotos',
        },
      },
    },
  },
  i18n: {
    supportedLanguages: { es },
    fallbackLanguage: 'es',
    // Mensajes de error más claros que los de Payload: qué pasó y qué hacer.
    translations: {
      es: {
        error: {
          followingFieldsInvalid_one: 'Falta corregir este campo antes de guardar:',
          followingFieldsInvalid_other: 'Falta corregir estos campos antes de guardar:',
          correctInvalidFields:
            'Hay campos por corregir: están marcados en rojo, con la explicación debajo.',
          invalidFileType:
            'Ese formato no se puede subir. Se aceptan fotos JPG, PNG, WEBP o AVIF y videos MP4 o WEBM.',
          invalidFileTypeValue:
            'El formato {{value}} no se puede subir. Se aceptan fotos JPG, PNG, WEBP o AVIF y videos MP4 o WEBM. Los .MOV y .HEIC del iPhone hay que exportarlos primero a MP4 o JPG.',
          problemUploadingFile:
            'Se cortó la subida del archivo. Hay que revisar la conexión a internet e intentarlo de nuevo.',
          noFilesUploaded: 'No se subió ningún archivo: falta elegirlo.',
          valueMustBeUnique: 'Ya existe otro con este mismo valor. Hay que usar uno distinto.',
          notAllowedToPerformAction:
            'Esta cuenta no tiene permiso para hacer eso. Puede que la sesión se haya cerrado: conviene volver a entrar.',
          notAllowedToAccessPage:
            'Esta cuenta no tiene permiso para ver esta página. Puede que la sesión se haya cerrado: conviene volver a entrar.',
          emailOrPasswordIncorrect:
            'El correo o la contraseña no coinciden. Hay que revisar que estén bien escritos (mayúsculas incluidas).',
          tokenInvalidOrExpired: 'La sesión se venció. Hay que volver a entrar al panel.',
          unableToDeleteCount:
            'No se pudo borrar {{count}} de {{total}} {{label}}: alguno se está usando en la página. Al borrarlo de a uno se explica dónde.',
          unknown:
            'Algo salió mal y no se guardó. Conviene intentarlo de nuevo; si sigue pasando, avisarle a Sebastian.',
        },
      },
    },
  },
  collections: [Trabajos, Categorias, Media, Users],
  globals: [Sitio],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  upload: {
    limits: { fileSize: 500 * 1024 * 1024 },
    // Payload limita la petición multipart a 50 MB por defecto, aunque el archivo pueda pesar más.
    requestSizeLimit: 500 * 1024 * 1024,
  },
  plugins: usarR2
    ? [
        s3Storage({
          collections: {
            // Con S3_URL_PUBLICA, las fotos y videos se piden directo a R2 y no al panel. Así los
            // encuentra la página publicada en Cloudflare, que no tiene panel.
            media: process.env.S3_URL_PUBLICA
              ? {
                  disablePayloadAccessControl: true,
                  generateFileURL: ({ filename, prefix }) =>
                    [process.env.S3_URL_PUBLICA, prefix, filename].filter(Boolean).join('/'),
                }
              : true,
          },
          bucket: process.env.S3_BUCKET || '',
          clientUploads: true,
          config: {
            endpoint: process.env.S3_ENDPOINT,
            region: 'auto',
            forcePathStyle: true,
            credentials: {
              accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
              secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
            },
          },
        }),
      ]
    : [],
})
