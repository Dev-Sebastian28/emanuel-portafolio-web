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
- **Orden de la página (pedido del cliente, 10 nov 2026):**
  1. Entrada: el visor de grabación (se trabaja en otra sesión).
  2. Carrusel como el de https://wschupfer.com/new-york/: filas de fotos y videos que se
     mueven solas.
  3. Galería de trabajos por categorías.
  4. Sobre mí.
  5. Contacto.

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

## Base de datos de la página publicada (Neon)

- **Creada el 10 nov 2026** en la cuenta de Neon del proyecto
  (portafolioemanuel42@gmail.com, la misma de Cloudflare), organización "Fonseca", plan
  gratis. Proyecto `emanuel-portafolio` (id `icy-star-33500921`), región Virginia
  (`aws-us-east-1`), PostgreSQL 18, base `emanuel_portafolio`, rama `main`.
- **Solo para la página publicada.** El computador sigue con Postgres.app (`.env`).
  Decisión de Sebastian: su amigo trabaja con su propia base local.
- **Arrancó limpia:** las tres categorías, los datos de la página y un usuario del panel.
  Sin trabajos ni archivos; los "PRUEBA" se quedaron solo en la base local.
- **Datos de acceso en `.env.produccion`**, que no se sube a GitHub: `DATABASE_URL`,
  `PAYLOAD_SECRET` y el usuario del panel publicado (`admin@emanuel.test`, con contraseña
  distinta a la local). Al publicar, esas variables se copian en Render.
- **Las tablas se crean con migraciones** (`src/migrations/`). En el computador Payload
  ajusta la base solo con `npm run dev`; en Neon no. Cada vez que cambie una colección
  o un campo:
  1. `npm run migrate:create nombre-del-cambio` y guardar el archivo nuevo en git.
  2. En la página publicada, `npm run migrate` antes de encender. En Render, el comando
     de inicio es `npm run migrate && npm start`.
- **Nunca usar `npm run dev` contra Neon**, y cualquier otro comando contra Neon va con
  `NODE_ENV=production`: en modo de desarrollo Payload cambia las tablas solo y desordena
  las migraciones. Ejemplo: `set -a; . ./.env.produccion; set +a` y luego
  `NODE_ENV=production npm run seed`.
- No se usa `prodMigrations` de Payload, porque también correría las migraciones en
  `npm run build` contra la base local, que no las usa.
- Para administrar Neon desde la terminal: `npx neonctl` (ya autorizado en este Mac).
- Probado (10 nov 2026): la página armada contra Neon muestra las tres categorías y el
  panel deja entrar con el usuario de `.env.produccion`.

## Cómo está armado

- `src/app/(frontend)/`: la página pública. `page.tsx` arma las secciones y
  `globals.css` tiene los colores y las letras (Tailwind 4, bloque `@theme`).
- `src/app/(payload)/`: el panel y la API de Payload. Lo genera Payload; no se edita a mano.
- `src/collections/`:
  - `Trabajos`: video corto, YouTube o foto, con borradores. La casilla "Mostrar en el
    carrusel" decide qué sale en el carrusel.
  - `Categorias`: el nombre para el link se crea solo, sin tildes ni eñes.
  - `Media`: crea 5 tamaños webp de cada foto y una versión borrosa.
  - `Users`
- `src/globals/Sitio.ts`: datos de la página (general, entrada, sobre mí, contacto).
- `src/lib/vista.ts`: convierte los datos de Payload en datos simples para los
  componentes. Solo se muestran los trabajos publicados y completos.
- `src/components/`:
  - `Entrada`: el nombre sube palabra por palabra y el video crece al bajar.
  - `Carrusel`: la "Selección", cuatro filas de trabajos que se mueven solas, como la
    referencia del cliente. Decisiones de Sebastian (10 nov 2026):
    - Emanuel escoge con la casilla del panel qué trabajos salen (ideal, unos 20).
    - Son cuatro filas, como la referencia.
    - Al tocar un trabajo se abre en el `Visor`, con flechas para pasar a los demás del
      carrusel.

    Cómo funciona:
    - Va hacia la derecha a unos 20 px por segundo y se apura un poco al bajar por la
      página.
    - Se arrastra con el mouse o el dedo, y el cursor encima la detiene.
    - Al pasar el cursor sale el título y la categoría.
    - Con menos de 5 trabajos por fila, cada fila muestra todos en otro orden.
    - Con "reducir movimiento" queda quieta y se desliza a mano.
    - Las medidas de las filas están en `globals.css` (`.carrusel`).
  - `Trabajos`: carrusel de categorías (la galería).
  - `Galeria`: cuadrícula de trabajos.
  - `Medio`: la foto, el video sin sonido o la portada de YouTube de un trabajo en
    miniatura (lo usan `Galeria` y `Carrusel`).
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

