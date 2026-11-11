/**
 * Cloudflare: entrega las fotos y videos de /api/media/ por pedazos ("rangos"), que el
 * iPhone necesita para reproducir video. Solo se usa mientras los archivos van junto a la
 * página (sin R2); R2 ya los entrega así. Lo publica scripts/publicar-pagina.mjs.
 */
const rangos = {
  async fetch(peticion, env) {
    const respuesta = await env.ASSETS.fetch(peticion)
    if (respuesta.status !== 200) return respuesta

    const rango = /^bytes=(\d*)-(\d*)$/.exec(peticion.headers.get('range')?.trim() ?? '')
    if (!rango) {
      const cabeceras = new Headers(respuesta.headers)
      cabeceras.set('accept-ranges', 'bytes')
      return new Response(respuesta.body, { status: 200, headers: cabeceras })
    }

    const datos = await respuesta.arrayBuffer()
    const total = datos.byteLength
    let inicio = Number(rango[1])
    let fin = rango[2] === '' ? total - 1 : Math.min(Number(rango[2]), total - 1)
    if (rango[1] === '') {
      inicio = Math.max(0, total - Number(rango[2]))
      fin = total - 1
    }
    if (inicio > fin || inicio >= total) {
      return new Response(null, { status: 416, headers: { 'content-range': `bytes */${total}` } })
    }

    const cabeceras = new Headers(respuesta.headers)
    cabeceras.set('accept-ranges', 'bytes')
    cabeceras.set('content-range', `bytes ${inicio}-${fin}/${total}`)
    cabeceras.set('content-length', String(fin - inicio + 1))
    return new Response(datos.slice(inicio, fin + 1), { status: 206, headers: cabeceras })
  },
}

export default rangos
