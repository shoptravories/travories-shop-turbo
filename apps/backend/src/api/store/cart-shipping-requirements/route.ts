import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"

type CartRow = { id: string; items?: { product_id: string | null }[] }
type ProductRow = {
  id: string
  title: string
  shipping_profile?: { id: string; name: string } | null
}

/**
 * GET /store/cart-shipping-requirements?cart_id=cart_123
 *
 * Returns the distinct shipping profiles the cart's items require.
 *
 * Medusa refuses to complete a cart unless every required profile has a
 * shipping method, but the store API exposes a product's profile only through
 * a link - not as a field on the product or line item. Without this the
 * storefront cannot know that a mixed fragile/standard cart needs two methods.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const cartId = typeof req.query.cart_id === "string" ? req.query.cart_id : ""

  if (!cartId) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "cart_id query parameter is required"
    )
  }

  const { data: carts } = await query.graph({
    entity: "cart",
    fields: ["id", "items.product_id"],
    filters: { id: cartId },
  })

  const cart = (carts as unknown as CartRow[])[0]

  if (!cart) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Cart not found")
  }

  const productIds = [
    ...new Set(
      (cart.items ?? [])
        .map((i) => i.product_id)
        .filter((id): id is string => Boolean(id))
    ),
  ]

  if (!productIds.length) {
    res.json({ required_profiles: [], count: 0 })
    return
  }

  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "title", "shipping_profile.id", "shipping_profile.name"],
    filters: { id: productIds },
  })

  const byProfile = new Map<string, { id: string; name: string; product_titles: string[] }>()

  for (const p of products as unknown as ProductRow[]) {
    const profile = p.shipping_profile
    if (!profile?.id) {
      continue
    }
    const entry = byProfile.get(profile.id) ?? {
      id: profile.id,
      name: profile.name,
      product_titles: [],
    }
    entry.product_titles.push(p.title)
    byProfile.set(profile.id, entry)
  }

  const required = [...byProfile.values()]

  res.json({ required_profiles: required, count: required.length })
}
