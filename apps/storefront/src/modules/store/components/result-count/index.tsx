import { listProductsWithSort } from "@lib/data/products"
import { OptionValueIds } from "@lib/util/product-option-filters"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import type { BrowseQueryParams } from "@modules/store/templates/paginated-products"

/**
 * Prints how many pieces the current filters match, streamed into the sticky
 * toolbar. It repeats the grid's query on purpose - the request is memoised
 * and cached, so it costs nothing, and it keeps the toolbar independent of
 * whenever the grid finishes rendering.
 */
export default async function ResultCount({
  sortBy,
  collectionId,
  categoryId,
  productsIds,
  countryCode,
  optionValueIds,
}: {
  sortBy?: SortOptions
  collectionId?: string
  categoryId?: string
  productsIds?: string[]
  countryCode: string
  optionValueIds?: OptionValueIds
}) {
  const queryParams: BrowseQueryParams = { limit: 12 }

  if (collectionId) {
    queryParams["collection_id"] = [collectionId]
  }

  if (categoryId) {
    queryParams["category_id"] = [categoryId]
  }

  if (productsIds) {
    queryParams["id"] = productsIds
  }

  if (sortBy === "created_at") {
    queryParams["order"] = "created_at"
  }

  const {
    response: { count },
  } = await listProductsWithSort({
    page: 1,
    queryParams,
    sortBy,
    countryCode,
    optionValueIds,
  })

  return (
    <span data-testid="result-count">
      {count} {count === 1 ? "piece" : "pieces"}
    </span>
  )
}
