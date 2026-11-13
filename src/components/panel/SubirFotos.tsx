import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter } from '@payloadcms/ui'
import { redirect } from 'next/navigation'
import type { AdminViewServerProps } from 'payload'

import { ordenarPorClave } from '@/lib/mapeo'

import { SubirFotosCliente } from './SubirFotosCliente'

/** Página del panel para subir muchas fotos de una vez: un trabajo por cada foto. */
export async function SubirFotos({ initPageResult, params, searchParams }: AdminViewServerProps) {
  const { req, locale, permissions, visibleEntities } = initPageResult
  const admin = req.payload.config.routes.admin

  // Las páginas propias del panel no piden sesión solas: se revisa aquí.
  if (!req.user) redirect(`${admin}/login?redirect=${encodeURIComponent(`${admin}/subir-fotos`)}`)

  const { docs } = await req.payload.find({
    collection: 'categorias',
    depth: 0,
    limit: 100,
    joins: false,
    req,
  })
  const categorias = ordenarPorClave(
    [...docs].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0)),
    (c) => c._order,
  ).map((c) => ({ id: c.id, nombre: c.nombre }))

  return (
    <DefaultTemplate
      i18n={req.i18n}
      locale={locale}
      params={params}
      payload={req.payload}
      permissions={permissions}
      req={req}
      searchParams={searchParams}
      user={req.user}
      visibleEntities={visibleEntities}
    >
      <Gutter>
        <SubirFotosCliente
          categorias={categorias}
          rutaAdmin={admin}
          rutaApi={`${req.payload.config.serverURL}${req.payload.config.routes.api}`}
        />
      </Gutter>
    </DefaultTemplate>
  )
}
