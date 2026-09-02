import { listRegions } from "@lib/data/regions"
import { localizedPath } from "./urls"

/**
 * The storefront serves the same catalogue under every country code, so each
 * page needs hreflang alternates or the country variants compete with each
 * other in search results. Region data is already force-cached for the region
 * selector, so this is a cache read rather than a per-page request.
 */
export const listCountryCodes = async (): Promise<string[]> => {
  try {
    const regions = await listRegions()

    const codes = (regions ?? [])
      .flatMap((region) => region.countries?.map((country) => country.iso_2) ?? [])
      .filter((code): code is string => Boolean(code))
      .map((code) => code.toLowerCase())

    return Array.from(new Set(codes))
  } catch {
    // Metadata must never take a page down: no regions simply means no alternates.
    return []
  }
}

export const buildLanguageAlternates = async (
  path = "/",
  countryCodes?: string[]
): Promise<Record<string, string> | undefined> => {
  const codes = countryCodes ?? (await listCountryCodes())

  if (!codes.length) {
    return undefined
  }

  const alternates = codes.reduce<Record<string, string>>((acc, code) => {
    acc[`en-${code.toUpperCase()}`] = localizedPath(code, path)
    return acc
  }, {})

  // Country-agnostic visitors get routed by middleware from the bare path.
  alternates["x-default"] = localizedPath(undefined, path)

  return alternates
}
