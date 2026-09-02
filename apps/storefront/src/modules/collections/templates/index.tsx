import { Suspense } from "react"

import { OptionValueIds } from "@lib/util/product-option-filters"
import { HttpTypes } from "@medusajs/types"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import BrowseHeader from "@modules/store/components/browse-header"
import BrowseToolbar from "@modules/store/components/browse-toolbar"
import ResultCount from "@modules/store/components/result-count"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"

export default function CollectionTemplate({
  sortBy,
  collection,
  page,
  countryCode,
  optionValueIds,
}: {
  sortBy?: SortOptions
  collection: HttpTypes.StoreCollection
  page?: string
  countryCode: string
  optionValueIds?: OptionValueIds
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  return (
    <>
      <BrowseHeader
        eyebrow="Collection"
        title={collection.title}
        crumbs={[{ label: "Shop", href: "/store" }, { label: "Collections" }]}
        seed={collection.handle ?? collection.id}
        motif="flags"
      />

      <div className="content-container pb-16">
        <BrowseToolbar
          sortBy={sort}
          hideFilters
          countSlot={
            <Suspense fallback={<span>Counting pieces</span>}>
              <ResultCount
                sortBy={sort}
                collectionId={collection.id}
                countryCode={countryCode}
                optionValueIds={optionValueIds}
              />
            </Suspense>
          }
        />

        <Suspense
          fallback={
            <SkeletonProductGrid numberOfProducts={collection.products?.length} />
          }
        >
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            collectionId={collection.id}
            countryCode={countryCode}
            optionValueIds={optionValueIds}
          />
        </Suspense>
      </div>
    </>
  )
}
