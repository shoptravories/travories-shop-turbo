"use client"

import { clx } from "@modules/common/components/ui"

export type SortOptions = "price_asc" | "price_desc" | "created_at"

type SortProductsProps = {
  sortBy: SortOptions
  setQueryParams: (name: string, value: string) => void
  "data-testid"?: string
}

const sortOptions: { value: SortOptions; label: string; short: string }[] = [
  { value: "created_at", label: "Latest arrivals", short: "Latest" },
  { value: "price_asc", label: "Price: low to high", short: "Price up" },
  { value: "price_desc", label: "Price: high to low", short: "Price down" },
]

/**
 * A segmented control rather than a radio list - three options do not justify
 * a dropdown, and inline pills keep the current sort visible while scrolling.
 */
const SortProducts = ({
  "data-testid": dataTestId,
  sortBy,
  setQueryParams,
}: SortProductsProps) => {
  return (
    <div
      className="flex items-center gap-x-1 rounded-circle border border-ui-border-base bg-white p-1"
      role="group"
      aria-label="Sort products"
      data-testid={dataTestId}
    >
      {sortOptions.map((option) => {
        const active = option.value === sortBy

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setQueryParams("sortBy", option.value)}
            aria-pressed={active}
            title={option.label}
            className={clx(
              "rounded-circle px-3 py-1.5 text-small-regular transition-colors duration-150",
              active
                ? "bg-brand-primary-deep text-brand-surface"
                : "text-ui-fg-subtle hover:text-brand-primary"
            )}
            data-testid="sort-option"
          >
            <span className="small:hidden">{option.short}</span>
            <span className="hidden small:inline">{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export default SortProducts
