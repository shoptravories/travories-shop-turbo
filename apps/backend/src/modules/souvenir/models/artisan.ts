import { model } from "@medusajs/framework/utils"
import { Destination } from "./destination"

/**
 * The maker behind a product. Modelled as its own entity rather than a product
 * tag deliberately: this is the multi-vendor seam. When sellers are onboarded,
 * Artisan is what grows into Seller.
 */
export const Artisan = model.define("artisan", {
  id: model.id().primaryKey(),
  name: model.text(),
  slug: model.text().unique(),
  craft: model.text().nullable(),
  bio: model.text().nullable(),
  workshop_location: model.text().nullable(),
  photo: model.text().nullable(),
  is_active: model.boolean().default(true),
  destination: model.belongsTo(() => Destination, {
    mappedBy: "artisans",
  }),
})

export default Artisan
