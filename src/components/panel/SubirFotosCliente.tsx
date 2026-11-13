'use client'

import { Button, toast, useStepNav } from '@payloadcms/ui'
import { useEffect, useRef, useState } from 'react'

import { type Aviso, pesoLegible, revisarFoto } from '@/lib/revisarArchivo'

import estilos from './panel.module.css'

type Categoria = { id: number; nombre: string }

type Estado = 'espera' | 'subiendo' | 'listo' | 'error'

type Foto = {
  clave: string
  archivo: File
  vista: string
  medida?: string
  avisos: Aviso[]
  estado: Estado
  mensaje?: string
  idTrabajo?: number
}

const FORMATOS = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']

const TEXTO_ESTADO: Record<Estado, string> = {
  espera: 'Lista para subir',
  subiendo: 'Subiendo…',
  listo: 'Subida ✓',
  error: 'No se subió',
}

/** Explica por qué una foto no se puede subir y qué hacer. */
function porQueNo(archivo: File): string {
  const extension = archivo.name.split('.').pop()?.toLowerCase() ?? ''
  if (['heic', 'heif'].includes(extension)) {
    return `«${archivo.name}» es .HEIC (formato del iPhone). Hay que convertirla a JPG en calidad máxima.`
  }
  if (archivo.type.startsWith('video/')) {
    return `«${archivo.name}» es un video. Aquí solo van fotos; los videos se suben creando un trabajo de tipo «Video corto».`
  }
  return `«${archivo.name}» no es una foto compatible. Se aceptan JPG, PNG, WEBP o AVIF.`
}

type RespuestaConError = {
  errors?: { message?: string; data?: { errors?: { message?: string }[] } }[]
}

/** Convierte la respuesta de error del servidor en una explicación clara. */
function mensajeDeError(respuesta: RespuestaConError | null, estado: number): string {
  const error = respuesta?.errors?.[0]
  const deCampos = error?.data?.errors?.map((e) => e.message).filter(Boolean) ?? []
  if (deCampos.length) return deCampos.join(' ')
  if (estado === 401 || estado === 403) {
    return 'La sesión del panel se cerró. Hay que volver a entrar y darle «Reintentar».'
  }
  if (estado === 413) return 'La foto pesa demasiado para subirla. Conviene exportarla de nuevo.'
  if (error?.message) return error.message
  return 'No se pudo subir. Hay que intentarlo de nuevo en un momento.'
}

async function leerJson(respuesta: Response) {
  try {
    return await respuesta.json()
  } catch {
    return null
  }
}

