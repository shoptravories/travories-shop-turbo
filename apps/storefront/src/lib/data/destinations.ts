import { sdk } from "@lib/config"
import { getCacheOptions } from "./cookies"

const getMediaUrl = (key: string) => {
  const base = (process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000").replace(
    /\/+$/,
    ""
  )

  return `${base}/media?key=${encodeURIComponent(key)}`
}

export type StoreDestination = {
  id: string
  name: string
  slug: string
  category_handle: string | null
  region: string | null
  tagline: string | null
  story?: string | null
  hero_image: string | null
  hero_image_key?: string | null
  latitude: number | null
  longitude: number | null
  travories_url: string | null
  rank: number
  is_active: boolean
  product_count: number
}

export type StoreArtisan = {
  id: string
  name: string
  slug: string
  craft: string | null
  bio: string | null
  workshop_location: string | null
  photo: string | null
  photo_key?: string | null
}

export type StoreDestinationDetail = StoreDestination & {
  story: string | null
  product_ids: string[]
  artisans?: StoreArtisan[]
}

const normaliseDestination = (destination: StoreDestination): StoreDestination => ({
  ...destination,
  hero_image:
    destination.hero_image_key && destination.hero_image_key.length > 0
      ? getMediaUrl(destination.hero_image_key)
      : destination.hero_image,
})

const normaliseDestinationDetail = (
  destination: StoreDestinationDetail
): StoreDestinationDetail => ({
  ...destination,
  hero_image:
    destination.hero_image_key && destination.hero_image_key.length > 0
      ? getMediaUrl(destination.hero_image_key)
      : destination.hero_image,
  artisans: (destination.artisans ?? []).map((artisan) => ({
    ...artisan,
    photo:
      artisan.photo_key && artisan.photo_key.length > 0
        ? getMediaUrl(artisan.photo_key)
        : artisan.photo,
  })),
})

export const listDestinations = async (): Promise<StoreDestination[]> => {
  const next = { ...(await getCacheOptions("destinations")) }

  return sdk.client
    .fetch<{ destinations: StoreDestination[]; count: number }>(
      "/store/destinations",
      { next, cache: "force-cache" }
    )
    .then(({ destinations }) => destinations.map(normaliseDestination))
    .catch(() => [])
}

export const getDestinationBySlug = async (
  slug: string
): Promise<StoreDestinationDetail | null> => {
  const next = { ...(await getCacheOptions("destinations")) }

  return sdk.client
    .fetch<{ destination: StoreDestinationDetail }>(
      `/store/destinations/${slug}`,
      { next, cache: "force-cache" }
    )
    .then(({ destination }) => normaliseDestinationDetail(destination))
    .catch(() => null)
}
