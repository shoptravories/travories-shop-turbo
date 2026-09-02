import { Suspense } from "react"

import { OptionValueIds } from "@lib/util/product-option-filters"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import BrowseHeader from "@modules/store/components/browse-header"
import BrowseToolbar from "@modules/store/components/browse-toolbar"
import FilterSidebar from "@modules/store/components/filter-sidebar"
import ResultCount from "@modules/store/components/result-count"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

import PaginatedProducts from "./paginated-products"

const QUICK_LINKS = [
  { label: "Kathmandu Valley", href: "/categories/kathmandu-valley" },
  { label: "Everest Region", href: "/categories/everest-region" },
  { label: "Pokhara", href: "/categories/pokhara" },
  { label: "Handmade in Nepal", href: "/collections/handmade-in-nepal" },
  { label: "Festival Picks", href: "/collections/festival-picks" },
]

const StoreTemplate = ({
  sortBy,
  page,
  countryCode,
  optionValueIds,
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
  optionValueIds?: OptionValueIds
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  return (
    <>
      <BrowseHeader
        eyebrow="The whole shop"
        title="Every piece we carry"
        description="Souvenirs from six destinations and gifts for every occasion, in one catalogue. Prices include VAT and ship from Kathmandu."
        chips={QUICK_LINKS}
        seed="store-all-products"
        motif="peaks"
        data-testid="store-page-title"
      />

      <div className="content-container pb-16" data-testid="category-container">
        <BrowseToolbar
          sortBy={sort}
          countSlot={
            <Suspense fallback={<span>Counting pieces</span>}>
              <ResultCount
                sortBy={sort}
                countryCode={countryCode}
                optionValueIds={optionValueIds}
              />
            </Suspense>
          }
        />

        <div className="flex flex-col gap-x-10 small:flex-row small:items-start">
          <FilterSidebar />
          <div className="w-full">
            <Suspense fallback={<SkeletonProductGrid />}>
              <PaginatedProducts
                sortBy={sort}
                page={pageNumber}
                countryCode={countryCode}
                optionValueIds={optionValueIds}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  )
}

export default StoreTemplate