export function SubirFotosCliente({
  categorias,
  rutaAdmin,
  rutaApi,
}: {
  categorias: Categoria[]
  rutaAdmin: string
  rutaApi: string
}) {
  const { setStepNav } = useStepNav()
  const selector = useRef<HTMLInputElement>(null)
  const [categoria, setCategoria] = useState(categorias[0] ? String(categorias[0].id) : '')
  const [titulo, setTitulo] = useState('')
  const [lugar, setLugar] = useState('')
  const [fecha, setFecha] = useState('')
  const [publicar, setPublicar] = useState(false)
  const [fotos, setFotos] = useState<Foto[]>([])
  const [rechazadas, setRechazadas] = useState<string[]>([])
  const [faltan, setFaltan] = useState<string[]>([])
  const [arrastrando, setArrastrando] = useState(false)
  const [subiendo, setSubiendo] = useState(false)

  useEffect(() => {
    setStepNav([{ label: 'Subir varias fotos' }])
  }, [setStepNav])

  // Si se intenta cerrar la pestaña en plena subida, el navegador pregunta antes.
  useEffect(() => {
    if (!subiendo) return
    const avisar = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', avisar)
    return () => window.removeEventListener('beforeunload', avisar)
  }, [subiendo])

  const cambiar = (clave: string, cambios: Partial<Foto>) =>
    setFotos((lista) => lista.map((f) => (f.clave === clave ? { ...f, ...cambios } : f)))

  function agregar(archivos: FileList | File[]) {
    const nuevas: Foto[] = []
    const malas: string[] = []
    for (const archivo of Array.from(archivos)) {
      if (!FORMATOS.includes(archivo.type)) {
        malas.push(porQueNo(archivo))
        continue
      }
      nuevas.push({
        clave: `${archivo.name}-${archivo.size}-${archivo.lastModified}-${Math.random()}`,
        archivo,
        vista: URL.createObjectURL(archivo),
        avisos: [],
        estado: 'espera',
      })
    }
    setRechazadas(malas)
    setFotos((lista) => [...lista, ...nuevas])
    for (const foto of nuevas) {
      createImageBitmap(foto.archivo)
        .then((imagen) => {
          cambiar(foto.clave, {
            medida: `${imagen.width} × ${imagen.height} px`,
            avisos: revisarFoto({ ancho: imagen.width, alto: imagen.height }).filter(
              (a) => a.nivel !== 'bien',
            ),
          })
          imagen.close()
        })
        .catch(() => undefined)
    }
  }

  function quitar(foto: Foto) {
    URL.revokeObjectURL(foto.vista)
    setFotos((lista) => lista.filter((f) => f.clave !== foto.clave))
  }

  function empezarDeNuevo() {
    fotos.forEach((f) => URL.revokeObjectURL(f.vista))
    setFotos([])
    setRechazadas([])
  }

  const tituloDe = (indice: number) =>
    fotos.length > 1 ? `${titulo.trim()} · ${indice + 1}` : titulo.trim()

  async function subirUna(foto: Foto, indice: number) {
    cambiar(foto.clave, { estado: 'subiendo', mensaje: undefined })
    const nombre = tituloDe(indice)
    try {
      // 1. La foto va a "Archivos". Ahí se crean sus tamaños y se le borra el GPS.
      const datos = new FormData()
      datos.append('file', foto.archivo)
      datos.append('_payload', JSON.stringify({ alt: nombre }))
      const subida = await fetch(`${rutaApi}/media`, {
        method: 'POST',
        body: datos,
        credentials: 'include',
      })
      const archivo = await leerJson(subida)
      if (!subida.ok) throw new Error(mensajeDeError(archivo, subida.status))
      const idArchivo = archivo?.doc?.id

      // 2. Se crea el trabajo con esa foto.
      const creado = await fetch(`${rutaApi}/trabajos${publicar ? '' : '?draft=true'}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: nombre,
          categoria: Number(categoria),
          tipo: 'foto',
          foto: idArchivo,
          lugar: lugar.trim() || undefined,
          fecha: fecha ? `${fecha}T12:00:00.000Z` : undefined,
          _status: publicar ? 'published' : 'draft',
        }),
      })
      const trabajo = await leerJson(creado)
      if (!creado.ok) {
        // Si el trabajo no se pudo crear, no se deja la foto suelta en "Archivos".
        await fetch(`${rutaApi}/media/${idArchivo}`, {
          method: 'DELETE',
          credentials: 'include',
        }).catch(() => undefined)
        throw new Error(mensajeDeError(trabajo, creado.status))
      }
      cambiar(foto.clave, { estado: 'listo', idTrabajo: trabajo?.doc?.id })
      return true
    } catch (error) {
      const mensaje =
        error instanceof TypeError
          ? 'Se cortó la conexión mientras subía. Hay que revisar el internet y darle «Reintentar».'
          : error instanceof Error
            ? error.message
            : 'No se pudo subir.'
      cambiar(foto.clave, { estado: 'error', mensaje })
      return false
    }
  }

  async function subirTodas() {
    const pendientes: string[] = []
    if (!categoria) pendientes.push('Falta elegir la categoría.')
    if (!titulo.trim()) {
      pendientes.push('Falta el título: es el nombre que sale debajo de cada foto en la galería.')
    }
    if (fotos.length === 0) pendientes.push('Faltan las fotos.')
    setFaltan(pendientes)
    if (pendientes.length) return

    setSubiendo(true)
    let bien = 0
    let mal = 0
    // De a una, para no saturar el servidor ni la conexión.
    for (const [indice, foto] of fotos.entries()) {
      if (foto.estado === 'listo') continue
      if (await subirUna(foto, indice)) bien++
      else mal++
    }
    setSubiendo(false)

    if (mal === 0) {
      toast.success(
        `Listo: ${bien} ${bien === 1 ? 'trabajo creado' : 'trabajos creados'}${
          publicar ? ' y publicados' : ' como borrador'
        }.`,
      )
    } else {
      toast.error(
        `${mal} ${mal === 1 ? 'foto no se subió' : 'fotos no se subieron'}. Abajo dice por qué.`,
      )
    }
  }

  const listas = fotos.filter((f) => f.estado === 'listo').length
  const conError = fotos.filter((f) => f.estado === 'error').length
  const terminado = fotos.length > 0 && !subiendo && listas === fotos.length
  const nombreCategoria = categorias.find((c) => String(c.id) === categoria)?.nombre

  if (categorias.length === 0) {
    return (
      <div className={estilos.subir}>
        <h1>Subir varias fotos</h1>
        <p className={estilos.ayuda}>
          Primero hay que crear al menos una categoría (por ejemplo «Bodas»): cada foto se vuelve un
          trabajo dentro de una categoría.
        </p>
        <Button el="link" url={`${rutaAdmin}/collections/categorias/create`} buttonStyle="primary">
          Crear una categoría
        </Button>
      </div>
    )
  }

  return (
    <div className={estilos.subir}>
      <h1>Subir varias fotos</h1>
      <p className={estilos.ayuda}>
        Se crea un trabajo por cada foto, todos en la misma categoría y con el mismo título,
        numerados. Después se puede abrir cada uno para cambiarle lo que haga falta. Las fotos van
        en JPG, calidad máxima, de 3.000 a 4.000 px en el lado largo; al subirlas se les borra la
        ubicación GPS.
      </p>

      <div className={estilos.formulario}>
        <div className={estilos.campo}>
          <label htmlFor="sf-categoria">Categoría</label>
          <select
            id="sf-categoria"
            value={categoria}
            disabled={subiendo}
            onChange={(e) => setCategoria(e.target.value)}
          >
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
          <small>La galería donde van a salir las fotos.</small>
        </div>

        <div className={estilos.campo}>
          <label htmlFor="sf-titulo">Título</label>
          <input
            id="sf-titulo"
            value={titulo}
            disabled={subiendo}
            placeholder="Boda de Laura y Andrés"
            onChange={(e) => setTitulo(e.target.value)}
          />
          <small>
            Sale debajo de cada foto. Con varias, se numeran: «{titulo.trim() || 'Título'} · 1», «·
            2»…
          </small>
        </div>

        <div className={estilos.campo}>
          <label htmlFor="sf-lugar">Lugar o cliente (opcional)</label>
          <input
            id="sf-lugar"
            value={lugar}
            disabled={subiendo}
            placeholder="Hacienda El Noviciado, Cota"
            onChange={(e) => setLugar(e.target.value)}
          />
          <small>Sale al lado de la fecha, debajo del título.</small>
        </div>

        <div className={estilos.campo}>
          <label htmlFor="sf-fecha">Fecha del evento (opcional)</label>
          <input
            id="sf-fecha"
            type="date"
            value={fecha}
            disabled={subiendo}
            onChange={(e) => setFecha(e.target.value)}
          />
          <small>Sale como mes y año, por ejemplo «noviembre de 2026».</small>
        </div>

        <label className={estilos.casilla}>
          <input
            type="checkbox"
            checked={publicar}
            disabled={subiendo}
            onChange={(e) => setPublicar(e.target.checked)}
          />
          <span>
            <strong>Publicar de una vez</strong>
            <br />
            <small>
              Si no se marca, quedan como borrador: no se ven en la página hasta abrir cada una y
              darle «Publicar cambios».
            </small>
          </span>
        </label>
      </div>

      <button
        type="button"
        className={`${estilos.zona} ${arrastrando ? estilos.zonaActiva : ''}`}
        disabled={subiendo}
        onClick={() => selector.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setArrastrando(true)
        }}
        onDragLeave={() => setArrastrando(false)}
        onDrop={(e) => {
          e.preventDefault()
          setArrastrando(false)
          if (!subiendo) agregar(e.dataTransfer.files)
        }}
      >
        <strong>Arrastrar las fotos aquí</strong>
        <span>o hacer clic para elegirlas (JPG, PNG, WEBP o AVIF)</span>
      </button>
      <input
        ref={selector}
        type="file"
        accept={FORMATOS.join(',')}
        multiple
        hidden
        onChange={(e) => {
          if (e.target.files) agregar(e.target.files)
          e.target.value = ''
        }}
      />

      {rechazadas.length > 0 && (
        <div className={estilos.avisos} role="alert">
          {rechazadas.map((texto) => (
            <p key={texto} className={`${estilos.aviso} ${estilos.grave}`}>
              <strong>No se agregó:</strong> {texto}
            </p>
          ))}
        </div>
      )}

      {fotos.length > 0 && (
        <ul className={estilos.lista}>
          {fotos.map((foto, indice) => (
            <li key={foto.clave} className={estilos.fila}>
              {/* eslint-disable-next-line @next/next/no-img-element -- vista previa local de la foto elegida */}
              <img src={foto.vista} alt="" />
              <div>
                <p className={estilos.nombre}>
                  {titulo.trim() ? tituloDe(indice) : foto.archivo.name}
                </p>
                <p className={estilos.detalle}>
                  {foto.archivo.name} · {pesoLegible(foto.archivo.size)}
                  {foto.medida ? ` · ${foto.medida}` : ''}
                </p>
                {foto.avisos.map((aviso) => (
                  <p
                    key={aviso.texto}
                    className={`${estilos.notaFila} ${aviso.nivel === 'grave' ? estilos.estadoError : ''}`}
                  >
                    {aviso.texto}
                  </p>
                ))}
                {foto.mensaje && (
                  <p className={`${estilos.notaFila} ${estilos.estadoError}`}>{foto.mensaje}</p>
                )}
              </div>
              <div className={estilos.acciones}>
                <span
                  className={`${estilos.estado} ${
                    foto.estado === 'listo'
                      ? estilos.estadoListo
                      : foto.estado === 'error'
                        ? estilos.estadoError
                        : ''
                  }`}
                >
                  {TEXTO_ESTADO[foto.estado]}
                </span>
                {foto.estado === 'listo' && foto.idTrabajo && (
                  <a href={`${rutaAdmin}/collections/trabajos/${foto.idTrabajo}`}>Abrir</a>
                )}
                {(foto.estado === 'espera' || foto.estado === 'error') && !subiendo && (
                  <Button
                    buttonStyle="subtle"
                    size="small"
                    margin={false}
                    onClick={() => quitar(foto)}
                  >
                    Quitar
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {faltan.length > 0 && (
        <div className={estilos.avisos} role="alert">
          {faltan.map((texto) => (
            <p key={texto} className={`${estilos.aviso} ${estilos.grave}`}>
              {texto}
            </p>
          ))}
        </div>
      )}

      {terminado && (
        <p className={estilos.resumen}>
          Listo: {listas} {listas === 1 ? 'trabajo creado' : 'trabajos creados'} en «
          {nombreCategoria}»{publicar ? ' y publicados.' : ' como borrador.'} Los nuevos salen de
          primeros en la galería; el orden se cambia arrastrando dentro de la categoría.
        </p>
      )}

      <div className={estilos.acciones}>
        {!terminado && (
          <Button
            buttonStyle="primary"
            margin={false}
            disabled={subiendo || fotos.length === 0}
            onClick={subirTodas}
          >
            {subiendo
              ? `Subiendo ${listas + 1} de ${fotos.length}…`
              : conError
                ? `Reintentar (${conError})`
                : `Subir ${fotos.length || ''} ${fotos.length === 1 ? 'foto' : 'fotos'}`}
          </Button>
        )}
        {terminado && (
          <>
            <Button
              el="link"
              url={`${rutaAdmin}/collections/categorias/${categoria}`}
              buttonStyle="primary"
              margin={false}
            >
              Ver y ordenar en «{nombreCategoria}»
            </Button>
            <Button buttonStyle="secondary" margin={false} onClick={empezarDeNuevo}>
              Subir más fotos
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