## Publicación (página en Cloudflare, panel en Render)

**Página pública:** https://emanuel-fonseca.portafolioemanuel42.workers.dev, en la cuenta
de Cloudflare del proyecto, plan gratis.
- `scripts/publicar-pagina.mjs` la arma como archivos fijos, sin el panel. Usa la última
  versión guardada en git, no los cambios sin guardar.
- Lee el contenido de la base que diga `DATABASE_URL`.
- Con `--publicar`, la sube a Cloudflare.
- Mientras no se ponga `INDEXAR=1`, le pide a Google que no la muestre.
- `next.config.ts` la arma así cuando `EXPORTAR=1`.

**Etapa 1 (10 nov 2026, hecha):** publicada con los datos de prueba de la base del
computador. Las fotos y videos de `/media` van junto a la página.
`scripts/rangos-cloudflare.js` entrega los videos por pedazos, porque Cloudflare no lo
hace solo y el iPhone lo necesita para reproducirlos. Para volver a publicarla desde el
computador: `node scripts/publicar-pagina.mjs --publicar`.

**Etapa 2 (en curso), pedida por Sebastian: página y panel, con datos de prueba.**
- Panel en Render (`render.yaml`, servicio `emanuel-panel`, rama `feat/proyecto-nextjs`).
  Al encender aplica las migraciones en Neon.
- Fotos y videos en R2, en el bucket `emanuel-archivos`. Con `S3_URL_PUBLICA`, la página
  los pide directo a R2 (`src/payload.config.ts`).
- Al publicar algo, el panel avisa a `AVISO_PUBLICAR`, un "deploy hook" de Cloudflare
  (`src/hooks/revalidar.ts`). Cloudflare vuelve a armar la página desde GitHub con los
  datos de Neon. Guardar un borrador no la vuelve a armar.
- Los datos de prueba se copian a Neon y R2, para que página y panel muestren lo mismo.
  Se borran antes de cargar el contenido real.
- Pasos de Sebastian, porque piden tarjeta, cuentas o claves:
  1. Activar R2 (pide tarjeta).
  2. Crear la clave de R2 y pegarla en `.env.produccion`.
  3. Crear la cuenta de Render y el servicio desde `render.yaml`.
  4. Conectar el repositorio al Worker `emanuel-fonseca` en Cloudflare y crear el
     deploy hook.
- Las claves de la página publicada viven en `.env.produccion`, que no se sube a GitHub.

## Google (SEO, Analytics y Search Console)

Decisiones de Sebastian (16 nov 2026):
- Cada categoría tiene su propia página (…/bodas, …/15-anos).
- Emanuel ofrece video y fotografía.
- La zona es Bogotá y alrededores: Chía, Cajicá, Cota, La Calera, Sopó y otros (`ZONA`
  en `src/lib/seo.ts`).
- Google se activa cuando esté el dominio propio.

Lo que ya está:
- `src/lib/seo.ts` tiene los títulos y descripciones, la ficha del negocio para Google
  (schema.org) y la ruta de cada categoría.
- La ficha va en la página principal; cada categoría lleva su ruta (Inicio > Bodas).
- Cada página tiene su dirección oficial (canonical) y la imagen que se ve al compartir
  el link.
- La página de cada categoría es `src/app/(frontend)/[categoria]/page.tsx`. Las tarjetas
  de la galería llevan a ella.
- `src/app/sitemap.ts` hace la lista de páginas para Google. `src/app/robots.ts` dice qué
  puede revisar Google.
- `src/components/Analitica.tsx` es Google Analytics. Se activa con `NEXT_PUBLIC_GA_ID`.
- Search Console se verifica con `NEXT_PUBLIC_GOOGLE_VERIFICACION`.
- Las letras están guardadas en `src/fonts` (licencia libre OFL), sin pedirlas a Google.
  El 16 nov 2026 este Mac no podía conectarse a fonts.googleapis.com y el armado fallaba.

Para activarlo, cuando esté el dominio:
1. En la página publicada, `NEXT_PUBLIC_SERVER_URL` debe ser el dominio y se pone
   `INDEXAR=1`. Mientras no esté `INDEXAR=1`, robots y `_headers` le piden a Google que
   no entre.
2. Crear la propiedad de Analytics con la cuenta del proyecto y poner su código en
   `NEXT_PUBLIC_GA_ID`.
