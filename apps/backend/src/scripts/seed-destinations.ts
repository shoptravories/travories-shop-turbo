import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { SOUVENIR_MODULE } from "../modules/souvenir"

/**
 * Seeds the six Nepali destinations and links each to the products already
 * sitting in its matching Souvenirs category.
 *
 * Idempotent - re-running skips destinations that already exist and skips
 * links that are already in place. Run with:
 *   npx medusa exec ./src/scripts/seed-destinations.ts
 *
 * Artisans are deliberately NOT seeded. Inventing maker names and biographies
 * would put false provenance on a store that sells hand-made goods. Add real
 * artisans through the admin or a follow-up script.
 */

type DestinationSeed = {
  name: string
  slug: string
  category_handle: string
  region: string
  tagline: string
  story: string
  latitude: number
  longitude: number
  rank: number
}

const DESTINATIONS: DestinationSeed[] = [
  {
    name: "Kathmandu Valley",
    slug: "kathmandu-valley",
    category_handle: "kathmandu-valley",
    region: "Bagmati Province",
    tagline: "Three royal cities and the workshops between them",
    story:
      "The valley holds three former kingdoms - Kathmandu, Patan and Bhaktapur - each with its own Durbar Square. Newar craft traditions have been practised here for centuries: repousse metalwork, lattice wood carving, and thangka painting on cotton canvas. Most of what leaves Nepal as a souvenir was made within a few kilometres of these squares.",
    latitude: 27.7172,
    longitude: 85.324,
    rank: 1,
  },
  {
    name: "Pokhara",
    slug: "pokhara",
    category_handle: "pokhara",
    region: "Gandaki Province",
    tagline: "Lakeside city under the Annapurnas",
    story:
      "Pokhara sits on Phewa Lake with Machhapuchhre and the Annapurna range rising behind it, and is the starting point for most treks into that massif. Wool is the local material: felted slippers, blankets and bags are made here by women's cooperatives, many formed to give returning trekking families a second income.",
    latitude: 28.2096,
    longitude: 83.9856,
    rank: 2,
  },
  {
    name: "Everest Region",
    slug: "everest-region",
    category_handle: "everest-region",
    region: "Solukhumbu, Khumbu",
    tagline: "Sherpa country above the treeline",
    story:
      "The Khumbu is Sherpa homeland and the approach to Sagarmatha, the Nepali name for Everest. Namche Bazaar has been a trading post between Tibet and the lowlands for generations, and Tengboche Monastery sits above it at 3,867 metres. Prayer flags, hand-forged blades and Tibetan-influenced metalwork all come down these trails.",
    latitude: 27.8064,
    longitude: 86.7139,
    rank: 3,
  },
  {
    name: "Chitwan",
    slug: "chitwan",
    category_handle: "chitwan",
    region: "Terai lowlands",
    tagline: "Jungle, grassland and the one-horned rhino",
    story:
      "Chitwan National Park protects sal forest and elephant grass in Nepal's southern lowlands, home to the greater one-horned rhinoceros and Bengal tiger. The Tharu communities who have lived alongside this forest for centuries work in wood and grass - carved animals, woven mats and baskets.",
    latitude: 27.5291,
    longitude: 84.3542,
    rank: 4,
  },
  {
    name: "Lumbini",
    slug: "lumbini",
    category_handle: "lumbini",
    region: "Rupandehi",
    tagline: "Birthplace of the Buddha",
    story:
      "Siddhartha Gautama was born here, and the Maya Devi Temple marks the spot within a UNESCO World Heritage site of monasteries built by Buddhist nations around the world. Devotional craft dominates - rudraksha malas, brass ritual objects and prayer wheels.",
    latitude: 27.4833,
    longitude: 83.2761,
    rank: 5,
  },
  {
    name: "Ilam",
    slug: "ilam",
    category_handle: "ilam",
    region: "Koshi Province",
    tagline: "Tea terraces in the eastern hills",
    story:
      "Ilam's ridges are covered in tea gardens planted in the 1860s, sharing a growing belt and a climate with Darjeeling just across the border. The orthodox black tea produced here is picked in distinct flushes through the year and processed close to where it grows.",
    latitude: 26.9095,
    longitude: 87.9285,
    rank: 6,
  },
]

export default async function seedDestinations({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const souvenirService: any = container.resolve(SOUVENIR_MODULE)

  logger.info("Seeding destinations...")

  const existing = await souvenirService.listDestinations({})
  const existingSlugs = new Set(existing.map((d: { slug: string }) => d.slug))

  const toCreate = DESTINATIONS.filter((d) => !existingSlugs.has(d.slug))

  if (toCreate.length) {
    await souvenirService.createDestinations(toCreate)
    logger.info(`  created ${toCreate.length} destinations`)
  } else {
    logger.info("  all destinations already present, skipping create")
  }

  const destinations = await souvenirService.listDestinations({})

  logger.info("Linking products to destinations...")

  // Which products are already linked, read from the destination side of the
  // link so we do not create duplicates on a re-run.
  const { data: linkedState } = await query.graph({
    entity: "destination",
    fields: ["id", "products.id"],
  })
  // `products` comes from the module link, so it is not on the Destination
  // model's own inferred type - cast at the boundary.
  const linkedRows = linkedState as unknown as Array<{
    id: string
    products?: { id: string }[]
  }>
  const alreadyLinkedIds = new Map<string, Set<string>>(
    linkedRows.map((d) => [
      d.id,
      new Set((d.products ?? []).map((p) => p.id)),
    ])
  )

  let linked = 0
  let alreadyLinked = 0

  for (const destination of destinations) {
    if (!destination.category_handle) {
      continue
    }

    // Queried from the category side: products is a same-module relation of
    // product_category, so this needs no cross-module filtering.
    const { data: categories } = await query.graph({
      entity: "product_category",
      fields: ["id", "handle", "products.id"],
      filters: { handle: destination.category_handle },
    })

    const products = categories[0]?.products ?? []
    const seen = alreadyLinkedIds.get(destination.id) ?? new Set<string>()

    for (const product of products) {
      if (seen.has(product.id)) {
        alreadyLinked++
        continue
      }

      // Order must match defineLink: product first, then destination.
      await link.create({
        [Modules.PRODUCT]: { product_id: product.id },
        [SOUVENIR_MODULE]: { destination_id: destination.id },
      })
      linked++
    }

    logger.info(`  ${destination.name}: ${products.length} products`)
  }

  logger.info(
    `Finished. ${linked} new links, ${alreadyLinked} already in place.`
  )
}
