import { Metadata } from "next"

import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"
import { buildPillars } from "@lib/util/pillars"
import FeaturedProducts from "@modules/home/components/featured-products"
import Hero from "@modules/home/components/hero"
import PillarSplit from "@modules/home/components/pillar-split"

export const metadata: Metadata = {
  title: "Nepal Souvenirs and Gifts | by Travories",
  description:
    "Hand-made souvenirs and gifts from Nepal, sourced from local artisans and shipped from Kathmandu. Shop by destination or find a gift by occasion.",
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params

  const { countryCode } = params

  const [region, { collections }, categories] = await Promise.all([
    getRegion(countryCode),
    listCollections({ fields: "id, handle, title" }),
    listCategories().catch(() => []),
  ])

  if (!collections || !region) {
    return null
  }

  const pillars = buildPillars(categories ?? [])

  return (
    <>
      <Hero />
      <PillarSplit pillars={pillars} />
      <div className="pb-12">
        <ul className="flex flex-col gap-x-6">
          <FeaturedProducts collections={collections} region={region} />
        </ul>
      </div>
    </>
  )
}
