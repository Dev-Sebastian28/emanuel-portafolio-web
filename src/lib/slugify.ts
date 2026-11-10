/**
 * Convierte un texto en un nombre apto para links: sin tildes, sin eñes, sin espacios.
 * Ejemplo: "15 Años" -> "15-anos".
 */
export function slugify(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
