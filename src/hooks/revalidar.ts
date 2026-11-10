import { revalidatePath } from 'next/cache'
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
} from 'payload'

/** Vuelve a armar la página pública cuando el cliente publica o borra algo en el panel. */
function revalidarSitio(): void {
  try {
    revalidatePath('/', 'layout')
  } catch {
    // Fuera de Next.js (por ejemplo, al cargar los datos iniciales) no hay nada que revalidar.
  }
}

export const revalidarAlCambiar: CollectionAfterChangeHook = ({ doc }) => {
  revalidarSitio()
  return doc
}

export const revalidarAlBorrar: CollectionAfterDeleteHook = ({ doc }) => {
  revalidarSitio()
  return doc
}

export const revalidarGlobal: GlobalAfterChangeHook = ({ doc }) => {
  revalidarSitio()
  return doc
}
