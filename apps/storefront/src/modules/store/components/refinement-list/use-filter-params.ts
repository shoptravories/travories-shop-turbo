"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useMemo } from "react"

import {
  OPTION_VALUE_QUERY_KEY,
  parseOptionValueIds,
} from "@lib/util/product-option-filters"

/**
 * Shared query-string plumbing for every browse control. The toolbar and the
 * sidebar both write to the same params, so the logic lives here rather than
 * being duplicated - and changing a filter always resets pagination.
 */
export const useFilterParams = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const updateQueryParams = useCallback(
    (updater: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString())
      updater(params)

      params.delete("page")

      const queryString = params.toString()
      const currentQuery = searchParams.toString()
      const nextPath = queryString ? `${pathname}?${queryString}` : pathname
      const currentPath = currentQuery ? `${pathname}?${currentQuery}` : pathname

      if (nextPath !== currentPath) {
        router.push(nextPath, { scroll: false })
      }
    },
    [pathname, router, searchParams]
  )

  const setQueryParams = useCallback(
    (name: string, value: string) =>
      updateQueryParams((params) => params.set(name, value)),
    [updateQueryParams]
  )

  const selectedOptionValueIds = useMemo(
    () => parseOptionValueIds(searchParams),
    [searchParams]
  )

  const setOptionValueIds = useCallback(
    (valueIds: string[]) =>
      updateQueryParams((params) => {
        params.delete(OPTION_VALUE_QUERY_KEY)
        valueIds.forEach((valueId) =>
          params.append(OPTION_VALUE_QUERY_KEY, valueId)
        )
      }),
    [updateQueryParams]
  )

  const clearOptionValueIds = useCallback(
    () =>
      updateQueryParams((params) => params.delete(OPTION_VALUE_QUERY_KEY)),
    [updateQueryParams]
  )

  return {
    setQueryParams,
    selectedOptionValueIds,
    setOptionValueIds,
    clearOptionValueIds,
  }
}
