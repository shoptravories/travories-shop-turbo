import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { getStoreMediaUrl } from "../../../lib/store-media"

/**
 * GET /store/destinations
 *
 * Lists active destinations with the number of products linked to each,
 * ordered by rank. Public route - the SDK supplies the publishable key.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data } = await query.graph({
    entity: "destination",
    fields: [
      "id",
      "name",
      "slug",
      "category_handle",
      "region",
      "tagline",
      "hero_image",
      "hero_image_key",
      "latitude",
      "longitude",
      "travories_url",
      "rank",
      "is_active",
      "products.id",
    ],
    filters: { is_active: true },
  })

  const rows = data as unknown as Array<
    Record<string, unknown> & { rank: number; products?: { id: string }[] }
  >

  const destinations = rows
    .map(({ products, ...destination }) => ({
      ...destination,
      hero_image:
        typeof destination.hero_image_key === "string" && destination.hero_image_key
          ? getStoreMediaUrl(destination.hero_image_key)
          : destination.hero_image,
      product_count: (products ?? []).length,
    }))
    .sort((a, b) => a.rank - b.rank)

  res.json({ destinations, count: destinations.length })
}
