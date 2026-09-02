import { defineLink } from "@medusajs/framework/utils"
import ProductModule from "@medusajs/medusa/product"
import SouvenirModule from "../modules/souvenir"

// A product can have many private media records managed outside Medusa's
// core URL-based image fields.
export default defineLink(
  {
    linkable: ProductModule.linkable.product,
    isList: true,
  },
  SouvenirModule.linkable.productMedia
)
