import { HttpTypes } from "@medusajs/types"

import {
  BUSINESS,
  DEFAULT_DESCRIPTION,
  PARENT_SITE,
  SITE_NAME,
  SOCIAL_PROFILES,
} from "./config"
import { ogImageUrl } from "./og-image"
import { absoluteImageUrl, absoluteUrl, localizedUrl } from "./urls"

export type JsonLdNode = Record<string, unknown>

const compact = <T extends JsonLdNode>(node: T): T =>
  Object.fromEntries(
    Object.entries(node).filter(([, value]) => value !== undefined && value !== null)
  ) as T

const plainText = (value?: string | null, max = 5000) => {
  const collapsed = value?.replace(/\s+/g, " ").trim()

  if (!collapsed) {
    return undefined
  }

  return collapsed.length > max ? `${collapsed.slice(0, max - 1)}...` : collapsed
}

/* -------------------------------------------------------------------------- */
/* Site-wide graph                                                            */
/* -------------------------------------------------------------------------- */

export const organizationSchema = (): JsonLdNode =>
  compact({
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    "@id": `${absoluteUrl("/")}#organization`,
    name: SITE_NAME,
    url: absoluteUrl("/"),
    logo: ogImageUrl({ title: SITE_NAME }),
    description: DEFAULT_DESCRIPTION,
    parentOrganization: {
      "@type": "Organization",
      name: PARENT_SITE.name,
      url: PARENT_SITE.url,
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: BUSINESS.addressLocality,
      addressCountry: BUSINESS.addressCountry,
    },
    sameAs: SOCIAL_PROFILES.length ? SOCIAL_PROFILES : undefined,
  })

export const websiteSchema = (): JsonLdNode =>
  compact({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${absoluteUrl("/")}#website`,
    name: SITE_NAME,
    url: absoluteUrl("/"),
    description: DEFAULT_DESCRIPTION,
    inLanguage: "en",
    publisher: { "@id": `${absoluteUrl("/")}#organization` },
  })

/* -------------------------------------------------------------------------- */
/* Navigation                                                                 */
/* -------------------------------------------------------------------------- */

export type Crumb = { name: string; path?: string }

export const breadcrumbSchema = (
  crumbs: Crumb[],
  countryCode?: string
): JsonLdNode => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: crumbs.map((crumb, index) =>
    compact({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: crumb.path ? localizedUrl(countryCode, crumb.path) : undefined,
    })
  ),
})

/* -------------------------------------------------------------------------- */
/* Products                                                                   */
/* -------------------------------------------------------------------------- */

type VariantWithPrice = HttpTypes.StoreProductVariant & {
  calculated_price?: {
    calculated_amount: number
    original_amount: number
    currency_code: string
  }
}

const variantAvailability = (variant: HttpTypes.StoreProductVariant) => {
  if (variant.allow_backorder) {
    return "https://schema.org/BackOrder"
  }

  if (!variant.manage_inventory) {
    return "https://schema.org/InStock"
  }

  return (variant.inventory_quantity ?? 0) > 0
    ? "https://schema.org/InStock"
    : "https://schema.org/OutOfStock"
}

/**
 * Rich results need a price, a currency, and an availability per offer. Medusa
 * returns those on the variant's calculated_price for the requested region, so
 * a product priced in one region and not another simply yields fewer offers
 * rather than an offer with a zero price - which Google flags as invalid.
 */
