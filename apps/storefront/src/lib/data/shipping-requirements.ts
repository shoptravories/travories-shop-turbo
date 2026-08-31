import { sdk } from "@lib/config"
import { getCacheOptions } from "./cookies"

export type RequiredShippingProfile = {
  id: string
  name: string
  product_titles: string[]
}

/**
 * The distinct shipping profiles a cart's items require.
 *
 * Medusa refuses to complete a cart unless every required profile has a
 * shipping method. The store API does not expose a product's profile, so this
 * comes from a custom route.
 */
export const getCartShippingRequirements = async (
  cartId: string
): Promise<RequiredShippingProfile[]> => {
  const next = { ...(await getCacheOptions("shipping-requirements")) }

  return sdk.client
    .fetch<{ required_profiles: RequiredShippingProfile[]; count: number }>(
      "/store/cart-shipping-requirements",
      { query: { cart_id: cartId }, next, cache: "no-store" }
    )
    .then(({ required_profiles }) => required_profiles)
    .catch(() => [])
}
