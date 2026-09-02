import { MedusaContainer } from "@medusajs/framework"
import {
  ContainerRegistrationKeys,
  MedusaError,
  Modules,
} from "@medusajs/framework/utils"
import { SOUVENIR_MODULE } from "../modules/souvenir"

/**
 * Seeds real artisans and links each to the products they make.
 *
 * Idempotent - re-running updates existing artisans in place and skips links
 * that are already there. Run with:
 *   npx medusa exec ./src/scripts/seed-artisans.ts
 *
 * ARTISANS IS DELIBERATELY EMPTY. Every entry here becomes a provenance claim
 * on a store selling hand-made goods, so the names, workshops and biographies
 * must come from real people who agreed to appear. Fill it in from source
 * material; do not invent entries to make the section render.
 *
 * The destination page already renders its "Makers in ..." section the moment
 * artisans exist, so no frontend change is needed once this is populated.
 */

type ArtisanSeed = {
  name: string
  slug: string
  craft?: string
  bio?: string
  workshop_location?: string
  photo?: string
  photo_key?: string
  /** Must match a slug seeded by seed-destinations.ts. */
  destination_slug: string
  /** Product handles this artisan makes, as seeded by initial-data-seed.ts. */
  product_handles: string[]
}

const ARTISANS: ArtisanSeed[] = []

type ArtisanRow = { id: string; slug: string; products?: { id: string }[] }

export default async function seedArtisans({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const souvenirService: any = container.resolve(SOUVENIR_MODULE)

  if (!ARTISANS.length) {
    logger.info(
      "No artisans defined - nothing to seed. Populate ARTISANS in " +
        "src/scripts/seed-artisans.ts with real makers before running this."
    )
    return
  }

  const destinations = await souvenirService.listDestinations({})
  const destinationIdBySlug = new Map<string, string>(
    destinations.map((d: { slug: string; id: string }) => [d.slug, d.id])
  )

  // Fail before writing anything rather than half-seeding on a typo.
  const unknownDestinations = [
    ...new Set(
      ARTISANS.map((a) => a.destination_slug).filter(
        (slug) => !destinationIdBySlug.has(slug)
      )
    ),
  ]
  if (unknownDestinations.length) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Unknown destination slugs: ${unknownDestinations.join(", ")}. ` +
        "Run seed-destinations.ts first, or fix the slugs."
    )
  }

  // Links already in place, read from the artisan side so a re-run does not
  // duplicate them.
  const { data: linkedState } = await query.graph({
    entity: "artisan",
    fields: ["id", "slug", "products.id"],
  })
  const linkedProductIds = new Map<string, Set<string>>(
    (linkedState as unknown as ArtisanRow[]).map((a) => [
      a.id,
      new Set((a.products ?? []).map((p) => p.id)),
    ])
  )

  let created = 0
  let updated = 0
  let linked = 0
  let alreadyLinked = 0

  for (const seed of ARTISANS) {
    const { destination_slug, product_handles, ...fields } = seed
    const destination_id = destinationIdBySlug.get(destination_slug)!

    const [existing] = await souvenirService.listArtisans({ slug: fields.slug })

    let artisan: { id: string }
    if (existing) {
      artisan = await souvenirService.updateArtisans({
        id: existing.id,
        ...fields,
        destination_id,
      })
      updated++
    } else {
      artisan = await souvenirService.createArtisans({
        ...fields,
        destination_id,
      })
      created++
    }

    const { data: products } = await query.graph({
      entity: "product",
      fields: ["id", "handle"],
      filters: { handle: product_handles },
    })

    const found = new Set(products.map((p: { handle: string }) => p.handle))
    const missing = product_handles.filter((h) => !found.has(h))
    if (missing.length) {
      logger.warn(
        `  ${fields.name}: unknown product handles skipped - ${missing.join(", ")}`
      )
    }

    const seen = linkedProductIds.get(artisan.id) ?? new Set<string>()

    for (const product of products) {
      if (seen.has(product.id)) {
        alreadyLinked++
        continue
      }

      // Order must match defineLink: product first, then artisan.
      await link.create({
        [Modules.PRODUCT]: { product_id: product.id },
        [SOUVENIR_MODULE]: { artisan_id: artisan.id },
      })
      linked++
    }

    logger.info(`  ${fields.name}: ${products.length} products`)
  }

  logger.info(
    `Finished. ${created} created, ${updated} updated, ` +
      `${linked} new links, ${alreadyLinked} already in place.`
  )
}
