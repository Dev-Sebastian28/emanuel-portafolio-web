import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'
import { generateNKeysBetween } from 'payload/shared'

/**
 * Orden arrastrando: las categorías (en su lista) y los trabajos (dentro de cada categoría).
 *
 * - Las columnas de orden comparan letra por letra (COLLATE "C"), que es como Payload arma las
 *   claves. Con la comparación por idioma de algunas bases, el orden se desordena.
 * - Lo que ya existía recibe su clave respetando el orden de antes: categorías por su número
 *   de orden y trabajos del más reciente al más antiguo.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "trabajos" ADD COLUMN "_trabajos_trabajos_order" varchar COLLATE "C";
  ALTER TABLE "_trabajos_v" ADD COLUMN "version__trabajos_trabajos_order" varchar COLLATE "C";
  ALTER TABLE "categorias" ADD COLUMN "_order" varchar COLLATE "C";
  CREATE INDEX "trabajos__trabajos_trabajos_order_idx" ON "trabajos" USING btree ("_trabajos_trabajos_order");
  CREATE INDEX "_trabajos_v_version_version__trabajos_trabajos_order_idx" ON "_trabajos_v" USING btree ("version__trabajos_trabajos_order");
  CREATE INDEX "categorias__order_idx" ON "categorias" USING btree ("_order");`)

  const categorias = await db.execute<{ id: number }>(
    sql`SELECT id FROM "categorias" ORDER BY "orden" ASC NULLS LAST, id ASC`,
  )
  const clavesCategorias = generateNKeysBetween(null, null, categorias.rows.length)
  for (const [i, { id }] of categorias.rows.entries()) {
    await db.execute(
      sql`UPDATE "categorias" SET "_order" = ${clavesCategorias[i]} WHERE id = ${id}`,
    )
  }

  const trabajos = await db.execute<{ id: number; categoria_id: number | null }>(
    sql`SELECT id, categoria_id FROM "trabajos" ORDER BY "fecha" DESC NULLS LAST, id DESC`,
  )
  const porCategoria = new Map<number | null, number[]>()
  for (const { id, categoria_id } of trabajos.rows) {
    porCategoria.set(categoria_id, [...(porCategoria.get(categoria_id) ?? []), id])
  }
  for (const ids of porCategoria.values()) {
    const claves = generateNKeysBetween(null, null, ids.length)
    for (const [i, id] of ids.entries()) {
      await db.execute(
        sql`UPDATE "trabajos" SET "_trabajos_trabajos_order" = ${claves[i]} WHERE id = ${id}`,
      )
    }
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "trabajos__trabajos_trabajos_order_idx";
  DROP INDEX "_trabajos_v_version_version__trabajos_trabajos_order_idx";
  DROP INDEX "categorias__order_idx";
  ALTER TABLE "trabajos" DROP COLUMN "_trabajos_trabajos_order";
  ALTER TABLE "_trabajos_v" DROP COLUMN "version__trabajos_trabajos_order";
  ALTER TABLE "categorias" DROP COLUMN "_order";`)
}
