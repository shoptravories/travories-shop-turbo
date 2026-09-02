"use client"

import OptionsPicker from "@modules/store/components/refinement-list/options-picker"
import { useFilterParams } from "@modules/store/components/refinement-list/use-filter-params"

/** The permanent desktop filter column. Phones get the toolbar panel instead. */
const FilterSidebar = () => {
  const { selectedOptionValueIds, setOptionValueIds, clearOptionValueIds } =
    useFilterParams()

  return (
    <aside className="hidden w-[240px] shrink-0 small:block">
      <div className="sticky top-32">
        <OptionsPicker
          selectedValueIds={selectedOptionValueIds}
          setOptionValueIds={setOptionValueIds}
          onClear={clearOptionValueIds}
        />
      </div>
    </aside>
  )
}

export default FilterSidebar
