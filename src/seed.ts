/**
 * Carga los datos iniciales de Emanuel: datos de la página, categorías y un usuario de prueba.
 * Se puede correr varias veces sin duplicar nada: `npm run seed`.
 *
 * Los textos entre [corchetes] están pendientes de las respuestas del cliente.
 */
import config from '@payload-config'
import { type PostgresAdapter, sql } from '@payloadcms/db-postgres'
import { getPayload } from 'payload'
import { generateNKeysBetween } from 'payload/shared'

const payload = await getPayload({ config })
const db = (payload.db as unknown as PostgresAdapter).drizzle

// Orden arrastrando (igual que la migración "orden_arrastrando", que es la que usa Neon):
// las claves se comparan letra por letra, y lo que no tenga clave la recibe al final,
// respetando el orden de antes. Así una base local nueva queda igual que la publicada.
await db.execute(sql`
  ALTER TABLE "categorias" ALTER COLUMN "_order" TYPE varchar COLLATE "C";
  ALTER TABLE "trabajos" ALTER COLUMN "_trabajos_trabajos_order" TYPE varchar COLLATE "C";
  ALTER TABLE "_trabajos_v" ALTER COLUMN "version__trabajos_trabajos_order" TYPE varchar COLLATE "C";
`)

async function darClaves(tabla: 'categorias' | 'trabajos', ids: number[], ultima: string | null) {
  const claves = generateNKeysBetween(ultima, null, ids.length)
  const columna = tabla === 'categorias' ? sql`"_order"` : sql`"_trabajos_trabajos_order"`
  for (const [i, id] of ids.entries()) {
    await db.execute(
      sql`UPDATE ${sql.identifier(tabla)} SET ${columna} = ${claves[i]} WHERE id = ${id}`,
    )
  }
}

const categoriasSinClave = await db.execute<{ id: number }>(
  sql`SELECT id FROM "categorias" WHERE "_order" IS NULL ORDER BY "orden" ASC NULLS LAST, id ASC`,
)
if (categoriasSinClave.rows.length) {
  const { rows } = await db.execute<{ k: string | null }>(
    sql`SELECT max("_order") AS k FROM "categorias"`,
  )
  await darClaves(
    'categorias',
    categoriasSinClave.rows.map((r) => r.id),
    rows[0]?.k ?? null,
  )
}

const trabajosSinClave = await db.execute<{ id: number; categoria_id: number | null }>(
  sql`SELECT id, categoria_id FROM "trabajos" WHERE "_trabajos_trabajos_order" IS NULL
      ORDER BY "fecha" DESC NULLS LAST, id DESC`,
)
const porCategoria = new Map<number | null, number[]>()
for (const { id, categoria_id } of trabajosSinClave.rows) {
  porCategoria.set(categoria_id, [...(porCategoria.get(categoria_id) ?? []), id])
}
for (const [categoria, ids] of porCategoria) {
  const { rows } = await db.execute<{ k: string | null }>(
    sql`SELECT max("_trabajos_trabajos_order") AS k FROM "trabajos" WHERE categoria_id IS NOT DISTINCT FROM ${categoria}`,
  )
  await darClaves('trabajos', ids, rows[0]?.k ?? null)
}
// El historial de cada trabajo (borradores y versiones) también necesita la clave: si no la
// tiene, al guardar un borrador viejo Payload lo mandaría al final de la galería.
await db.execute(sql`
  UPDATE "_trabajos_v" AS v SET "version__trabajos_trabajos_order" = t."_trabajos_trabajos_order"
  FROM "trabajos" AS t
  WHERE v.parent_id = t.id AND v."version__trabajos_trabajos_order" IS NULL
`)
if (categoriasSinClave.rows.length || trabajosSinClave.rows.length) {
  payload.logger.info('Orden inicial asignado a categorías y trabajos')
}

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
