import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260901090000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table if exists "destination" add column if not exists "hero_image_key" text null;`
    )
    this.addSql(
      `alter table if exists "artisan" add column if not exists "photo_key" text null;`
    )
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table if exists "destination" drop column if exists "hero_image_key";`
    )
    this.addSql(
      `alter table if exists "artisan" drop column if exists "photo_key";`
    )
  }
}
