import { HttpTypes } from "@medusajs/types"
import type { Pillar, PillarGroup } from "@modules/layout/components/pillar-nav"

/**
 * The two top-level pillars this store is organised around. Souvenirs are
 * browsed by where they came from, gifts by who they are for and why.
 * Handles match the seeded top-level categories.
 */
export const PILLARS = [
  {
    handle: "souvenirs",
    blurb: "Browse every destination",
    blurbHref: "/destinations",
  },
  { handle: "gifts", blurb: "See all gifts" },
] as const

type Cat = HttpTypes.StoreProductCategory

const parentIdOf = (c: Cat): string | null =>
  c.parent_category?.id ?? (c as { parent_category_id?: string | null }).parent_category_id ?? null

/**
 * Builds the pillar menu structure from a flat category list. Depth is derived
 * from parent ids rather than relying on how many levels of `category_children`
 * the API happened to populate.
 *
 * A pillar whose children have their own children (Gifts) renders as grouped
 * columns; one whose children are leaves (Souvenirs) renders as a flat list.
 */
export const buildPillars = (categories: Cat[]): Pillar[] => {
  const childrenOf = new Map<string | null, Cat[]>()

  for (const c of categories) {
    const pid = parentIdOf(c)
    const bucket = childrenOf.get(pid) ?? []
    bucket.push(c)
    childrenOf.set(pid, bucket)
  }

  const toLink = (c: Cat) => ({ id: c.id, name: c.name, handle: c.handle })

  return PILLARS.flatMap(({ handle, blurb, ...rest }) => {
    const pillar = categories.find((c) => c.handle === handle)
    if (!pillar) {
      return []
    }

    const children = childrenOf.get(pillar.id) ?? []
    const grouped = children.some((c) => (childrenOf.get(c.id) ?? []).length > 0)

    const groups: PillarGroup[] = grouped
      ? children.map((c) => ({
          title: c.name,
          handle: c.handle,
          items: (childrenOf.get(c.id) ?? []).map(toLink),
        }))
      : [{ title: null, handle: null, items: children.map(toLink) }]

    return [
      {
        name: pillar.name,
        handle: pillar.handle,
        blurb,
        blurbHref: (rest as { blurbHref?: string }).blurbHref,
        groups,
      },
    ]
  })
}
