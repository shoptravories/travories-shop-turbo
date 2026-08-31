import { sdk } from "@lib/config"
import { getCacheOptions } from "./cookies"

export type StoreDestination = {
  id: string
  name: string
  slug: string
  category_handle: string | null
  region: string | null
  tagline: string | null
  story?: string | null
  hero_image: string | null
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
}

export type StoreDestinationDetail = StoreDestination & {
  story: string | null
  product_ids: string[]
  artisans?: StoreArtisan[]
}

export const listDestinations = async (): Promise<StoreDestination[]> => {
  const next = { ...(await getCacheOptions("destinations")) }

  return sdk.client
    .fetch<{ destinations: StoreDestination[]; count: number }>(
      "/store/destinations",
      { next, cache: "force-cache" }
    )
    .then(({ destinations }) => destinations)
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
    .then(({ destination }) => destination)
    .catch(() => null)
}
