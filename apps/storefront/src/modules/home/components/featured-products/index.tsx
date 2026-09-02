import { HttpTypes } from "@medusajs/types"
import ProductRail from "@modules/home/components/featured-products/product-rail"
import Reveal from "@modules/common/components/reveal"

export default async function FeaturedProducts({
  collections,
  region,
}: {
  collections: HttpTypes.StoreCollection[]
  region: HttpTypes.StoreRegion
}) {
  return collections.map((collection, index) => (
    <Reveal key={collection.id} delay={index * 60}>
      <ProductRail collection={collection} region={region} />
    </Reveal>
  ))
}
