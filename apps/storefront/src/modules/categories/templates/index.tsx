import { notFound } from "next/navigation"
import { Suspense } from "react"

import { OptionValueIds } from "@lib/util/product-option-filters"
import { HttpTypes } from "@medusajs/types"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import BrowseHeader, { Crumb } from "@modules/store/components/browse-header"
import BrowseToolbar from "@modules/store/components/browse-toolbar"
import ResultCount from "@modules/store/components/result-count"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"

export default function CategoryTemplate({
  category,
  sortBy,
  page,
  countryCode,
  optionValueIds,
}: {
  category: HttpTypes.StoreProductCategory
  sortBy?: SortOptions
  page?: string
  countryCode: string
  optionValueIds?: OptionValueIds
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  if (!category || !countryCode) {
    notFound()
  }

  const parents = [] as HttpTypes.StoreProductCategory[]

  const getParents = (current: HttpTypes.StoreProductCategory) => {
    if (current.parent_category) {
      parents.push(current.parent_category)
      getParents(current.parent_category)
    }
  }

  getParents(category)

  const crumbs: Crumb[] = [
    { label: "Shop", href: "/store" },
    ...parents
      .slice()
      .reverse()
      .map((parent) => ({
        label: parent.name,
        href: `/categories/${parent.handle}`,
      })),
  ]

  const children = category.category_children ?? []

  return (
    <>
      <BrowseHeader
        eyebrow={parents[0]?.name}
        title={category.name}
        description={category.description}
        crumbs={crumbs}
        seed={category.handle ?? category.id}
        chips={children.map((child) => ({
          label: child.name,
          href: `/categories/${child.handle}`,
        }))}
        data-testid="category-page-title"
      />

      <div className="content-container pb-16" data-testid="category-container">
        <BrowseToolbar
          sortBy={sort}
          hideFilters
          data-testid="sort-by-container"
          countSlot={
            <Suspense fallback={<span>Counting pieces</span>}>
              <ResultCount
                sortBy={sort}
                categoryId={category.id}
                countryCode={countryCode}
                optionValueIds={optionValueIds}
              />
            </Suspense>
          }
        />

        <Suspense
          fallback={
            <SkeletonProductGrid
              numberOfProducts={category.products?.length ?? 8}
            />
          }
        >
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            categoryId={category.id}
            countryCode={countryCode}
            optionValueIds={optionValueIds}
          />
        </Suspense>
      </div>
    </>
  )
}
