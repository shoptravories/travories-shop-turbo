import { model } from "@medusajs/framework/utils"

export const ProductMedia = model.define("product_media", {
  id: model.id().primaryKey(),
  key: model.text().nullable(),
  url: model.text().nullable(),
  alt_text: model.text().nullable(),
  rank: model.number().default(0),
  is_thumbnail: model.boolean().default(false),
})

export default ProductMedia
