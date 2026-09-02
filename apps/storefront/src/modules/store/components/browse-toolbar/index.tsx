"use client"

import { useState } from "react"

import { clx } from "@modules/common/components/ui"
import OptionsPicker from "@modules/store/components/refinement-list/options-picker"
import SortProducts, {
  SortOptions,
} from "@modules/store/components/refinement-list/sort-products"
import { useFilterParams } from "@modules/store/components/refinement-list/use-filter-params"

type BrowseToolbarProps = {
  sortBy: SortOptions
  /** Streamed-in result count, rendered by a server component. */
  countSlot?: React.ReactNode
  /** Collections have no variant options worth filtering on. */
  hideFilters?: boolean
  "data-testid"?: string
}

/**
 * Sticky control bar above every product grid. It carries the result count and
 * the sort control on all breakpoints, and on phones it also owns the filter
 * panel that the desktop sidebar shows permanently.
 */
const BrowseToolbar = ({
  sortBy,
  countSlot,
  hideFilters = false,
  "data-testid": dataTestId,
}: BrowseToolbarProps) => {
  const [filtersOpen, setFiltersOpen] = useState(false)
  const {
    setQueryParams,
    selectedOptionValueIds,
    setOptionValueIds,
    clearOptionValueIds,
  } = useFilterParams()

  return (
    <div className="sticky top-16 z-30 -mx-6 mb-8 border-b border-ui-border-base bg-white/90 px-6 backdrop-blur supports-[backdrop-filter]:bg-white/75">
      <div className="flex flex-wrap items-center justify-between gap-3 py-3.5">
        <span className="text-small-regular text-ui-fg-subtle">
          {countSlot ?? "Browsing the shop"}
        </span>

        <div className="flex items-center gap-x-2">
          {!hideFilters && (
            <button
              type="button"
              onClick={() => setFiltersOpen((open) => !open)}
              aria-expanded={filtersOpen}
              className={clx(
                "flex items-center gap-x-2 rounded-circle border px-4 py-2 text-small-regular transition-colors duration-150 small:hidden",
                selectedOptionValueIds.length
                  ? "border-brand-primary bg-brand-primary-deep text-brand-surface"
                  : "border-ui-border-base text-brand-primary"
              )}
              data-testid="mobile-filters-toggle"
            >
              Filters
              {selectedOptionValueIds.length > 0 && (
                <span>({selectedOptionValueIds.length})</span>
              )}
            </button>
          )}

          <SortProducts
            sortBy={sortBy}
            setQueryParams={setQueryParams}
            data-testid={dataTestId}
          />
        </div>
      </div>

      {!hideFilters && filtersOpen && (
        <div className="border-t border-ui-border-base py-5 small:hidden">
          <OptionsPicker
            selectedValueIds={selectedOptionValueIds}
            setOptionValueIds={setOptionValueIds}
            onClear={clearOptionValueIds}
          />
        </div>
      )}
    </div>
  )
}

export default BrowseToolbar
