/* Barrita arriba al centro para pasar de una entrada a otra del catálogo.
   Para agregar una opción nueva: sumarla a esta lista y a index.html. */
(() => {
  const OPCIONES = [
    { archivo: 'entrada-visor.html', nombre: 'Visor de grabación' },
    { archivo: 'entrada-ventana.html', nombre: 'El nombre como ventana' },
    { archivo: 'entrada-revelado.html', nombre: 'Revelado' },
    { archivo: 'entrada-contactos.html', nombre: 'Hoja de contactos' },
  ]
  const actual = location.pathname.split('/').pop()
  const i = OPCIONES.findIndex((o) => o.archivo === actual)
  if (i < 0) return
  const ant = OPCIONES[(i - 1 + OPCIONES.length) % OPCIONES.length]
  const sig = OPCIONES[(i + 1) % OPCIONES.length]

  const estilo = document.createElement('style')
  estilo.textContent = `
  .cat-nav{position:fixed;z-index:90;left:50%;top:calc(12px + env(safe-area-inset-top,0px));transform:translateX(-50%);
    display:flex;align-items:center;gap:2px;padding:3px;border-radius:999px;background:rgba(255,255,255,.94);color:#0b0b0b;
    box-shadow:0 1px 12px rgba(0,0,0,.13);font:500 12px/1 'Instrument Sans',system-ui,sans-serif;white-space:nowrap}
  .cat-nav a{display:flex;align-items:center;justify-content:center;min-width:30px;height:30px;padding:0 10px;border-radius:999px;color:inherit;text-decoration:none}
  .cat-nav a:hover{background:#f3f3f1}
  .cat-nav span{padding:0 4px;color:#6b6b6b}
  @media(max-width:600px){.cat-nav .nombre{display:none}.cat-nav a{padding:0 8px}}`
  document.head.append(estilo)

  const nav = document.createElement('nav')
  nav.className = 'cat-nav'
  nav.setAttribute('aria-label', 'Catálogo de entradas')
  nav.innerHTML =
    `<a href="index.html">Catálogo</a>` +
    `<a href="${ant.archivo}" aria-label="Anterior: ${ant.nombre}">←</a>` +
    `<span>${i + 1}/${OPCIONES.length}<b class="nombre" style="font-weight:500"> · ${OPCIONES[i].nombre}</b></span>` +
    `<a href="${sig.archivo}" aria-label="Siguiente: ${sig.nombre}">→</a>`
  document.body.append(nav)
})()
