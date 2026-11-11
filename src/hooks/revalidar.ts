import { revalidatePath } from 'next/cache'
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
} from 'payload'

/**
 * Vuelve a armar la página pública cuando el cliente publica o borra algo en el panel.
 *
 * - En el computador (y en el panel), Next.js la vuelve a armar sola.
 * - En la página publicada en Cloudflare, el panel avisa a la dirección de AVISO_PUBLICAR
 *   (un "deploy hook" de Cloudflare) y Cloudflare la vuelve a armar con lo publicado.
 */
function revalidarSitio(): void {
  try {
    revalidatePath('/', 'layout')
  } catch {
    // Fuera de Next.js (por ejemplo, al cargar los datos iniciales) no hay nada que revalidar.
  }

  const aviso = process.env.AVISO_PUBLICAR
  if (aviso) {
    // Si ya hay un armado en espera, Cloudflare no crea otro: no hace falta esperar aquí.
    fetch(aviso, { method: 'POST' }).catch((error) => {
      console.error('No se pudo avisar a Cloudflare para volver a armar la página.', error)
    })
  }
}

type ConEstado = { _status?: 'draft' | 'published' | null } | null | undefined

/** Guardar un borrador no cambia la página, salvo que antes estuviera publicado. */
const soloBorrador = (doc: ConEstado, anterior: ConEstado) =>
  doc?._status === 'draft' && anterior?._status !== 'published'

export const revalidarAlCambiar: CollectionAfterChangeHook = ({ doc, previousDoc }) => {
  if (!soloBorrador(doc, previousDoc)) revalidarSitio()
  return doc
}

export const revalidarAlBorrar: CollectionAfterDeleteHook = ({ doc }) => {
  revalidarSitio()
  return doc
}

export const revalidarGlobal: GlobalAfterChangeHook = ({ doc, previousDoc }) => {
  if (!soloBorrador(doc, previousDoc)) revalidarSitio()
  return doc
}
