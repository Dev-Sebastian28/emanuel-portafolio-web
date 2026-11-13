import { Button } from '@payloadcms/ui'
import type { Payload } from 'payload'

import estilos from './panel.module.css'

/** Aparece encima de la lista de trabajos y lleva a "Subir varias fotos". */
export function BotonSubirFotos({ payload }: { payload: Payload }) {
  const admin = payload.config.routes.admin
  return (
    <div className={estilos.barra}>
      <p>
        ¿Varias fotos de un mismo evento? Se pueden subir todas de una vez y se crea un trabajo por
        cada una.
      </p>
      <Button
        el="link"
        url={`${admin}/subir-fotos`}
        buttonStyle="secondary"
        size="medium"
        margin={false}
      >
        Subir varias fotos
      </Button>
    </div>
  )
}
