# Emanuel — Portafolio web

Portafolio premium para Emanuel Fonseca, videógrafo y productor audiovisual. Se trabaja
en código (no Webflow, Framer ni constructores visuales). Lo construyen Sebastian y su
amigo (usuario de Live Share "Ore0999"), que hizo la primera versión en HTML.

## El cliente

- **Nombre:** Emanuel Fonseca. Bogotá, Colombia.
- **Qué hace:** video y producción audiovisual, con experiencia en bodas.
- **Categorías de trabajo (según el código del amigo):** Bodas, 15 años, Eventos. Hay
  una cuarta categoría vacía, por definir.
- **Contacto:** fftemanuel@gmail.com, Instagram https://www.instagram.com/emanuel.fonsecam/
- Su público son parejas, familias y organizadores de eventos, no artistas de
  conciertos. Textos, contacto (WhatsApp) y orden de la página deben pensarse para ellos.

## Código del amigo (respaldo/portafolio-original-amigo.html)

Copia exacta y sin tocar de la primera versión. **No editar este archivo.**

- **Conservar:**
  - Las secciones: entrada con el nombre en grande, galerías por categoría en
    carrusel, sobre él con etiquetas, contacto y visor de galería.
  - La idea de un bloque `CONFIG` con los datos editables; se vuelve el panel de Payload.
  - Los detalles de accesibilidad: etiquetas, Escape cierra el visor y se respeta
    "reducir movimiento".
  - La pantalla de carga con la "E" y la luz que sigue al cursor en la entrada; hay que
    adaptarlas al estilo blanco.
- **Corregir:**
  - Los colores están a medio cambiar: fondo lila grisáceo con letras casi blancas, así
    que los títulos casi no se leen.
  - Quedan restos de la plantilla de conciertos: "Fotografía de conciertos", "Artistas",
    "Film photography", "¿Un show, una gira…?" y textos de relleno en "Acerca de mí".
  - Solo muestra fotos; no maneja videos.
  - La categoría "15 AÑOS" se usa como nombre de carpeta, con espacio y Ñ.
  - El visor muestra la cuadrícula pero no abre una foto en grande.
  - Faltan tildes: "Videografo", "Produccion", "GALERIA".
  - Las imágenes no existen todavía; se ven degradados de relleno.

## Cómo trabajar con Sebastian

- Hablarle en español, de **usted**, con tono cercano ("bro"). Sin jerga técnica.
- Los mensajes para el cliente van en tercera persona, sin "tú" ni "usted".
- Antes de borrar o rehacer algo, guardar primero una copia de seguridad.
- Commits y pull requests sin firma de Claude.
- Este archivo se va actualizando con cada decisión nueva.

## Lo que quiere el cliente

- **Estilo:** fondo blanco, letras negras, minimalista. El color lo ponen las fotos y
  los videos. (La referencia es oscura; en esto **no** se sigue.)
- **Contenido principal:** videos. También fotos.
- **Videos largos:** los sube él a YouTube y pega el link en el panel.
- **Fotos y videos cortos (reels, vistas previas, entrada):** se suben desde el panel
  de la página.
- **Panel propio** para que él suba su contenido sin depender de nadie.
- Precio y fecha de entrega: ya cerrados con el cliente.
- Meta de costos: que la mensualidad sea lo más baja posible, ojalá cero.

