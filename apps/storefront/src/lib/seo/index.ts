/**
 * Central SEO surface for the storefront: metadata, canonical/hreflang URLs,
 * Open Graph and Twitter cards, schema.org JSON-LD, and share links.
 *
 * Pages should import from "@lib/seo" only - nothing here reaches back into a
 * route, so the whole surface can be reasoned about in one place.
 */

export * from "./config"
export * from "./urls"
export * from "./og-image"
export * from "./hreflang"
export * from "./metadata"
export * from "./share"
export * from "./structured-data"
export { default as JsonLd } from "./json-ld"
export { default as ProductOpenGraph } from "./product-open-graph"
