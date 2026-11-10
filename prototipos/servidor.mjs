// Servidor mínimo para abrir los prototipos en el navegador (http://localhost:4321).
// Uso: node prototipos/servidor.mjs   (o la configuración "prototipos" de .claude/launch.json)
import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { dirname, extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const carpeta = dirname(fileURLToPath(import.meta.url))
const tipos = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.mp4': 'video/mp4',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
}
const puerto = Number(process.env.PORT) || 4321

createServer((pedido, respuesta) => {
  let ruta = decodeURIComponent((pedido.url || '/').split('?')[0])
  if (ruta === '/') ruta = '/index.html'
  const archivo = join(carpeta, normalize(ruta))
  if (!archivo.startsWith(carpeta) || !existsSync(archivo) || statSync(archivo).isDirectory()) {
    respuesta.writeHead(404).end()
    return
  }
  const { size } = statSync(archivo)
  const tipo = tipos[extname(archivo)] || 'application/octet-stream'
  // Los videos se piden por partes (para poder adelantar); se responde igual.
  const partes = /bytes=(\d*)-(\d*)/.exec(pedido.headers.range || '')
  if (partes) {
    const inicio = Number(partes[1]) || 0
    const fin = partes[2] ? Number(partes[2]) : size - 1
    respuesta.writeHead(206, {
      'Content-Type': tipo,
      'Content-Range': `bytes ${inicio}-${fin}/${size}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': fin - inicio + 1,
    })
    createReadStream(archivo, { start: inicio, end: fin }).pipe(respuesta)
    return
  }
  respuesta.writeHead(200, { 'Content-Type': tipo, 'Content-Length': size, 'Accept-Ranges': 'bytes' })
  createReadStream(archivo).pipe(respuesta)
}).listen(puerto, '127.0.0.1', () => console.log(`Prototipos en http://localhost:${puerto}`))
