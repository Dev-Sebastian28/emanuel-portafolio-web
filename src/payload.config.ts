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
    },
  },
  i18n: {
    supportedLanguages: { es },
    fallbackLanguage: 'es',
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
  },
  plugins: usarR2
    ? [
        s3Storage({
          collections: { media: true },
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
