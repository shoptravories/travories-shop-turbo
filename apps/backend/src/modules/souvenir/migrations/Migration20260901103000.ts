import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260901103000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table if not exists "product_media" ("id" text not null, "key" text null, "url" text null, "alt_text" text null, "rank" integer not null default 0, "is_thumbnail" boolean not null default false, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "product_media_pkey" primary key ("id"));`
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_product_media_deleted_at" ON "product_media" ("deleted_at") WHERE deleted_at IS NULL;`
    )
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "product_media" cascade;`)
  }
}
