import { defineLink } from "@medusajs/framework/utils"
import ProductModule from "@medusajs/medusa/product"
import SouvenirModule from "../modules/souvenir"

// A destination has many products; isList sits on the product side.
export default defineLink(
  {
    linkable: ProductModule.linkable.product,
    isList: true,
  },
  SouvenirModule.linkable.destination
)