**Referencia:** https://juanografoo.com — sirve de inspiración por el nivel (entrada
animada al bajar, galerías limpias, visor de fotos). **No copiar** su concepto ("a
través del lente", "paradas del recorrido") ni su estética oscura: el cliente necesita
una identidad propia.

## Stack decidido

Criterio: tecnologías estándar que cualquier programador conozca, para que la página
se pueda entregar a otro desarrollador sin problema. Nada raro.

| Capa | Herramienta |
|---|---|
| Framework | Next.js (React) |
| Lenguaje | TypeScript |
| Estilos | Tailwind CSS |
| Animaciones | GSAP + ScrollTrigger, Lenis para el desplazamiento suave |
| Panel | Payload CMS, dentro del mismo proyecto |
| Archivos | Almacenamiento tipo S3: Cloudflare R2 |
| Videos largos | YouTube (cargar el reproductor solo al hacer clic, modo privado) |
| Código | Git + GitHub privado; el amigo trabaja desde GitHub |
| Calidad | ESLint + Prettier |
| Página pública | Cloudflare, plan gratis: la página se arma antes de publicarse y se vuelve a armar sola cuando el cliente publica algo en el panel |
| Panel (Payload) | Render, plan gratis |
| Base de datos | PostgreSQL en Neon, plan gratis |

**Decisión de costos (10 nov 2026): por ahora, cero mensualidad.**
- Cloudflare gratis: la página pública. Las visitas a la página no tienen límite.
- Render gratis: solo el panel. Se apaga después de 15 minutos sin uso y tarda cerca de
  1 minuto en volver a abrir. Tiene 512 MB de memoria y 5 GB de tráfico al mes; alcanza
  porque solo lo usa el cliente y los archivos van directo a R2.
- Neon gratis: 1 GB de base de datos, de sobra para textos y datos de los videos.
- R2 gratis hasta 10 GB; después, 0,015 USD por GB al mes. YouTube es gratis.
- Lo único que se paga es el dominio, una vez al año.
- **Para pasar a pago más adelante:** el panel y la página se mudan juntos a Cloudflare
  Workers (5 USD/mes) sin cambiar el código. La base de datos sigue en Neon (PostgreSQL),
  por eso no se usa D1.
- Se descartó Vercel: su plan gratis no permite páginas comerciales.
- Se descartó Supabase: su plan gratis se pausa tras una semana sin uso (hay que
  reactivarlo a mano), solo da 1 GB para archivos y unos 5 GB de descargas al mes, y no
  trae un panel para el cliente. Se retoma solo si algún día hay usuarios registrados
  (venta de presets, zona de clientes).
- Mientras se construye, todo funciona en el computador y no se paga nada.

## Reglas de fotos y videos

**Fotos**
- Se guarda siempre el original. Al subir se crean 5 tamaños en formatos modernos.
- Convertir a sRGB sin alterar colores, borrar la ubicación GPS y permitir marcar el
  punto de enfoque para los recortes.
- Mostrar primero una versión borrosa mínima mientras carga la nítida.
- Avisar si la foto es muy pequeña.
- El cliente exporta en JPG, calidad máxima, lado largo de 3000 a 4000 px, sRGB.

**Videos cortos (subidos a la página)**
- El cliente exporta en MP4 H.264, 1080p, de 8 a 10 Mbps, con sonido AAC y la opción
  "Optimizar para web" activada.
- Video de entrada: 6 a 12 s, en bucle, sin sonido, de 4 a 5 Mbps, en versión
  horizontal y vertical.
- En la página: portada al instante, reproducción sin sonido solo cuando está a la
  vista y con sonido al abrirlo. Los verticales y horizontales van separados.
- Se sube directo al almacenamiento, sin pasar por el servidor.
- Pendiente: dejarle al cliente un ajuste guardado para su programa de edición.

**Videos largos (YouTube)**
- El cliente exporta en 4K (aunque haya grabado en 1080p), de 35 a 45 Mbps.
- Usar portada propia en alta calidad, con el botón de reproducir del diseño.

## Cómo encender el proyecto en local

1. Abrir **Postgres.app** (la base de datos local `emanuel_portafolio` vive ahí).
2. `npm install` (solo la primera vez) y `npm run dev`.
3. Página: http://localhost:3000 · Panel: http://localhost:3000/admin
4. `npm run seed` carga los datos iniciales sin duplicar: datos de la página, las tres
   categorías y un usuario de prueba. El correo y la contraseña de ese usuario están en
   `.env`, que no se sube a GitHub; `.env.example` explica cada variable.
5. Antes de guardar cambios: `npx tsc --noEmit`, `npm run lint` y `npm run build`.

## Cómo está armado

- `src/app/(frontend)/`: la página pública. `page.tsx` arma las secciones y
  `globals.css` tiene los colores y las letras (Tailwind 4, bloque `@theme`).
- `src/app/(payload)/`: el panel y la API de Payload. Lo genera Payload; no se edita a mano.
- `src/collections/`:
  - `Trabajos`: video corto, YouTube o foto, con borradores.
  - `Categorias`: el nombre para el link se crea solo, sin tildes ni eñes.
  - `Media`: crea 5 tamaños webp de cada foto y una versión borrosa.
  - `Users`
- `src/globals/Sitio.ts`: datos de la página (general, entrada, sobre mí, contacto).
- `src/lib/vista.ts`: convierte los datos de Payload en datos simples para los
  componentes. Solo se muestran los trabajos publicados y completos.
- `src/components/`:
  - `Entrada`: el nombre sube palabra por palabra y el video crece al bajar.
  - `Trabajos`: carrusel de categorías.
  - `Galeria`: cuadrícula de trabajos.
  - `Visor`: trabajo en grande, con flechas, deslizar y Escape.
  - `PantallaCarga`: la "E" del diseño original.
  - `ScrollSuave`: Lenis junto con GSAP.
  - `Animaciones`: todo lo marcado con `data-aparecer` aparece al bajar.
- Todo respeta la opción "reducir movimiento" del dispositivo.
- **Letras:** Instrument Serif para títulos y Instrument Sans para el texto. Se sirven
  desde la misma página (`next/font`).
- **Colores:** fondo `#ffffff`, tinta `#0b0b0b`, gris `#6b6b6b`, línea `#e6e6e3` y
  suave `#f3f3f1`.
- Al publicar o borrar algo en el panel, la página se vuelve a armar sola
  (`src/hooks/revalidar.ts`).
- Con las variables `S3_*` llenas, los archivos van a Cloudflare R2 con subida directa
  desde el navegador. Sin ellas, se guardan en `/media`, que no se sube a GitHub.
- La sección "Film photography" del HTML del amigo se quitó porque era de la plantilla
  de conciertos; sigue en `respaldo/`.

## Entrada (animación de inicio)

- **Elegida (10 nov 2026): "visor de grabación".** El nombre en grande, y en el centro un
  recuadro con el video de entrada, como la pantalla de una cámara: esquinas, "REC" que
  titila y un contador de tiempo. Al bajar, el recuadro crece hasta llenar la pantalla.
  El cuadro de enfoque de la cámara sigue al cursor; reemplaza la luz del código del amigo.
- **Catálogo de entradas para comparar:** `prototipos/index.html`. Se abre con
  `node prototipos/servidor.mjs` (http://localhost:4321) o con la configuración
  "prototipos" de `.claude/launch.json`. Usan clips gratis de Mixkit; si se pone un
  `video-prueba.mp4` en esa carpeta, usan ese. Ninguna está todavía en
  `src/components/Entrada.tsx`.
  1. `entrada-visor.html`: visor de grabación (la elegida por ahora).
  2. `entrada-ventana.html`: el video se ve a través de las letras del nombre y al bajar
     se entra por la "E".
  3. `entrada-revelado.html`: la página arranca en blanco y la imagen aparece como una
     foto en el revelado; con el cursor se revela más rápido.
  4. `entrada-contactos.html`: hoja de contactos con fotos de varios eventos, una marcada
     en rojo; al bajar se entra a esa, que es un video. El cursor es una lupa.
  - Para sumar otra opción: crear el archivo y agregarlo en `catalogo.js` e `index.html`.
- **Descartada: cámara que se desarma por piezas.** La referencia ya entra por el lente
  de una cámara ("A través del lente"), así que se vería copiada. Además habla del equipo
  y no del trabajo, y un modelo 3D pesa mucho en celular.
- No hay que grabar nada nuevo: el video de entrada sale del material de bodas que
  Emanuel ya tiene.

## Estado

- [x] Revisión de la referencia y preguntas al cliente (WhatsApp, 16 preguntas)
- [x] Carpeta del proyecto creada
- [x] Guardar el código HTML del amigo tal cual, como punto de partida
- [x] Crear el repositorio local con esa primera versión
- [x] Subir el repositorio a GitHub privado:
      https://github.com/Dev-Sebastian28/emanuel-portafolio-web (cuenta Dev-Sebastian28)
- [ ] Invitar al amigo al repositorio (falta su usuario de GitHub)
- [x] Proyecto Next.js + Payload con la estructura del amigo y el estilo blanco
      minimalista, en la rama `feat/proyecto-nextjs`
- [x] Panel en español: trabajos, categorías, archivos y datos de la página
- [x] Probado en computador y celular: galería, visor, video, YouTube y borradores
- [ ] Contenido real del cliente
- [ ] Publicar

## Pendientes

- Respuestas del cliente: nombre, logo, tres palabras de estilo, categorías y forma de
  contacto.
- Al publicar: crear las cuentas de Cloudflare, Render y Neon a nombre del cliente. R2
  pide una tarjeta registrada aunque no cobre mientras no pase del límite gratis.
- **Definir cómo se publica en dos partes.** Hoy es una sola aplicación de Next.js
  (página y panel). Para el plan gratis hay que separar la página pública, que va
  estática a Cloudflare, del panel, que va a Render, y conectar el aviso de "volver a
  armar" al publicar.
- **Actualizar Node.js.** Payload pide la versión 22.23.4 o más nueva; el Mac tiene la
  22.23.2. Funciona, pero sale una advertencia al instalar.
- **Datos de prueba en la base local.** Hay cuatro trabajos "PRUEBA" en Bodas (tres
  publicados y un borrador) y tres archivos de prueba. Borrarlos antes de cargar el
  contenido real.
- **Número de WhatsApp del cliente.** El botón aparece solo cuando se llena en el panel.
- **Textos entre [corchetes]** en "Sobre mí": pendientes del cliente.
- **Logo:** cambiar el logo de Payload en el panel por el de Emanuel cuando lo haya.
- **Borrar la ubicación GPS de la foto original.** Las versiones que se muestran ya
  salen sin ella.
- **Aviso de foto muy pequeña** al subirla.
- **Ajuste de exportación** para el programa de edición del cliente.
