import {
  addToCartWorkflow,
  updateLineItemInCartWorkflow,
} from "@medusajs/medusa/core-flows"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"
import { MedusaContainer } from "@medusajs/framework"

/**
 * Personalisation / engraving.
 *
 * The storefront sends the text as line item metadata on the standard endpoint:
 *
 *   sdk.store.cart.createLineItem(cartId, {
 *     variant_id, quantity: 1, metadata: { engraving: "For Aama, 2026" },
 *   })
 *
 * Metadata flows from cart line item to order line item on its own, so
 * fulfilment sees the text in the admin order detail with no extra work. What
 * does NOT happen on its own is validation - without this any string of any
 * length reaches the workshop, on any product.
 *
 * Registered as workflow `validate` hooks rather than checks in a route: they
 * run inside the workflow, before any mutation, so a rejected engraving leaves
 * no partial cart behind.
 *
 * BOTH entry points are guarded. Hooking only addToCartWorkflow leaves a hole:
 * a customer can add an item clean and then PATCH the engraving on through
 * `POST /store/carts/:id/line-items/:item_id`, which runs a different workflow.
 * That was verified to put a 192-character engraving on a silk shawl and carry
 * it all the way onto a completed order.
 */

export const ENGRAVING_MAX_LENGTH = 40

/**
 * Pure rule, exported so it can be unit-tested without a container.
 * Returns the normalised text, or undefined when no engraving was requested.
 */
export function normaliseEngraving(value: unknown): string | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined
  }

  if (typeof value !== "string") {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Engraving must be text"
    )
  }

  const text = value.trim()

  if (!text.length) {
    return undefined
  }

  if (text.length > ENGRAVING_MAX_LENGTH) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Engraving must be ${ENGRAVING_MAX_LENGTH} characters or fewer`
    )
  }

  return text
}

type EngravableProduct = {
  id: string
  title: string
  metadata?: Record<string, unknown> | null
}

type EngravingCandidate = {
  variant_id?: string
  metadata?: Record<string, unknown> | null
}

/**
 * Validates every candidate that carries an engraving.
 *
 * Validation runs against the TRIMMED text, so "  ok  " is not rejected for
 * length. It cannot rewrite what gets stored: a `validate` hook receives a copy
 * of the workflow input, so mutating metadata here is silently discarded
 * (verified). The raw client string is what lands on the line item, and
 * trimming therefore belongs in the caller - see the storefront's addToCart.
 */
async function assertEngravingsAllowed(
  container: MedusaContainer,
  candidates: EngravingCandidate[]
) {
  const engraved: { candidate: EngravingCandidate }[] = []

  for (const candidate of candidates) {
    // Throws on an over-long or non-string engraving.
    if (normaliseEngraving(candidate.metadata?.engraving) !== undefined) {
      engraved.push({ candidate })
    }
  }

  if (!engraved.length) {
    return
  }

  const variantIds = [
    ...new Set(
      engraved
        .map(({ candidate }) => candidate.variant_id)
        .filter((id): id is string => Boolean(id))
    ),
  ]

  if (!variantIds.length) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "An engraving can only be added to a product variant"
    )
  }

  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  // product is a same-module relation of product_variant, so this needs no
  // cross-module filtering.
  const { data: variants } = await query.graph({
    entity: "product_variant",
    fields: ["id", "product.id", "product.title", "product.metadata"],
    filters: { id: variantIds },
  })

  const productByVariant = new Map<string, EngravableProduct | undefined>(
    (variants as unknown as { id: string; product?: EngravableProduct }[]).map(
      (v) => [v.id, v.product]
    )
  )

  for (const { candidate } of engraved) {
    const product = productByVariant.get(candidate.variant_id!)

    if (product?.metadata?.engravable !== true) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `${product?.title ?? "This product"} cannot be engraved`
      )
    }
  }
}

addToCartWorkflow.hooks.validate(async ({ input }, { container }) => {
  const items = (input.items ?? []) as EngravingCandidate[]
  await assertEngravingsAllowed(container, items)
})

updateLineItemInCartWorkflow.hooks.validate(async ({ input }, { container }) => {
  const metadata = (input.update ?? {}).metadata as
    | Record<string, unknown>
    | null
    | undefined

  // Nothing to check unless this update actually carries an engraving.
  if (normaliseEngraving(metadata?.engraving) === undefined) {
    return
  }

  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  // The update input has no variant_id, so resolve it from the cart. Reading
  // the cart rather than a line-item entity keeps this working regardless of
  // how the line item table is named internally.
  const { data: carts } = await query.graph({
    entity: "cart",
    fields: ["id", "items.id", "items.variant_id"],
    filters: { id: input.cart_id },
  })

  const cart = (carts as unknown as {
    items?: { id: string; variant_id?: string }[]
  }[])[0]

  const lineItem = (cart?.items ?? []).find((i) => i.id === input.item_id)

  if (!lineItem) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "Line item not found in cart"
    )
  }

  await assertEngravingsAllowed(container, [
    { variant_id: lineItem.variant_id, metadata },
  ])
})
