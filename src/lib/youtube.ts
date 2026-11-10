const PATRONES = [
  /youtu\.be\/([\w-]{11})/,
  /youtube\.com\/watch\?(?:.*&)?v=([\w-]{11})/,
  /youtube\.com\/(?:shorts|embed|live)\/([\w-]{11})/,
]

/** Saca el identificador de 11 caracteres de cualquier link de YouTube. */
export function idDeYoutube(link: string | null | undefined): string | undefined {
  if (!link) return undefined
  for (const patron of PATRONES) {
    const encontrado = link.match(patron)
    if (encontrado) return encontrado[1]
  }
  return undefined
}
