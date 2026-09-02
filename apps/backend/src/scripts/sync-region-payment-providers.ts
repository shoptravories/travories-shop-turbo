import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { updateRegionsWorkflow } from "@medusajs/medusa/core-flows"

/**
 * One-off correction for databases seeded before a payment provider was added
 * to medusa-config.ts. createRegionsWorkflow only applies `payment_providers`
 * when the region is CREATED, so a provider registered later never reaches an
 * existing region and stays invisible at checkout even though the backend
 * loaded it happily.
 *
 * Idempotent - it only writes when a region's provider set actually differs.
 * Run with:
 *   npx medusa exec ./src/scripts/sync-region-payment-providers.ts
 */

/**
 * Gateways that settle in NPR only, mirroring assertNprCurrency() in
 * modules/payment-nepal/lib/amount.ts. Attaching one to a non-NPR region would
 * offer a payment method that throws the moment a customer picks it.
 */
const NPR_ONLY_PROVIDERS = new Set(["pp_esewa_esewa"])

export default async function syncRegionPaymentProviders({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const paymentService = container.resolve(Modules.PAYMENT)

  // Ask the running backend what it actually registered rather than re-reading
  // the env vars. eSewa only appears here when medusa-config.ts registered it,
  // which is precisely the condition for offering it - so there is no second
  // copy of that condition to keep in sync.
  const providers = await paymentService.listPaymentProviders({
    is_enabled: true,
  })

  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "name", "currency_code", "payment_providers.id"],
  })

  for (const region of regions) {
    const desired = providers
      .map((provider) => provider.id)
      .filter(
        (id) =>
          !NPR_ONLY_PROVIDERS.has(id) || region.currency_code === "npr"
      )
      .sort()

    const current = (region.payment_providers ?? [])
      .flatMap((provider) => (provider?.id ? [provider.id] : []))
      .sort()

    if (current.join(",") === desired.join(",")) {
      logger.info(`${region.name}: unchanged (${current.join(", ") || "none"})`)
      continue
    }

    await updateRegionsWorkflow(container).run({
      input: {
        selector: { id: region.id },
        update: { payment_providers: desired },
      },
    })

    logger.info(
      `${region.name}: ${current.join(", ") || "none"} -> ${desired.join(", ")}`
    )
  }
}
