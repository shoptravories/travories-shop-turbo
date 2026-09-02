import { MedusaContainer } from "@medusajs/framework"
import {
  ContainerRegistrationKeys,
  MedusaError,
  ProductStatus,
} from "@medusajs/framework/utils"
import { createProductsWorkflow } from "@medusajs/medusa/core-flows"

/**
 * Creates the gift card product with its denominations.
 *
 * Idempotent - skips entirely if the handle already exists. Run after the main
 * seed, with:
 *   npx medusa exec ./src/scripts/seed-gift-card.ts
 *
 * SCOPE - read before promising customers a gift card.
 *
 * Medusa 2.19 carries `is_giftcard` on products and propagates it to line items
 * and orders, so a gift card can be listed, priced and BOUGHT with everything
 * the store already does. It ships no balance ledger and no redemption flow:
 * there are no gift-card workflows in @medusajs/core-flows and no gift-card
 * module. Buying one is native; spending one is not.
 *
 * Until redemption is built, an order containing this product has to be settled
 * out of band - issue the recipient a promotion code for the denomination and
 * apply it at checkout via POST /store/carts/:id/promotions. That is a manual
 * step per order and a single-use code is not a balance, so a partial redemption
 * loses the remainder.
 */

// Roughly in line with the catalogue's NPR-to-USD ratio (about 132:1).
const DENOMINATIONS = [
  { label: "NPR 2,000", sku: "GIFT-2000", npr: 2000, usd: 15 },
  { label: "NPR 5,000", sku: "GIFT-5000", npr: 5000, usd: 38 },
  { label: "NPR 10,000", sku: "GIFT-10000", npr: 10000, usd: 75 },
]

const HANDLE = "gift-card"

export default async function seedGiftCard({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const { data: existing } = await query.graph({
    entity: "product",
    fields: ["id"],
    filters: { handle: HANDLE },
  })

  if (existing.length) {
    logger.info(`Product "${HANDLE}" already exists, nothing to do.`)
    return
  }

  const { data: salesChannels } = await query.graph({
    entity: "sales_channel",
    fields: ["id", "name"],
  })

  if (!salesChannels.length) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "No sales channel found. Run the initial data seed before this script."
    )
  }

  // Never hardcode a shipping profile - resolve it, so this keeps working when
  // profiles change or a second seller adds their own.
  const { data: shippingProfiles } = await query.graph({
    entity: "shipping_profile",
    fields: ["id", "type"],
  })

  const defaultProfile =
    shippingProfiles.find((p: { type: string }) => p.type === "default") ??
    shippingProfiles[0]

  if (!defaultProfile) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "No shipping profile found. Run the initial data seed before this script."
    )
  }

  await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: "Gift Card",
          handle: HANDLE,
          is_giftcard: true,
          description:
            "A gift card for the store, redeemable against anything in the catalogue. Delivered by email to the recipient.",
          // DRAFT on purpose. Everything below is correct and ready, but a
          // published gift card is a promise the store cannot yet keep: there
          // is no redemption. Flip to PUBLISHED once redemption exists.
          status: ProductStatus.DRAFT,
          // Nothing ships, but product creation requires a profile.
          shipping_profile_id: defaultProfile.id,
          options: [
            {
              title: "Denomination",
              values: DENOMINATIONS.map((d) => d.label),
            },
          ],
          variants: DENOMINATIONS.map((d) => ({
            title: d.label,
            sku: d.sku,
            options: { Denomination: d.label },
            // A gift card is not stock; without this every purchase would
            // decrement an inventory item that does not exist.
            manage_inventory: false,
            prices: [
              { currency_code: "npr", amount: d.npr },
              { currency_code: "usd", amount: d.usd },
            ],
          })),
          sales_channels: salesChannels.map((c: { id: string }) => ({
            id: c.id,
          })),
        },
      ],
    },
  })

  logger.info(
    `Created "${HANDLE}" with ${DENOMINATIONS.length} denominations. ` +
      "Redemption is NOT implemented - see the note at the top of this script."
  )
}
