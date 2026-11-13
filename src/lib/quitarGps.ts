/**
 * Borra la ubicación GPS de una foto JPG sin volver a comprimirla: la imagen queda idéntica,
 * byte por byte, y solo se borran los datos del lugar donde se tomó.
 *
 * Una foto JPG guarda sus datos extra en bloques al principio del archivo:
 * - EXIF: datos de la cámara. Ahí hay una sección GPS; se deja vacía y se borran sus valores.
 * - XMP: copia de los datos que agregan programas como Lightroom. Si menciona el GPS, se quita
 *   ese bloque completo.
 * Todo lo demás (orientación, perfil de color, cámara, copyright) se conserva.
 */

/** Bytes que ocupa cada tipo de dato EXIF. */
const BYTES_POR_TIPO: Record<number, number> = {
  1: 1,
  2: 1,
  3: 2,
  4: 4,
  5: 8,
  6: 1,
  7: 1,
  8: 2,
  9: 4,
  10: 8,
  11: 4,
  12: 8,
}

const ETIQUETA_GPS = 0x8825

/** Vacía la sección GPS de un bloque EXIF. Modifica `bloque` y dice si había GPS. */
function vaciarGpsExif(bloque: Buffer, inicioTiff: number): boolean {
  const orden = bloque.toString('latin1', inicioTiff, inicioTiff + 2)
  const le = orden === 'II'
  if (!le && orden !== 'MM') return false

  const cabe = (pos: number, n: number) => pos >= 0 && pos + n <= bloque.length
  const leer16 = (pos: number) => (le ? bloque.readUInt16LE(pos) : bloque.readUInt16BE(pos))
  const leer32 = (pos: number) => (le ? bloque.readUInt32LE(pos) : bloque.readUInt32BE(pos))

  if (!cabe(inicioTiff, 8)) return false
  const ifd0 = inicioTiff + leer32(inicioTiff + 4)
  if (!cabe(ifd0, 2)) return false

  const entradas = leer16(ifd0)
  for (let k = 0; k < entradas; k++) {
    const entrada = ifd0 + 2 + k * 12
    if (!cabe(entrada, 12)) return false
    if (leer16(entrada) !== ETIQUETA_GPS) continue

    const gps = inicioTiff + leer32(entrada + 8)
    if (!cabe(gps, 2)) return false
    const datosGps = leer16(gps)
    if (datosGps === 0) return false

    for (let j = 0; j < datosGps; j++) {
      const dato = gps + 2 + j * 12
      if (!cabe(dato, 12)) break
      const tipo = leer16(dato + 2)
      const cuenta = leer32(dato + 4)
      const largo = (BYTES_POR_TIPO[tipo] ?? 1) * cuenta
      // Si el valor no cabe en 4 bytes, está guardado aparte: también se borra.
      if (largo > 4) {
        const aparte = inicioTiff + leer32(dato + 8)
        if (cabe(aparte, largo)) bloque.fill(0, aparte, aparte + largo)
      }
      bloque.fill(0, dato, dato + 12)
    }
    // La sección queda con cero datos (y sin sección siguiente).
    if (le) bloque.writeUInt16LE(0, gps)
    else bloque.writeUInt16BE(0, gps)
    return true
  }
  return false
}

export function quitarGps(jpg: Buffer): { datos: Buffer; habiaGps: boolean } {
  if (jpg.length < 4 || jpg[0] !== 0xff || jpg[1] !== 0xd8) return { datos: jpg, habiaGps: false }

  const partes: Buffer[] = [jpg.subarray(0, 2)]
  let habiaGps = false
  let i = 2

  while (i + 4 <= jpg.length && jpg[i] === 0xff) {
    const marcador = jpg[i + 1]
    // Desde aquí empieza la imagen en sí: ya no hay más bloques de datos.
    if (marcador === 0xda || marcador === 0xd9) break

    const fin = i + 2 + jpg.readUInt16BE(i + 2)
    if (fin > jpg.length) break
    let bloque = jpg.subarray(i, fin)

    if (marcador === 0xe1) {
      const firma = bloque.toString('latin1', 4, 40)
      if (firma.startsWith('Exif\0\0')) {
        bloque = Buffer.from(bloque) // copia, para no tocar el archivo original en memoria
        if (vaciarGpsExif(bloque, 10)) habiaGps = true
      } else if (firma.startsWith('http://ns.adobe.com/') && bloque.includes('GPS')) {
        habiaGps = true
        i = fin
        continue // se quita el bloque XMP que repite la ubicación
      }
    }

    partes.push(bloque)
    i = fin
  }

  if (!habiaGps) return { datos: jpg, habiaGps: false }
  partes.push(jpg.subarray(i))
  return { datos: Buffer.concat(partes), habiaGps }
}
