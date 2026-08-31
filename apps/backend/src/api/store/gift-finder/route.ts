import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

type CategoryRow = {
  id: string
  handle: string
  products?: { id: string }[]
}

/**
 * GET /store/gift-finder?recipient=for-her&occasion=birthday
 *
 * Returns the products matching ALL supplied facets. The store products
 * endpoint treats repeated category_id as OR, so the intersection is resolved
 * here instead - queried from the category side, where `products` is a
 * same-module relation and needs no cross-module filtering.
 *
 * Pricing is deliberately not resolved here. The storefront fetches these IDs
 * through the standard products endpoint so region pricing and VAT inclusivity
 * come from the core.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const asHandle = (value: unknown) =>
    typeof value === "string" && value.length ? value : undefined

  const recipient = asHandle(req.query.recipient)
  const occasion = asHandle(req.query.occasion)
  const facets = [recipient, occasion].filter(Boolean) as string[]

  if (!facets.length) {
    res.json({ product_ids: [], count: 0, facets: {} })
    return
  }

  const sets: (Set<string> | null)[] = []

  for (const handle of facets) {
    const { data } = await query.graph({
      entity: "product_category",
      fields: ["id", "handle", "products.id"],
      filters: { handle },
    })

    const row = (data as unknown as CategoryRow[])[0]
    sets.push(row ? new Set((row.products ?? []).map((p) => p.id)) : null)
  }

  // An unknown handle means no such category, so nothing can match.
  if (sets.some((s) => s === null)) {
    res.json({
      product_ids: [],
      count: 0,
      facets: { recipient, occasion },
      unknown_facet: true,
    })
    return
  }

  const [first, ...rest] = sets as Set<string>[]
  const intersection = [...first].filter((id) => rest.every((s) => s.has(id)))

  res.json({
    product_ids: intersection,
    count: intersection.length,
    facets: { recipient, occasion },
  })
}
