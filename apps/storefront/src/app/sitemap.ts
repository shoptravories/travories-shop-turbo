import { MetadataRoute } from "next"

import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import { listDestinations } from "@lib/data/destinations"
import { listProducts } from "@lib/data/products"
import { listCountryCodes, localizedUrl } from "@lib/seo"

/** Refetched hourly rather than baked in at build time. */
export const revalidate = 3600

type Entry = {
  path: string
  lastModified?: string | Date
  changeFrequency?: MetadataRoute.Sitemap[number]["changeFrequency"]
  priority?: number
}

const STATIC_ENTRIES: Entry[] = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/store", changeFrequency: "daily", priority: 0.9 },
  { path: "/destinations", changeFrequency: "weekly", priority: 0.8 },
  { path: "/gifts/finder", changeFrequency: "weekly", priority: 0.8 },
]

/** Products are paginated; stop well before a sitemap needs splitting. */
const PRODUCT_PAGE_SIZE = 100
const MAX_PRODUCT_PAGES = 20

const collectProducts = async (countryCode: string) => {
  const products: { handle?: string | null; updated_at?: string | null }[] = []

  for (let page = 1; page <= MAX_PRODUCT_PAGES; page++) {
    const { response, nextPage } = await listProducts({
      pageParam: page,
      countryCode,
      queryParams: { limit: PRODUCT_PAGE_SIZE, fields: "handle,updated_at" },
    })

    products.push(...response.products)

    if (!nextPage) {
      break
    }
  }

  return products
}

/**
 * One entry per page rather than one per country: the country variants are
 * declared as hreflang alternates on that entry, which is what tells search
 * engines they are the same page rather than near-duplicates competing with
 * each other.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const countryCodes = await listCountryCodes()
  const defaultCountry =
    process.env.NEXT_PUBLIC_DEFAULT_REGION?.toLowerCase() || countryCodes[0]

  if (!defaultCountry) {
    return []
  }

  const [products, collections, categories, destinations] = await Promise.all([
    collectProducts(defaultCountry).catch(() => []),
    listCollections({ fields: "handle,updated_at" })
      .then(({ collections }) => collections)
      .catch(() => []),
    listCategories({ fields: "handle,updated_at" }).catch(() => []),
    listDestinations().catch(() => []),
  ])

  const entries: Entry[] = [
    ...STATIC_ENTRIES,
    ...destinations.map((destination) => ({
      path: `/destinations/${destination.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...collections
      .filter((collection) => collection.handle)
      .map((collection) => ({
        path: `/collections/${collection.handle}`,
        lastModified: collection.updated_at ?? undefined,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
    ...categories
      .filter((category) => category.handle)
      .map((category) => ({
        path: `/categories/${category.handle}`,
        lastModified: category.updated_at ?? undefined,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
    ...products
      .filter((product) => product.handle)
      .map((product) => ({
        path: `/products/${product.handle}`,
        lastModified: product.updated_at ?? undefined,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
  ]

  return entries.map((entry) => ({
    url: localizedUrl(defaultCountry, entry.path),
    lastModified: entry.lastModified ? new Date(entry.lastModified) : undefined,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
    alternates: countryCodes.length
      ? {
          languages: countryCodes.reduce<Record<string, string>>((acc, code) => {
            acc[`en-${code.toUpperCase()}`] = localizedUrl(code, entry.path)
            return acc
          }, {}),
        }
      : undefined,
  }))
}
