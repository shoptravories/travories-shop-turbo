import { defineLink } from "@medusajs/framework/utils"
import ProductModule from "@medusajs/medusa/product"
import SouvenirModule from "../modules/souvenir"

// An artisan makes many products.
export default defineLink(
  {
    linkable: ProductModule.linkable.product,
    isList: true,
  },
  SouvenirModule.linkable.artisan
)
