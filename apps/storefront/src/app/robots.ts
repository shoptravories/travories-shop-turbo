import { MetadataRoute } from "next"

import { absoluteUrl } from "@lib/seo"

/**
 * Cart, checkout, account and order pages are per-visitor and often carry
 * tokens in the URL, so they are kept out of the index entirely. Everything
 * else in the catalogue is fair game.
 */
const PRIVATE_PATHS = [
  "/api/",
  "/*/account",
  "/*/cart",
  "/*/checkout",
  "/*/order/",
  "/*/verify-account",
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        // Twitterbot and facebookexternalhit both respect robots.txt when
        // fetching og:image, so the card renderer has to stay crawlable even
        // though the rest of /api does not.
        allow: ["/", "/api/og"],
        disallow: PRIVATE_PATHS,
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  }
}
