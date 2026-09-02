import { Metadata } from "next"

import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"
import { buildSeoMetadata } from "@lib/seo"
import { buildPillars } from "@lib/util/pillars"
import Reveal from "@modules/common/components/reveal"
import AssuranceStrip from "@modules/home/components/assurance-strip"
import CraftStory from "@modules/home/components/craft-story"
import DestinationRail from "@modules/home/components/destination-rail"
import FeaturedProducts from "@modules/home/components/featured-products"
import GiftFinderCta from "@modules/home/components/gift-finder-cta"
import Hero from "@modules/home/components/hero"
import PillarSplit from "@modules/home/components/pillar-split"
import TravoriesBand from "@modules/home/components/travories-band"

export async function generateMetadata(props: {
  params: Promise<{ countryCode: string }>
}): Promise<Metadata> {
  const { countryCode } = await props.params

  return await buildSeoMetadata({
    title: "Souvenirs, Gifts, and Trail Gear from Nepal",
    description:
      "Hand-made souvenirs, gifts, and trail gear from Nepal, sourced from local artisans and shipped from Kathmandu. Shop by destination, gift occasion, or trail use.",
    countryCode,
  })
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params

  const [region, { collections }, categories] = await Promise.all([
    getRegion(countryCode),
    listCollections({ fields: "id, handle, title" }),
    listCategories().catch(() => []),
  ])

  if (!region) {
    return null
  }

  const pillars = buildPillars(categories ?? [])

  /* The page alternates three grounds - ink, white and sand - so no two
     neighbouring bands share a background and the eye keeps a sense of
     progress down the page. */
  return (
    <>
      <Hero />

      <AssuranceStrip />

      <DestinationRail />

      <div className="border-y border-brand-line bg-brand-sand">
        <PillarSplit pillars={pillars} />
      </div>

      {collections?.length ? (
        <div className="py-8 small:py-12">
          <FeaturedProducts collections={collections} region={region} />
        </div>
      ) : null}

      <CraftStory />

      <Reveal>
        <GiftFinderCta />
      </Reveal>

      <TravoriesBand />
    </>
  )
}
