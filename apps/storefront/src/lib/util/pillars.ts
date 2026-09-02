import { HttpTypes } from "@medusajs/framework/types"
import type { Pillar, PillarGroup } from "@modules/layout/components/pillar-nav"

type Cat = HttpTypes.StoreProductCategory
type PillarOverride = {
  order: number
  blurb?: string
  blurbHref?: string
}

const PILLAR_OVERRIDES: Record<string, PillarOverride> = {
  souvenirs: {
    order: 0,
    blurb: "Browse every destination",
    blurbHref: "/destinations",
  },
  gifts: { order: 1, blurb: "See all gifts" },
  gear: { order: 2, blurb: "See all gear" },
}

const parentIdOf = (c: Cat): string | null =>
  c.parent_category?.id ?? (c as { parent_category_id?: string | null }).parent_category_id ?? null

/**
 * Builds the pillar menu structure from top-level product categories. Any root
 * category created in Medusa admin automatically becomes a storefront pillar,
 * with optional copy/order overrides here for specific handles.
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
  const rootCategories = (childrenOf.get(null) ?? []).sort((a, b) => {
    const aOrder = PILLAR_OVERRIDES[a.handle]?.order ?? 100
    const bOrder = PILLAR_OVERRIDES[b.handle]?.order ?? 100

    if (aOrder !== bOrder) {
      return aOrder - bOrder
    }

    return a.name.localeCompare(b.name)
  })

  return rootCategories.map((pillar) => {
    const override = PILLAR_OVERRIDES[pillar.handle]

    const children = childrenOf.get(pillar.id) ?? []
    const grouped = children.some((c) => (childrenOf.get(c.id) ?? []).length > 0)

    const groups: PillarGroup[] = grouped
      ? children.map((c) => ({
          title: c.name,
          handle: c.handle,
          items: (childrenOf.get(c.id) ?? []).map(toLink),
        }))
      : [{ title: null, handle: null, items: children.map(toLink) }]

    return {
      name: pillar.name,
      handle: pillar.handle,
      blurb: override?.blurb ?? `See all ${pillar.name.toLowerCase()}`,
      blurbHref: override?.blurbHref,
      groups,
    }
  })
}
