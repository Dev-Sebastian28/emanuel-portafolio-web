import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_trabajos_tipo" AS ENUM('video', 'youtube', 'foto');
  CREATE TYPE "public"."enum_trabajos_orientacion" AS ENUM('horizontal', 'vertical');
  CREATE TYPE "public"."enum_trabajos_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__trabajos_v_version_tipo" AS ENUM('video', 'youtube', 'foto');
  CREATE TYPE "public"."enum__trabajos_v_version_orientacion" AS ENUM('horizontal', 'vertical');
  CREATE TYPE "public"."enum__trabajos_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "trabajos" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"titulo" varchar,
  	"categoria_id" integer,
  	"tipo" "enum_trabajos_tipo" DEFAULT 'video',
  	"video_id" integer,
  	"youtube" varchar,
  	"foto_id" integer,
  	"portada_id" integer,
  	"orientacion" "enum_trabajos_orientacion" DEFAULT 'horizontal',
  	"fecha" timestamp(3) with time zone,
  	"lugar" varchar,
  	"descripcion" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_trabajos_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_trabajos_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_titulo" varchar,
  	"version_categoria_id" integer,
  	"version_tipo" "enum__trabajos_v_version_tipo" DEFAULT 'video',
  	"version_video_id" integer,
  	"version_youtube" varchar,
  	"version_foto_id" integer,
  	"version_portada_id" integer,
  	"version_orientacion" "enum__trabajos_v_version_orientacion" DEFAULT 'horizontal',
  	"version_fecha" timestamp(3) with time zone,
  	"version_lugar" varchar,
  	"version_descripcion" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__trabajos_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "categorias" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nombre" varchar NOT NULL,
  	"descripcion" varchar,
  	"portada_id" integer,
  	"video_portada_id" integer,
  	"slug" varchar,
  	"orden" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
  	"desenfoque" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_xs_url" varchar,
  	"sizes_xs_width" numeric,
  	"sizes_xs_height" numeric,
  	"sizes_xs_mime_type" varchar,
  	"sizes_xs_filesize" numeric,
  	"sizes_xs_filename" varchar,
  	"sizes_sm_url" varchar,
  	"sizes_sm_width" numeric,
  	"sizes_sm_height" numeric,
  	"sizes_sm_mime_type" varchar,
  	"sizes_sm_filesize" numeric,
  	"sizes_sm_filename" varchar,
  	"sizes_md_url" varchar,
  	"sizes_md_width" numeric,
  	"sizes_md_height" numeric,
  	"sizes_md_mime_type" varchar,
  	"sizes_md_filesize" numeric,
  	"sizes_md_filename" varchar,
  	"sizes_lg_url" varchar,
  	"sizes_lg_width" numeric,
  	"sizes_lg_height" numeric,
  	"sizes_lg_mime_type" varchar,
  	"sizes_lg_filesize" numeric,
  	"sizes_lg_filename" varchar,
  	"sizes_xl_url" varchar,
  	"sizes_xl_width" numeric,
  	"sizes_xl_height" numeric,
  	"sizes_xl_mime_type" varchar,
  	"sizes_xl_filesize" numeric,
  	"sizes_xl_filename" varchar
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"trabajos_id" integer,
  	"categorias_id" integer,
  	"media_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "sitio_etiquetas" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"texto" varchar NOT NULL
  );
  
  CREATE TABLE "sitio" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nombre" varchar NOT NULL,
  	"profesion" varchar,
  	"ciudad" varchar,
  	"video_entrada_id" integer,
  	"video_entrada_vertical_id" integer,
  	"portada_entrada_id" integer,
  	"retrato_id" integer,
  	"titulo_sobre_mi" varchar,
  	"sobre_mi" varchar,
  	"texto_contacto" varchar,
  	"whatsapp" varchar,
  	"email" varchar,
  	"instagram" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "trabajos" ADD CONSTRAINT "trabajos_categoria_id_categorias_id_fk" FOREIGN KEY ("categoria_id") REFERENCES "public"."categorias"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "trabajos" ADD CONSTRAINT "trabajos_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "trabajos" ADD CONSTRAINT "trabajos_foto_id_media_id_fk" FOREIGN KEY ("foto_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "trabajos" ADD CONSTRAINT "trabajos_portada_id_media_id_fk" FOREIGN KEY ("portada_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_trabajos_v" ADD CONSTRAINT "_trabajos_v_parent_id_trabajos_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."trabajos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_trabajos_v" ADD CONSTRAINT "_trabajos_v_version_categoria_id_categorias_id_fk" FOREIGN KEY ("version_categoria_id") REFERENCES "public"."categorias"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_trabajos_v" ADD CONSTRAINT "_trabajos_v_version_video_id_media_id_fk" FOREIGN KEY ("version_video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_trabajos_v" ADD CONSTRAINT "_trabajos_v_version_foto_id_media_id_fk" FOREIGN KEY ("version_foto_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_trabajos_v" ADD CONSTRAINT "_trabajos_v_version_portada_id_media_id_fk" FOREIGN KEY ("version_portada_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "categorias" ADD CONSTRAINT "categorias_portada_id_media_id_fk" FOREIGN KEY ("portada_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "categorias" ADD CONSTRAINT "categorias_video_portada_id_media_id_fk" FOREIGN KEY ("video_portada_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_trabajos_fk" FOREIGN KEY ("trabajos_id") REFERENCES "public"."trabajos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categorias_fk" FOREIGN KEY ("categorias_id") REFERENCES "public"."categorias"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sitio_etiquetas" ADD CONSTRAINT "sitio_etiquetas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sitio"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sitio" ADD CONSTRAINT "sitio_video_entrada_id_media_id_fk" FOREIGN KEY ("video_entrada_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sitio" ADD CONSTRAINT "sitio_video_entrada_vertical_id_media_id_fk" FOREIGN KEY ("video_entrada_vertical_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sitio" ADD CONSTRAINT "sitio_portada_entrada_id_media_id_fk" FOREIGN KEY ("portada_entrada_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sitio" ADD CONSTRAINT "sitio_retrato_id_media_id_fk" FOREIGN KEY ("retrato_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "trabajos_categoria_idx" ON "trabajos" USING btree ("categoria_id");
  CREATE INDEX "trabajos_video_idx" ON "trabajos" USING btree ("video_id");
  CREATE INDEX "trabajos_foto_idx" ON "trabajos" USING btree ("foto_id");
  CREATE INDEX "trabajos_portada_idx" ON "trabajos" USING btree ("portada_id");
  CREATE INDEX "trabajos_updated_at_idx" ON "trabajos" USING btree ("updated_at");
  CREATE INDEX "trabajos_created_at_idx" ON "trabajos" USING btree ("created_at");
  CREATE INDEX "trabajos__status_idx" ON "trabajos" USING btree ("_status");
  CREATE INDEX "_trabajos_v_parent_idx" ON "_trabajos_v" USING btree ("parent_id");
  CREATE INDEX "_trabajos_v_version_version_categoria_idx" ON "_trabajos_v" USING btree ("version_categoria_id");
  CREATE INDEX "_trabajos_v_version_version_video_idx" ON "_trabajos_v" USING btree ("version_video_id");
  CREATE INDEX "_trabajos_v_version_version_foto_idx" ON "_trabajos_v" USING btree ("version_foto_id");
  CREATE INDEX "_trabajos_v_version_version_portada_idx" ON "_trabajos_v" USING btree ("version_portada_id");
  CREATE INDEX "_trabajos_v_version_version_updated_at_idx" ON "_trabajos_v" USING btree ("version_updated_at");
  CREATE INDEX "_trabajos_v_version_version_created_at_idx" ON "_trabajos_v" USING btree ("version_created_at");
  CREATE INDEX "_trabajos_v_version_version__status_idx" ON "_trabajos_v" USING btree ("version__status");
  CREATE INDEX "_trabajos_v_created_at_idx" ON "_trabajos_v" USING btree ("created_at");
  CREATE INDEX "_trabajos_v_updated_at_idx" ON "_trabajos_v" USING btree ("updated_at");
  CREATE INDEX "_trabajos_v_latest_idx" ON "_trabajos_v" USING btree ("latest");
  CREATE INDEX "categorias_portada_idx" ON "categorias" USING btree ("portada_id");
  CREATE INDEX "categorias_video_portada_idx" ON "categorias" USING btree ("video_portada_id");
  CREATE UNIQUE INDEX "categorias_slug_idx" ON "categorias" USING btree ("slug");
  CREATE INDEX "categorias_updated_at_idx" ON "categorias" USING btree ("updated_at");
  CREATE INDEX "categorias_created_at_idx" ON "categorias" USING btree ("created_at");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_xs_sizes_xs_filename_idx" ON "media" USING btree ("sizes_xs_filename");
  CREATE INDEX "media_sizes_sm_sizes_sm_filename_idx" ON "media" USING btree ("sizes_sm_filename");
  CREATE INDEX "media_sizes_md_sizes_md_filename_idx" ON "media" USING btree ("sizes_md_filename");
  CREATE INDEX "media_sizes_lg_sizes_lg_filename_idx" ON "media" USING btree ("sizes_lg_filename");
  CREATE INDEX "media_sizes_xl_sizes_xl_filename_idx" ON "media" USING btree ("sizes_xl_filename");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_trabajos_id_idx" ON "payload_locked_documents_rels" USING btree ("trabajos_id");
  CREATE INDEX "payload_locked_documents_rels_categorias_id_idx" ON "payload_locked_documents_rels" USING btree ("categorias_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "sitio_etiquetas_order_idx" ON "sitio_etiquetas" USING btree ("_order");
  CREATE INDEX "sitio_etiquetas_parent_id_idx" ON "sitio_etiquetas" USING btree ("_parent_id");
  CREATE INDEX "sitio_video_entrada_idx" ON "sitio" USING btree ("video_entrada_id");
  CREATE INDEX "sitio_video_entrada_vertical_idx" ON "sitio" USING btree ("video_entrada_vertical_id");
  CREATE INDEX "sitio_portada_entrada_idx" ON "sitio" USING btree ("portada_entrada_id");
  CREATE INDEX "sitio_retrato_idx" ON "sitio" USING btree ("retrato_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "trabajos" CASCADE;
  DROP TABLE "_trabajos_v" CASCADE;
  DROP TABLE "categorias" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "sitio_etiquetas" CASCADE;
  DROP TABLE "sitio" CASCADE;
  DROP TYPE "public"."enum_trabajos_tipo";
  DROP TYPE "public"."enum_trabajos_orientacion";
  DROP TYPE "public"."enum_trabajos_status";
  DROP TYPE "public"."enum__trabajos_v_version_tipo";
  DROP TYPE "public"."enum__trabajos_v_version_orientacion";
  DROP TYPE "public"."enum__trabajos_v_version_status";`)
}
