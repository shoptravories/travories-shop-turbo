import { HttpTypes } from "@medusajs/framework/types"
import type { Pillar, PillarGroup } from "@modules/layout/components/pillar-nav"

type Cat = HttpTypes.StoreProductCategory
type PillarOverride = {
  order: number
  eyebrow?: string
  motif?: "peaks" | "mandala"
  blurb?: string
  blurbHref?: string
}

const PILLAR_OVERRIDES: Record<string, PillarOverride> = {
  souvenirs: {
    order: 0,
    eyebrow: "For travellers",
    motif: "peaks",
    blurb: "Browse every destination",
    blurbHref: "/destinations",
  },
  gifts: {
    order: 1,
    eyebrow: "For gift shoppers",
    motif: "mandala",
    blurb: "See all gifts",
  },
  gear: {
    order: 2,
    eyebrow: "For the trail",
    motif: "peaks",
    blurb: "See all gear",
  },
}

type Metadata = Record<string, unknown> | null | undefined

const parentIdOf = (c: Cat): string | null =>
  c.parent_category?.id ?? (c as { parent_category_id?: string | null }).parent_category_id ?? null

const metadataOf = (category: Cat): Metadata =>
  (category as { metadata?: Metadata }).metadata

const stringMeta = (category: Cat, key: string) => {
  const value = metadataOf(category)?.[key]
  return typeof value === "string" && value.trim() ? value.trim() : undefined
}

const numberMeta = (category: Cat, key: string) => {
  const value = metadataOf(category)?.[key]

  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : undefined
  }

  return undefined
}

const motifMeta = (category: Cat) => {
  const value = stringMeta(category, "pillar_motif")
  return value === "mandala" || value === "peaks" ? value : undefined
}

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
    const aOrder =
      numberMeta(a, "pillar_order") ?? PILLAR_OVERRIDES[a.handle]?.order ?? 100
    const bOrder =
      numberMeta(b, "pillar_order") ?? PILLAR_OVERRIDES[b.handle]?.order ?? 100

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
      eyebrow:
        stringMeta(pillar, "pillar_eyebrow") ?? override?.eyebrow ?? undefined,
      motif: motifMeta(pillar) ?? override?.motif ?? undefined,
      blurb:
        stringMeta(pillar, "pillar_blurb") ??
        override?.blurb ??
        `See all ${pillar.name.toLowerCase()}`,
      blurbHref:
        stringMeta(pillar, "pillar_blurb_href") ?? override?.blurbHref,
      groups,
    }
  })
}
