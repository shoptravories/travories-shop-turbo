import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { updateProductsWorkflow } from "@medusajs/medusa/core-flows"

/**
 * Backfills metadata.engravable on the products that can physically take an
 * engraving, for a database that was seeded before the flag existed.
 *
 * Fresh installs get this from initial-data-seed.ts; this script exists so an
 * existing store with real orders in it does not have to be re-seeded. It is
 * idempotent and merges into existing metadata rather than replacing it.
 *
 *   npx medusa exec ./src/scripts/set-engravable.ts
 *
 * Keep this list in step with initial-data-seed.ts. Engraving is refused on any
 * product not flagged here - see src/workflows/hooks/add-to-cart.ts.
 */

// Metal and wood pieces, plus the journal, which is embossed rather than cut.
// Textiles, paper flags, tea and the mala are excluded: there is no surface to
// engrave.
const ENGRAVABLE_HANDLES = [
  "tibetan-singing-bowl",
  "khukuri-knife",
  "lokta-paper-journal",
  "bhaktapur-window-carving",
  "carved-elephant-figurine",
]

type ProductRow = {
  id: string
  handle: string
  metadata?: Record<string, unknown> | null
}

export default async function setEngravable({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const { data } = await query.graph({
    entity: "product",
    fields: ["id", "handle", "metadata"],
    filters: { handle: ENGRAVABLE_HANDLES },
  })

  const products = data as unknown as ProductRow[]

  const found = new Set(products.map((p) => p.handle))
  const missing = ENGRAVABLE_HANDLES.filter((h) => !found.has(h))
  if (missing.length) {
    logger.warn(`  unknown product handles skipped - ${missing.join(", ")}`)
  }

  const toUpdate = products.filter((p) => p.metadata?.engravable !== true)

  if (!toUpdate.length) {
    logger.info("All engravable products already flagged, nothing to do.")
    return
  }

  await updateProductsWorkflow(container).run({
    input: {
      products: toUpdate.map((p) => ({
        id: p.id,
        // Merge: metadata is replaced wholesale on update, so anything already
        // on the product would be dropped by a bare { engravable: true }.
        metadata: { ...(p.metadata ?? {}), engravable: true },
      })),
    },
  })

  for (const p of toUpdate) {
    logger.info(`  ${p.handle}: engravable`)
  }

  logger.info(
    `Finished. ${toUpdate.length} updated, ` +
      `${products.length - toUpdate.length} already flagged.`
  )
}
