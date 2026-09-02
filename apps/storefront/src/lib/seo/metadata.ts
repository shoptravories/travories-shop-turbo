import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"

import {
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
  FACEBOOK_APP_ID,
  PARENT_SITE,
  SITE_NAME,
  SITE_SUFFIX,
  SITE_VERIFICATION,
  TWITTER_HANDLE,
} from "./config"
import { buildLanguageAlternates } from "./hreflang"
import { ogImageDescriptor } from "./og-image"
import { absoluteImageUrl, localizedPath, localizedUrl } from "./urls"

export type SeoInput = {
  /** Page title without the site suffix - the suffix is added here. */
  title?: string
  description?: string
  /** Country-agnostic path, e.g. "/store". The country code is prefixed for you. */
  path?: string
  countryCode?: string
  /** Real photography for the page, if it has any. Falls back to a branded card. */
  image?: string | null
  /** Small label rendered above the title on the generated share card. */
  eyebrow?: string
  keywords?: string[]
  /** "product" swaps og:type for the product namespace - see ProductOpenGraph. */
  type?: "website" | "article" | "product"
  noIndex?: boolean
  /** Skip the hreflang lookup on routes that are never country-indexed. */
  skipAlternates?: boolean
  publishedTime?: string
  modifiedTime?: string
}

const fullTitle = (title?: string) =>
  title ? `${title} | ${SITE_SUFFIX}` : SITE_SUFFIX

const cleanDescription = (description: string) => {
  const collapsed = description.replace(/\s+/g, " ").trim()

  // Search results truncate around 160 characters; keep the cut on a word.
  if (collapsed.length <= 160) {
    return collapsed
  }

  const cut = collapsed.slice(0, 157)
  const lastSpace = cut.lastIndexOf(" ")

  return `${(lastSpace > 100 ? cut.slice(0, lastSpace) : cut).trimEnd()}...`
}

/**
 * The one builder every page should use. It guarantees a canonical that
 * includes the country code, hreflang alternates for the other countries, an
 * Open Graph image (real photography when there is any, a branded card
 * otherwise), and a matching Twitter card.
 */
export const buildSeoMetadata = async ({
  title,
  description = DEFAULT_DESCRIPTION,
  path = "/",
  countryCode,
  image,
  eyebrow,
  keywords,
  type = "website",
  noIndex = false,
  skipAlternates = false,
  publishedTime,
  modifiedTime,
}: SeoInput): Promise<Metadata> => {
  const canonicalPath = localizedPath(countryCode, path)
  const url = localizedUrl(countryCode, path)
  const seoTitle = fullTitle(title)
  const seoDescription = cleanDescription(description)
  const photo = absoluteImageUrl(image)

  const shareImage = ogImageDescriptor({
    title: title ?? SITE_SUFFIX,
    subtitle: seoDescription,
    eyebrow,
    image: photo,
  })

  // Real photography leads the array so networks that take the first image
  // show the product; the branded card backs it up if the photo 404s.
  const images = photo
    ? [{ url: photo, alt: title ?? SITE_NAME }, shareImage]
    : [shareImage]

  const languages =
    noIndex || skipAlternates ? undefined : await buildLanguageAlternates(path)

  return {
    title: { absolute: seoTitle },
    description: seoDescription,
    keywords: keywords?.length ? [...keywords, ...DEFAULT_KEYWORDS] : DEFAULT_KEYWORDS,
    alternates: {
      canonical: canonicalPath,
      languages,
    },
    openGraph: {
      // og:type for a product carries price and availability alongside it, and
      // Next has no typed form for that namespace - ProductOpenGraph emits the
      // whole set, so this leaves og:type out rather than emitting it twice.
      ...(type === "product" ? {} : { type }),
      url,
      title: seoTitle,
      description: seoDescription,
      siteName: SITE_NAME,
      locale: "en_US",
      images,
      ...(type === "article" ? { publishedTime, modifiedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: seoDescription,
      images: images.map((entry) => entry.url),
      ...(TWITTER_HANDLE ? { site: TWITTER_HANDLE, creator: TWITTER_HANDLE } : {}),
    },
    robots: noIndex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
    ...(FACEBOOK_APP_ID ? { other: { "fb:app_id": FACEBOOK_APP_ID } } : {}),
  }
}

/**
 * Root-layout metadata: the defaults every route inherits when it does not set
 * its own. The title template covers any page that has not been migrated to
 * buildSeoMetadata yet; buildSeoMetadata itself returns an absolute title so
 * the suffix is never applied twice.
 */
export const buildSiteMetadata = (): Metadata => ({
  metadataBase: new URL(getBaseURL()),
  applicationName: SITE_NAME,
  title: {
    default: SITE_SUFFIX,
    template: `%s | ${SITE_SUFFIX}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: DEFAULT_KEYWORDS,
  authors: [{ name: PARENT_SITE.name, url: PARENT_SITE.url }],
  creator: PARENT_SITE.name,
  publisher: SITE_NAME,
  category: "shopping",
  formatDetection: { telephone: false, address: false, email: false },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_SUFFIX,
    description: DEFAULT_DESCRIPTION,
    locale: "en_US",
    url: getBaseURL(),
    images: [ogImageDescriptor({ title: SITE_SUFFIX, subtitle: DEFAULT_DESCRIPTION })],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_SUFFIX,
    description: DEFAULT_DESCRIPTION,
    images: [ogImageDescriptor({ title: SITE_SUFFIX, subtitle: DEFAULT_DESCRIPTION }).url],
    ...(TWITTER_HANDLE ? { site: TWITTER_HANDLE, creator: TWITTER_HANDLE } : {}),
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  verification: SITE_VERIFICATION.google || SITE_VERIFICATION.other ? SITE_VERIFICATION : undefined,
  ...(FACEBOOK_APP_ID ? { other: { "fb:app_id": FACEBOOK_APP_ID } } : {}),
})

/**
 * Cart, checkout, account and order pages. robots.txt keeps crawlers off them,
 * but a page linked from elsewhere can still be indexed without being crawled,
 * so these carry an explicit noindex as well.
 */
export const buildPrivateMetadata = ({
  title,
  description,
}: {
  title: string
  description?: string
}): Metadata => ({
  title: { absolute: fullTitle(title) },
  description,
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
})
