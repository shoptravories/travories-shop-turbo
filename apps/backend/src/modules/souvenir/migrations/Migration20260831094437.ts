import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260831094437 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "artisan" drop constraint if exists "artisan_slug_unique";`);
    this.addSql(`alter table if exists "destination" drop constraint if exists "destination_slug_unique";`);
    this.addSql(`create table if not exists "destination" ("id" text not null, "name" text not null, "slug" text not null, "category_handle" text null, "region" text null, "tagline" text null, "story" text null, "hero_image" text null, "latitude" real null, "longitude" real null, "travories_url" text null, "rank" integer not null default 0, "is_active" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "destination_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_destination_slug_unique" ON "destination" ("slug") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_destination_deleted_at" ON "destination" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "artisan" ("id" text not null, "name" text not null, "slug" text not null, "craft" text null, "bio" text null, "workshop_location" text null, "photo" text null, "is_active" boolean not null default true, "destination_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "artisan_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_artisan_slug_unique" ON "artisan" ("slug") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_artisan_destination_id" ON "artisan" ("destination_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_artisan_deleted_at" ON "artisan" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "artisan" add constraint "artisan_destination_id_foreign" foreign key ("destination_id") references "destination" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "artisan" drop constraint if exists "artisan_destination_id_foreign";`);

    this.addSql(`drop table if exists "destination" cascade;`);

    this.addSql(`drop table if exists "artisan" cascade;`);
  }

}