export const productSchema = ({
  product,
  countryCode,
  url,
}: {
  product: HttpTypes.StoreProduct
  countryCode?: string
  url?: string
}): JsonLdNode => {
  const productUrl = url ?? localizedUrl(countryCode, `/products/${product.handle}`)

  const variants = (product.variants ?? []) as VariantWithPrice[]

  const offers = variants
    .filter((variant) => typeof variant.calculated_price?.calculated_amount === "number")
    .map((variant) =>
      compact({
        "@type": "Offer",
        name: variant.title ?? undefined,
        sku: variant.sku ?? variant.id,
        price: variant.calculated_price!.calculated_amount.toFixed(2),
        priceCurrency: variant.calculated_price!.currency_code.toUpperCase(),
        availability: variantAvailability(variant),
        itemCondition: "https://schema.org/NewCondition",
        url: productUrl,
        seller: { "@id": `${absoluteUrl("/")}#organization` },
      })
    )

  const prices = offers.map((offer) => Number(offer.price))
  const currency = offers[0]?.priceCurrency as string | undefined

  const images = (product.images ?? [])
    .map((image) => absoluteImageUrl(image.url))
    .filter((image): image is string => Boolean(image))

  const thumbnail = absoluteImageUrl(product.thumbnail)

  return compact({
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${productUrl}#product`,
    name: product.title,
    description:
      plainText(product.description) ??
      plainText(product.subtitle) ??
      `${product.title} from ${SITE_NAME}.`,
    image: images.length ? images : thumbnail ? [thumbnail] : undefined,
    url: productUrl,
    sku: product.variants?.[0]?.sku ?? product.id,
    countryOfOrigin: BUSINESS.countryOfOrigin,
    category: product.categories?.[0]?.name ?? product.collection?.title,
    material: plainText(product.material),
    brand: { "@type": "Brand", name: SITE_NAME },
    ...(product.weight
      ? {
          weight: {
            "@type": "QuantitativeValue",
            value: product.weight,
            unitCode: "GRM",
          },
        }
      : {}),
    // A single variant is a plain Offer; several become an AggregateOffer so the
    // "from" price shown in results matches what the page shows.
    offers:
      offers.length > 1
        ? compact({
            "@type": "AggregateOffer",
            offerCount: offers.length,
            lowPrice: Math.min(...prices).toFixed(2),
            highPrice: Math.max(...prices).toFixed(2),
            priceCurrency: currency,
            offers,
          })
        : offers[0],
  })
}

/* -------------------------------------------------------------------------- */
/* Listings                                                                   */
/* -------------------------------------------------------------------------- */

export const itemListSchema = ({
  products,
  countryCode,
  name,
}: {
  products: Pick<HttpTypes.StoreProduct, "id" | "title" | "handle" | "thumbnail">[]
  countryCode?: string
  name?: string
}): JsonLdNode =>
  compact({
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: products.length,
    itemListElement: products.map((product, index) =>
      compact({
        "@type": "ListItem",
        position: index + 1,
        url: localizedUrl(countryCode, `/products/${product.handle}`),
        name: product.title,
        image: absoluteImageUrl(product.thumbnail),
      })
    ),
  })

export const collectionPageSchema = ({
  name,
  description,
  path,
  countryCode,
  products,
}: {
  name: string
  description?: string | null
  path: string
  countryCode?: string
  products?: Pick<HttpTypes.StoreProduct, "id" | "title" | "handle" | "thumbnail">[]
}): JsonLdNode =>
  compact({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description: plainText(description) ?? undefined,
    url: localizedUrl(countryCode, path),
    isPartOf: { "@id": `${absoluteUrl("/")}#website` },
    mainEntity: products?.length
      ? itemListSchema({ products, countryCode, name })
      : undefined,
  })

/* -------------------------------------------------------------------------- */
/* Destinations                                                               */
/* -------------------------------------------------------------------------- */

export const destinationSchema = ({
  name,
  description,
  path,
  countryCode,
  image,
  latitude,
  longitude,
}: {
  name: string
  description?: string | null
  path: string
  countryCode?: string
  image?: string | null
  latitude?: number | null
  longitude?: number | null
}): JsonLdNode =>
  compact({
    "@context": "https://schema.org",
    "@type": "Place",
    name,
    description: plainText(description) ?? undefined,
    url: localizedUrl(countryCode, path),
    image: absoluteImageUrl(image),
    address: {
      "@type": "PostalAddress",
      addressLocality: name,
      addressCountry: BUSINESS.addressCountry,
    },
    geo:
      typeof latitude === "number" && typeof longitude === "number"
        ? { "@type": "GeoCoordinates", latitude, longitude }
        : undefined,
  })
