import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "trabajos" ADD COLUMN "carrusel" boolean DEFAULT false;
  ALTER TABLE "_trabajos_v" ADD COLUMN "version_carrusel" boolean DEFAULT false;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "trabajos" DROP COLUMN "carrusel";
  ALTER TABLE "_trabajos_v" DROP COLUMN "version_carrusel";`)
}
