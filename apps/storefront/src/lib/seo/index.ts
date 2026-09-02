import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"

const SITE_NAME = "Nepal Souvenirs"
const SITE_SUFFIX = "Nepal Souvenirs by Travories"
const DEFAULT_DESCRIPTION =
  "Hand-made souvenirs, gifts, and trail gear from Nepal. Sourced from local artisans, packed in Kathmandu, and shipped with region-aware pricing."
const DEFAULT_KEYWORDS = [
  "Nepal souvenirs",
  "Nepali gifts",
  "handmade Nepal products",
  "trekking gear Nepal",
  "mountaineering gear Nepal",
  "Travories",
]

const normalizePath = (path = "/") => {
  if (!path || path === "/") {
    return "/"
  }

  return path.startsWith("/") ? path : `/${path}`
}

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

const fullTitle = (title?: string) =>
  title ? `${title} | ${SITE_SUFFIX}` : SITE_SUFFIX

export const buildSeoMetadata = ({
  title,
  description = DEFAULT_DESCRIPTION,
  path = "/",
  countryCode,
  image,
  keywords,
  type = "website",
  noIndex = false,
}: {
  title?: string
  description?: string
  path?: string
  countryCode?: string
  image?: string | null
  keywords?: string[]
  type?: "website" | "article"
  noIndex?: boolean
}): Metadata => {
  const canonicalPath = localizedPath(countryCode, path)
  const url = absoluteUrl(canonicalPath)
  const seoTitle = fullTitle(title)
  const images = image ? [{ url: image, alt: title ?? SITE_NAME }] : undefined

  return {
    title: seoTitle,
    description,
    keywords: keywords?.length ? keywords : DEFAULT_KEYWORDS,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      type,
      url,
      title: seoTitle,
      description,
      siteName: SITE_NAME,
      images,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: seoTitle,
      description,
      images: image ? [image] : undefined,
    },
    robots: noIndex ? { index: false, follow: false } : undefined,
  }
}

export const buildSiteMetadata = (): Metadata => ({
  metadataBase: new URL(getBaseURL()),
  applicationName: SITE_NAME,
  title: {
    default: SITE_SUFFIX,
    template: `%s | ${SITE_SUFFIX}`,
  },
  description: DEFAULT_DESCRIPTION,
  openGraph: {
    siteName: SITE_NAME,
    type: "website",
    title: SITE_SUFFIX,
    description: DEFAULT_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: SITE_SUFFIX,
    description: DEFAULT_DESCRIPTION,
  },
})
