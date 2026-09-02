import { MedusaContainer } from "@medusajs/framework"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"
import { SOUVENIR_MODULE } from "../modules/souvenir"

/**
 * Attaches hero imagery and the cross-sell link back to the parent marketplace
 * for destinations that already exist.
 *
 * Idempotent - only the fields given are written, so this can be run once with
 * hero images and again later with trek URLs. Run with:
 *   npx medusa exec ./src/scripts/update-destinations.ts
 *
 * UPDATES IS DELIBERATELY EMPTY.
 *   - hero_image_key is preferred for Garage-backed private media. Upload via
 *     POST /admin/media/upload-url and paste the returned key here.
 *   - hero_image remains as a fallback for already-public URLs.
 *   - travories_url must be a real trek or tour page on travories.com. A
 *     guessed URL renders as a working link to a 404, which is worse than the
 *     link being absent.
 *
 * Partial data degrades cleanly: the storefront renders the
 * "Plan a trip here on Travories" link only when travories_url is set.
 */

type DestinationUpdate = {
  /** Must match a slug seeded by seed-destinations.ts. */
  slug: string
  hero_image?: string
  hero_image_key?: string
  travories_url?: string
}

const UPDATES: DestinationUpdate[] = []

export default async function updateDestinations({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const souvenirService: any = container.resolve(SOUVENIR_MODULE)

  if (!UPDATES.length) {
    logger.info(
      "No destination updates defined - nothing to do. Populate UPDATES in " +
        "src/scripts/update-destinations.ts with media keys/URLs and trek links."
    )
    return
  }

  const destinations = await souvenirService.listDestinations({})
  const idBySlug = new Map<string, string>(
    destinations.map((d: { slug: string; id: string }) => [d.slug, d.id])
  )

  // Fail before writing anything rather than silently skipping a typo.
  const unknown = UPDATES.map((u) => u.slug).filter((s) => !idBySlug.has(s))
  if (unknown.length) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Unknown destination slugs: ${unknown.join(", ")}. ` +
        "Run seed-destinations.ts first, or fix the slugs."
    )
  }

  for (const { slug, ...data } of UPDATES) {
    if (!Object.keys(data).length) {
      logger.warn(`  ${slug}: no fields to update, skipping`)
      continue
    }

    await souvenirService.updateDestinations({ id: idBySlug.get(slug)!, ...data })
    logger.info(`  ${slug}: updated ${Object.keys(data).join(", ")}`)
  }

  logger.info(`Finished. ${UPDATES.length} destinations processed.`)
}
