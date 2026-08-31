import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { updatePricePreferencesWorkflow } from "@medusajs/medusa/core-flows"

// One-off correction for databases seeded before tax-inclusive pricing was
// set in the seed. Safe to re-run.
export default async function setTaxInclusive({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const { data: preferences } = await query.graph({
    entity: "price_preference",
    fields: ["id", "attribute", "value", "is_tax_inclusive"],
  })

  await updatePricePreferencesWorkflow(container).run({
    input: {
      selector: { id: preferences.map((p) => p.id) },
      update: { is_tax_inclusive: true },
    },
  })

  for (const p of preferences) {
    logger.info(`  ${p.attribute}=${p.value} -> tax inclusive`)
  }
}
