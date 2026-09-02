/**
 * Single source of truth for everything that identifies the site to crawlers
 * and to social networks. Nothing else in the app should hard-code the store
 * name, the default description, or the social handles - import from here so a
 * rename is one edit rather than a grep.
 */

export const SITE_NAME = "Nepal Souvenirs"

/** Appended to every page title, and used on its own for the bare home title. */
export const SITE_SUFFIX = "Nepal Souvenirs by Travories"

export const SITE_TAGLINE = "Hand-made souvenirs, gifts, and trail gear from Nepal"

export const DEFAULT_DESCRIPTION =
  "Hand-made souvenirs, gifts, and trail gear from Nepal. Sourced from local artisans, packed in Kathmandu, and shipped with region-aware pricing."

export const DEFAULT_KEYWORDS = [
  "Nepal souvenirs",
  "Nepali gifts",
  "handmade Nepal products",
  "trekking gear Nepal",
  "mountaineering gear Nepal",
  "Kathmandu souvenirs",
  "Travories",
]

/** The parent marketplace this store is the souvenir arm of. */
export const PARENT_SITE = {
  name: "Travories",
  url: "https://travories.com",
}

/**
 * Social handles drive twitter:site / twitter:creator and the Organization
 * sameAs graph. They are env-driven because pointing a Twitter card at a handle
 * that does not exist is worse than omitting the tag entirely.
 */
const handle = (value?: string) =>
  value?.trim() ? (value.startsWith("@") ? value.trim() : `@${value.trim()}`) : undefined

export const TWITTER_HANDLE = handle(process.env.NEXT_PUBLIC_TWITTER_HANDLE)

export const SOCIAL_PROFILES = [
  process.env.NEXT_PUBLIC_FACEBOOK_URL,
  process.env.NEXT_PUBLIC_INSTAGRAM_URL,
  process.env.NEXT_PUBLIC_TWITTER_URL,
  process.env.NEXT_PUBLIC_YOUTUBE_URL,
  PARENT_SITE.url,
].filter((url): url is string => Boolean(url?.trim()))

/** Facebook link ownership / insights, optional. */
export const FACEBOOK_APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID?.trim() || undefined

/** Search Console and friends. Omitted from the head when unset. */
export const SITE_VERIFICATION = {
  google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim() || undefined,
  other: process.env.NEXT_PUBLIC_PINTEREST_SITE_VERIFICATION?.trim()
    ? { "p:domain_verify": process.env.NEXT_PUBLIC_PINTEREST_SITE_VERIFICATION!.trim() }
    : undefined,
}

export const OG_IMAGE_SIZE = { width: 1200, height: 630 }

/** Brand palette, mirrored from globals.css for the OG image renderer, which
 *  cannot read CSS variables. Keep in sync with --brand-* there. */
export const OG_COLORS = {
  ink: "#1c1822",
  primary: "#65558f",
  primaryDeep: "#4c406b",
  accent: "#7e5cd9",
  accentLight: "#cfcadc",
  sand: "#faf8f5",
  surface: "#f5f5f5",
}

export const BUSINESS = {
  addressLocality: "Kathmandu",
  addressCountry: "NP",
  currency: "NPR",
  /** Where the goods are made, used for Product countryOfOrigin. */
  countryOfOrigin: "NP",
}
