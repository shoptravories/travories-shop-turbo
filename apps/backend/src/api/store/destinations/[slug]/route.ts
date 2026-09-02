import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { getStoreMediaUrl } from "../../../../lib/store-media"

/**
 * GET /store/destinations/:slug
 *
 * Returns one destination with its story and the IDs of linked products.
 * Product pricing is deliberately not resolved here - the storefront fetches
 * products through the standard products endpoint so region pricing and tax
 * inclusivity are handled by the core, not reimplemented.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { slug } = req.params

  const { data } = await query.graph({
    entity: "destination",
    fields: [
      "id",
      "name",
      "slug",
      "category_handle",
      "region",
      "tagline",
      "story",
      "hero_image",
      "hero_image_key",
      "latitude",
      "longitude",
      "travories_url",
      "rank",
      "is_active",
      "products.id",
      "artisans.id",
      "artisans.name",
      "artisans.slug",
      "artisans.craft",
      "artisans.bio",
      "artisans.workshop_location",
      "artisans.photo",
      "artisans.photo_key",
    ],
    filters: { slug },
  })

  const row = (data as unknown as Array<Record<string, unknown>>)[0]

  if (!row || row.is_active === false) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Destination '${slug}' not found`
    )
  }

  const { products, artisans, ...destination } = row as typeof row & {
    products?: { id: string }[]
    artisans?: Array<Record<string, unknown>>
  }

  res.json({
    destination: {
      ...destination,
      hero_image:
        typeof destination.hero_image_key === "string" && destination.hero_image_key
          ? getStoreMediaUrl(destination.hero_image_key)
          : destination.hero_image,
      artisans: (artisans ?? []).map((artisan) => ({
        ...artisan,
        photo:
          typeof artisan.photo_key === "string" && artisan.photo_key
            ? getStoreMediaUrl(artisan.photo_key)
            : artisan.photo,
      })),
      product_ids: (products ?? []).map((p) => p.id),
      product_count: (products ?? []).length,
    },
  })
}
