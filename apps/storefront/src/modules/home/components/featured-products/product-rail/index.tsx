import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"

import SectionHeading from "@modules/common/components/section-heading"
import ProductPreview from "@modules/products/components/product-preview"

const RAIL_LIMIT = 4

const BLURBS: Record<string, string> = {
  "handmade-in-nepal":
    "The core of the shop - pieces made by hand in a workshop we can name.",
  "festival-picks":
    "What people actually buy for Dashain, Tihar and the weddings in between.",
}

export default async function ProductRail({
  collection,
  region,
}: {
  collection: HttpTypes.StoreCollection
  region: HttpTypes.StoreRegion
}) {
  const {
    response: { products },
  } = await listProducts({
    regionId: region.id,
    queryParams: {
      collection_id: collection.id,
      limit: RAIL_LIMIT,
      fields: "*variants.calculated_price",
    },
  })

  if (!products?.length) {
    return null
  }

  return (
    <div className="content-container py-12 small:py-16">
      <SectionHeading
        eyebrow="Collection"
        title={collection.title}
        description={BLURBS[collection.handle ?? ""]}
        href={`/collections/${collection.handle}`}
      />

      <ul
        data-lenis-prevent
        className="hide-scrollbar -mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 small:mx-0 small:grid small:grid-cols-4 small:gap-6 small:overflow-visible small:px-0"
      >
        {products.map((product) => (
          <li
            key={product.id}
            className="w-[62vw] shrink-0 snap-start xsmall:w-[40vw] small:w-auto"
          >
            <ProductPreview product={product} region={region} isFeatured />
          </li>
        ))}
      </ul>
    </div>
  )
}
