import config from '@payload-config'
import type { Metadata } from 'next'
import { headers as leerCabeceras } from 'next/headers'
import Link from 'next/link'
import { getPayload } from 'payload'

import { VistaPreviaTrabajo } from '@/components/VistaPreviaTrabajo'
import type { Trabajo } from '@/payload-types'

// Siempre al día y nunca guardada: muestra borradores.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Vista previa',
  robots: { index: false, follow: false },
}

/**
 * Vista previa de un trabajo, como se verá en la página, incluso si todavía es borrador.
 * El panel la muestra al lado del formulario y se actualiza mientras se escribe.
 * Solo funciona con la sesión del panel abierta.
 */
export default async function VistaPrevia({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const { id } = await searchParams
  const cabeceras = await leerCabeceras()
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: cabeceras })

  if (!user) {
    return (
      <main className="grid min-h-svh place-items-center px-5 text-center">
        <div>
          <p className="font-display text-4xl">Vista previa</p>
          <p className="text-gris mt-4">Solo se puede ver con la sesión del panel abierta.</p>
          <Link href="/admin" className="mt-6 inline-block underline underline-offset-4">
            Entrar al panel
          </Link>
        </div>
      </main>
    )
  }

  let trabajo: Trabajo | null = null
  if (id && /^\d+$/.test(id)) {
    try {
      trabajo = await payload.findByID({
        collection: 'trabajos',
        id: Number(id),
        draft: true,
        depth: 1,
        overrideAccess: false,
        user,
      })
    } catch {
      trabajo = null
    }
  }

  const host = cabeceras.get('x-forwarded-host') ?? cabeceras.get('host') ?? 'localhost:3000'
  const protocolo =
    cabeceras.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https')

  return <VistaPreviaTrabajo inicial={trabajo} servidor={`${protocolo}://${host}`} />
}
