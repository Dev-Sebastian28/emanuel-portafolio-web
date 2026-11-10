/**
 * Carga los datos iniciales de Emanuel: datos de la página, categorías y un usuario de prueba.
 * Se puede correr varias veces sin duplicar nada: `npm run seed`.
 *
 * Los textos entre [corchetes] están pendientes de las respuestas del cliente.
 */
import config from '@payload-config'
import { getPayload } from 'payload'

const payload = await getPayload({ config })

// Usuario de prueba para el panel en local (los datos están en el archivo .env).
const email = process.env.SEED_ADMIN_EMAIL
const password = process.env.SEED_ADMIN_PASSWORD
if (email && password) {
  const existe = await payload.find({ collection: 'users', where: { email: { equals: email } } })
  if (existe.totalDocs === 0) {
    await payload.create({ collection: 'users', data: { email, password } })
    payload.logger.info(`Usuario de prueba creado: ${email}`)
  }
}

const categorias = [
  { nombre: 'Bodas', slug: 'bodas', orden: 1 },
  { nombre: '15 años', slug: '15-anos', orden: 2 },
  { nombre: 'Eventos', slug: 'eventos', orden: 3 },
]

for (const categoria of categorias) {
  const existe = await payload.find({
    collection: 'categorias',
    where: { slug: { equals: categoria.slug } },
  })
  if (existe.totalDocs === 0) {
    await payload.create({ collection: 'categorias', data: categoria })
    payload.logger.info(`Categoría creada: ${categoria.nombre}`)
  }
}

const sitio = await payload.findGlobal({ slug: 'sitio' })
if (!sitio.nombre) {
  await payload.updateGlobal({
    slug: 'sitio',
    data: {
      nombre: 'Emanuel Fonseca',
      profesion: 'Videógrafo · Producción audiovisual',
      ciudad: 'Bogotá, Colombia',
      tituloSobreMi: 'Hola, soy Emanuel',
      sobreMi:
        '[Texto pendiente del cliente: cómo empezó, cuántos años lleva, qué lo diferencia y cómo trabaja.]',
      etiquetas: [
        { texto: 'Videógrafo' },
        { texto: 'Producción audiovisual' },
        { texto: 'Experiencia en bodas' },
        { texto: 'Bogotá' },
      ],
      textoContacto:
        'Bodas, 15 años y eventos. Hablemos de la fecha, el lugar y la idea para el video.',
      email: 'fftemanuel@gmail.com',
      instagram: 'https://www.instagram.com/emanuel.fonsecam/',
    },
  })
  payload.logger.info('Datos de la página cargados')
}

payload.logger.info('Listo.')
process.exit(0)
