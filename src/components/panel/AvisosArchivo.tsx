'use client'

import { useFormFields } from '@payloadcms/ui'
import { useEffect, useState } from 'react'

import { type Aviso, revisarFoto, revisarVideo } from '@/lib/revisarArchivo'

import estilos from './panel.module.css'

const TITULOS: Record<Aviso['nivel'], string> = {
  bien: 'Todo bien.',
  ojo: 'Ojo:',
  grave: 'Atención:',
}

/**
 * Aparece en la ficha de cada archivo. Al elegir una foto o un video (o al abrir uno ya subido)
 * revisa su tamaño, su peso y su duración, y explica si algo no cumple lo recomendado.
 * Solo avisa: el archivo se puede guardar igual.
 */
export function AvisosArchivo() {
  const archivo = useFormFields(([campos]) => campos.file?.value) as File | undefined
  const tipoGuardado = useFormFields(([campos]) => campos.mimeType?.value) as string | undefined
  const ancho = useFormFields(([campos]) => campos.width?.value) as number | undefined
  const alto = useFormFields(([campos]) => campos.height?.value) as number | undefined
  const peso = useFormFields(([campos]) => campos.filesize?.value) as number | undefined
  const url = useFormFields(([campos]) => campos.url?.value) as string | undefined
  const [avisos, setAvisos] = useState<Aviso[]>([])

  useEffect(() => {
    let vigente = true
    const mostrar = (lista: Aviso[]) => {
      if (vigente) setAvisos(lista)
    }
    const nuevo = typeof File !== 'undefined' && archivo instanceof File ? archivo : undefined
    const tipo = nuevo?.type || tipoGuardado || ''

    if (tipo.startsWith('image/')) {
      if (nuevo) {
        createImageBitmap(nuevo)
          .then((imagen) => {
            mostrar(revisarFoto({ ancho: imagen.width, alto: imagen.height }))
            imagen.close()
          })
          .catch(() => mostrar([]))
      } else if (ancho && alto) {
        mostrar(revisarFoto({ ancho, alto }))
      } else {
        mostrar([])
      }
      return () => {
        vigente = false
      }
    }

    if (tipo.startsWith('video/')) {
      const fuente = nuevo ? URL.createObjectURL(nuevo) : url
      const pesoTotal = nuevo?.size ?? peso
      if (!fuente || !pesoTotal) {
        mostrar([])
        return () => {
          vigente = false
        }
      }
      // Se lee solo la información del video (medidas y duración), sin descargarlo completo.
      const video = document.createElement('video')
      video.preload = 'metadata'
      video.muted = true
      video.onloadedmetadata = () =>
        mostrar(
          revisarVideo({
            ancho: video.videoWidth,
            alto: video.videoHeight,
            duracion: video.duration,
            peso: pesoTotal,
          }),
        )
      video.onerror = () => mostrar([])
      video.src = fuente
      return () => {
        vigente = false
        video.removeAttribute('src')
        video.load()
        if (nuevo) URL.revokeObjectURL(fuente)
      }
    }

    mostrar([])
    return () => {
      vigente = false
    }
  }, [archivo, tipoGuardado, ancho, alto, peso, url])

  if (avisos.length === 0) return null

  return (
    <div className={estilos.avisos} role="status">
      {avisos.map((aviso) => (
        <p key={aviso.texto} className={`${estilos.aviso} ${estilos[aviso.nivel]}`}>
          <strong>{TITULOS[aviso.nivel]}</strong> {aviso.texto}
        </p>
      ))}
    </div>
  )
}
