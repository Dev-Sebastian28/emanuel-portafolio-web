#!/usr/bin/env node
/**
 * Arma la página pública como archivos fijos (sin servidor) y, con --publicar, la sube a
 * Cloudflare. El panel no va aquí: se publica aparte (Render).
 *
 * - Usa la última versión guardada en git, no los cambios sin guardar.
 * - Lee el contenido de la base que diga DATABASE_URL (en el computador, la del archivo .env).
 * - Si los archivos están en la carpeta /media (sin R2), los copia junto a la página.
 * - Mientras no exista INDEXAR=1, le pide a Google que no la muestre.
 *
 * Uso:
 *   node scripts/publicar-pagina.mjs             arma la página y dice dónde quedó
 *   node scripts/publicar-pagina.mjs --publicar  además la sube a Cloudflare
 */
import { execSync, spawnSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const NOMBRE = 'emanuel-fonseca'
const URL_PUBLICA =
  process.env.NEXT_PUBLIC_SERVER_URL || `https://${NOMBRE}.portafolioemanuel42.workers.dev`

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const obra = path.join(raiz, '.exportar')
const salida = path.join(tmpdir(), 'emanuel-pagina')
const publicar = process.argv.includes('--publicar')

const paso = (texto) => console.log(`\n▸ ${texto}`)
const correr = (comando, args, opciones = {}) => {
  const r = spawnSync(comando, args, { stdio: 'inherit', ...opciones })
  if (r.status !== 0) throw new Error(`Falló: ${comando} ${args.join(' ')}`)
}

// El archivo de variables: en el computador manda .env.local (Neon + R2); si no existe,
// se usa .env (Postgres y carpeta /media del computador).
const archivoEnv = ['.env.local', '.env']
  .map((nombre) => path.join(raiz, nombre))
  .find((ruta) => existsSync(ruta))
const variablesEnv = archivoEnv ? readFileSync(archivoEnv, 'utf8') : ''
const usaR2 = Boolean(process.env.S3_BUCKET) || /^S3_BUCKET=\S/m.test(variablesEnv)

try {
  paso('Copiando la última versión guardada, sin el panel')
  rmSync(obra, { recursive: true, force: true })
  mkdirSync(obra)
  execSync(`git archive --format=tar HEAD | tar -x -C "${obra}"`, { cwd: raiz, stdio: 'inherit' })
  rmSync(path.join(obra, 'src/app/(payload)'), { recursive: true, force: true })
  rmSync(path.join(obra, 'prototipos'), { recursive: true, force: true })
  symlinkSync(path.join(raiz, 'node_modules'), path.join(obra, 'node_modules'), 'dir')
  if (variablesEnv) cpSync(archivoEnv, path.join(obra, '.env'))

  paso('Armando la página')
  correr('npx', ['next', 'build'], {
    cwd: obra,
    env: {
      ...process.env,
      EXPORTAR: '1',
      RAIZ_PROYECTO: raiz,
      NEXT_PUBLIC_SERVER_URL: URL_PUBLICA,
      NODE_ENV: 'production',
      NODE_OPTIONS: '--no-deprecation --max-old-space-size=8000',
      NEXT_TELEMETRY_DISABLED: '1',
    },
  })

  rmSync(salida, { recursive: true, force: true })
  cpSync(path.join(obra, 'out'), salida, { recursive: true })

  if (!usaR2 && existsSync(path.join(raiz, 'media'))) {
    paso('Copiando las fotos y videos de la carpeta /media')
    cpSync(path.join(raiz, 'media'), path.join(salida, 'api/media/file'), { recursive: true })
  }

  if (process.env.INDEXAR !== '1') {
    writeFileSync(
      path.join(salida, '_headers'),
      '# Mientras tenga contenido de prueba, que Google no la muestre.\n/*\n  X-Robots-Tag: noindex, nofollow\n',
    )
  }
} finally {
  // La copia de trabajo se borra siempre, para que no se mezcle con el proyecto.
  rmSync(obra, { recursive: true, force: true })
}

console.log(`\nPágina armada en ${salida}`)

if (publicar) {
  paso('Subiendo a Cloudflare')
  // Sin R2, los videos van junto a la página y necesitan rangos-cloudflare.js para el iPhone.
  const configuracion = {
    name: NOMBRE,
    compatibility_date: '2026-11-10',
    ...(usaR2 ? {} : { main: path.join(raiz, 'scripts/rangos-cloudflare.js') }),
    assets: {
      directory: salida,
      ...(usaR2 ? {} : { binding: 'ASSETS', run_worker_first: ['/api/media/*'] }),
    },
  }
  const archivoConfiguracion = path.join(tmpdir(), 'emanuel-pagina-wrangler.json')
  writeFileSync(archivoConfiguracion, JSON.stringify(configuracion, null, 2))
  correr('npx', ['--yes', 'wrangler@4', 'deploy', '--config', archivoConfiguracion])
  console.log(`\nPublicada en ${URL_PUBLICA}`)
}
