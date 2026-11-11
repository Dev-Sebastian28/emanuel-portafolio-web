import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

// Al publicar, la página pública se arma como archivos fijos, sin el panel
// (scripts/publicar-pagina.mjs). Así Cloudflare la sirve gratis.
const exportar = process.env.EXPORTAR === '1'

const nextConfig: NextConfig = {
  ...(exportar ? { output: 'export' as const } : {}),
  images: {
    unoptimized: exportar,
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    // Al publicar se arma en una copia dentro del proyecto que usa sus mismos paquetes.
    root: process.env.RAIZ_PROYECTO || path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
