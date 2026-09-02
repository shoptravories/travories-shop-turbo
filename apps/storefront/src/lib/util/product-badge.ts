import { HttpTypes } from "@medusajs/types"

type Cat = HttpTypes.StoreProductCategory & { mpath?: string }

/** How deep a category sits in the tree, derived from its materialised path. */
export const categoryDepth = (category: HttpTypes.StoreProductCategory) =>
  ((category as Cat).mpath ?? "").split(".").filter(Boolean).length

/**
 * The short line printed on a product card above the title.
 *
 * Souvenirs hang off a destination (Kathmandu Valley, Ilam) which sits one
 * level under the Souvenirs pillar, so a depth-two category is the place the
 * piece comes from - the most useful thing to show. Gift-only products have no
 * destination, so their collection stands in.
 */
export const getProductBadge = (product: HttpTypes.StoreProduct) => {
  const categories = (product.categories ?? []) as Cat[]
  const place = categories.find((category) => categoryDepth(category) === 2)

  if (place) {
    return place.name
  }

  return product.collection?.title ?? categories[0]?.name ?? null
}
