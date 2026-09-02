"use client"

import OptionsPicker from "@modules/store/components/refinement-list/options-picker"
import { useFilterParams } from "@modules/store/components/refinement-list/use-filter-params"

/** The permanent desktop filter column. Phones get the toolbar panel instead. */
const FilterSidebar = () => {
  const { selectedOptionValueIds, setOptionValueIds, clearOptionValueIds } =
    useFilterParams()

  return (
    <aside className="sticky top-32 hidden w-[240px] shrink-0 empty:hidden small:block small:empty:hidden">
      <OptionsPicker
        selectedValueIds={selectedOptionValueIds}
        setOptionValueIds={setOptionValueIds}
        onClear={clearOptionValueIds}
      />
    </aside>
  )
}

export default FilterSidebar