3. Crear la propiedad de dominio en Search Console (se verifica en Cloudflare, por DNS) y
   enviar `sitemap.xml`.
4. Pendiente: escribirle al cliente la guía para crear su Perfil de Empresa en Google y
   pedir reseñas.
5. Revisar en el panel los nombres de las categorías: "Vehiculos" va sin tilde.

## Entrada (animación de inicio)

- **Elegida (10 nov 2026): "visor de grabación".** El nombre en grande, y en el centro un
  recuadro con el video de entrada, como la pantalla de una cámara: esquinas, "REC" que
  titila y un contador de tiempo. Al bajar, el recuadro crece hasta llenar la pantalla.
  El cuadro de enfoque de la cámara sigue al cursor; reemplaza la luz del código del amigo.
- **Ya está en la página real (16 nov 2026):** `src/components/Entrada.tsx`, con los
  estilos en `globals.css` (`.visor`). Usa el video de entrada del panel (horizontal y
  vertical) y, al llenar la pantalla, muestra los nombres de las categorías. La entrada
  anterior quedó en `respaldo/Entrada-anterior.tsx`.
- **Catálogo de entradas para comparar:** `prototipos/index.html`. Se abre con
  `node prototipos/servidor.mjs` (http://localhost:4321) o con la configuración
  "prototipos" de `.claude/launch.json`. Usan clips gratis de Mixkit; si se pone un
  `video-prueba.mp4` en esa carpeta, usan ese.
  1. `entrada-visor.html`: visor de grabación (la elegida por ahora).
  2. `entrada-ventana.html`: el video se ve a través de las letras del nombre y al bajar
     se entra por la "E".
  3. `entrada-revelado.html`: la página arranca en blanco y la imagen aparece como una
     foto en el revelado; con el cursor se revela más rápido.
  4. `entrada-contactos.html`: hoja de contactos con fotos de varios eventos, una marcada
     en rojo; al bajar se entra a esa, que es un video. El cursor es una lupa.
  - Para sumar otra opción: crear el archivo y agregarlo en `catalogo.js` e `index.html`.
  - **En línea (10 nov 2026):** https://emanuel-entradas.portafolioemanuel42.workers.dev,
    en la cuenta de Cloudflare del proyecto (portafolioemanuel42@gmail.com), plan gratis.
    Para actualizarlo: `npx wrangler@4 deploy` desde `prototipos/`
    (`prototipos/wrangler.jsonc`). No se publican `servidor.mjs` ni `video-prueba.mp4`
    (`.assetsignore`), y `_headers` pide a Google que no la muestre.
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
- [x] Base de datos de la página publicada creada en Neon y probada
- [ ] Contenido real del cliente
- [ ] Publicar

## Pendientes

- Respuestas del cliente: nombre, logo, tres palabras de estilo, categorías y forma de
  contacto.
- Al publicar: crear la cuenta de Render. Cloudflare y Neon ya están en la cuenta del
  proyecto (portafolioemanuel42@gmail.com); falta decidir si se le entrega esa cuenta al
  cliente o se pasa todo a una suya. R2 pide una tarjeta registrada aunque no cobre
  mientras no pase del límite gratis.
- **Google: falta activarlo con el dominio** (ver "Google").
- **Terminar la etapa 2 de la publicación** (ver "Publicación"): faltan R2, Render y el
  aviso de Cloudflare.
- **Actualizar Node.js.** Payload pide la versión 22.23.4 o más nueva; el Mac tiene la
  22.23.2. Funciona, pero sale una advertencia al instalar.
- **Datos de prueba en la base local.** Hay cuatro trabajos "PRUEBA" en Bodas (tres
  publicados y un borrador) y tres archivos de prueba. Borrarlos antes de cargar el
  contenido real. Los cuatro están marcados con "Mostrar en el carrusel" para probarlo.
- **Carrusel en la base publicada (Neon).** La casilla nueva necesita el cambio
  `src/migrations/20261111_032630_carrusel.ts`. Se aplica con `npm run migrate` al
  publicar, como dice "Base de datos de la página publicada". Todavía no se ha aplicado
  en Neon.
- **Número de WhatsApp del cliente.** El botón aparece solo cuando se llena en el panel.
- **Textos entre [corchetes]** en "Sobre mí": pendientes del cliente.
- **Logo:** cambiar el logo de Payload en el panel por el de Emanuel cuando lo haya.
- **Borrar la ubicación GPS de la foto original.** Las versiones que se muestran ya
  salen sin ella.
- **Aviso de foto muy pequeña** al subirla.
- **Ajuste de exportación** para el programa de edición del cliente.
