import { getBaseURL } from "@lib/util/env"

/** Leading slash, no trailing slash, query preserved. */
export const normalizePath = (path = "/") => {
  if (!path || path === "/") {
    return "/"
  }

  const withLeadingSlash = path.startsWith("/") ? path : `/${path}`

  return withLeadingSlash.length > 1 && withLeadingSlash.endsWith("/")
    ? withLeadingSlash.slice(0, -1)
    : withLeadingSlash
}

/**
 * Every storefront route lives under /[countryCode], so a canonical that omits
 * it points at a redirect rather than the page being indexed.
 */
export const localizedPath = (countryCode?: string, path = "/") => {
  const normalizedCountry = countryCode?.trim().toLowerCase()
  const normalizedPath = normalizePath(path)

  if (!normalizedCountry) {
    return normalizedPath
  }

  return normalizedPath === "/"
    ? `/${normalizedCountry}`
    : `/${normalizedCountry}${normalizedPath}`
}

export const absoluteUrl = (path = "/") =>
  new URL(normalizePath(path), getBaseURL()).toString()

export const localizedUrl = (countryCode?: string, path = "/") =>
  absoluteUrl(localizedPath(countryCode, path))

/**
 * Product and destination imagery comes back from the backend as an absolute
 * URL already, but seeded/relative paths need resolving before they can be
 * handed to a crawler.
 */
export const absoluteImageUrl = (image?: string | null) => {
  if (!image) {
    return undefined
  }

  const trimmed = image.trim()

  if (!trimmed) {
    return undefined
  }

  return /^https?:\/\//i.test(trimmed) ? trimmed : absoluteUrl(trimmed)
}
