import { Metadata } from "next"

import { listDestinations } from "@lib/data/destinations"
import { JsonLd, breadcrumbSchema, buildSeoMetadata, collectionPageSchema } from "@lib/seo"
import CraftMotif from "@modules/common/components/craft-motif"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Reveal from "@modules/common/components/reveal"
import BrowseHeader from "@modules/store/components/browse-header"
import Image from "next/image"

export async function generateMetadata(props: {
  params: Promise<{ countryCode: string }>
}): Promise<Metadata> {
  const { countryCode } = await props.params

  return await buildSeoMetadata({
    title: "Shop by Destination",
    description:
      "Browse hand-made Nepali souvenirs by the place they came from, including Kathmandu Valley, Pokhara, the Everest region, Chitwan, Lumbini, and Ilam.",
    countryCode,
    path: "/destinations",
    eyebrow: "Shop by place",
  })
}

export default async function DestinationsPage(props: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params
  const destinations = await listDestinations()

  return (
    <>
      <JsonLd
        id="destinations"
        data={[
          collectionPageSchema({
            name: "Destinations",
            description:
              "Hand-made Nepali souvenirs grouped by the place they came from.",
            path: "/destinations",
            countryCode,
          }),
          breadcrumbSchema(
            [
              { name: "Home", path: "/" },
              { name: "Destinations", path: "/destinations" },
            ],
            countryCode
          ),
        ]}
      />

      <BrowseHeader
        eyebrow="Shop by place"
        title="Destinations"
        description="Every piece is made somewhere. Start with the place you travelled, or the one you are still planning."
        crumbs={[{ label: "Shop", href: "/store" }, { label: "Destinations" }]}
        seed="destinations-index"
        motif="peaks"
      />

      <section className="content-container py-12 small:py-16">
        {!destinations.length ? (
          <p className="text-center text-base-regular text-ui-fg-subtle">
            No destinations published yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 xsmall:grid-cols-2 small:grid-cols-3">
            {destinations.map((destination, index) => (
              <Reveal key={destination.id} delay={index * 60} className="h-full">
                <LocalizedClientLink
                  href={`/destinations/${destination.slug}`}
                  className="group relative flex h-full min-h-[20rem] flex-col justify-end overflow-hidden rounded-large border border-ui-border-base p-6 text-brand-surface transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_24px_50px_-28px_hsl(var(--brand-primary-deep)/0.6)] motion-reduce:transform-none"
                  data-testid={`destination-card-${destination.slug}`}
                >
                  {destination.hero_image ? (
                    <Image
                      src={destination.hero_image}
                      alt={destination.name}
                      fill
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      className="absolute inset-0 object-cover transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    />
                  ) : (
                    <CraftMotif
                      seed={destination.slug}
                      className="transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    />
                  )}

                  <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-t from-brand-primary-deep via-brand-primary-deep/70 to-transparent"
                  />

                  <div className="relative">
                    {destination.region && (
                      <span className="text-tiny uppercase tracking-[0.18em] text-brand-accent-light">
                        {destination.region}
                      </span>
                    )}
                    <h2 className="mt-1.5 font-playfair text-[26px] leading-tight">
                      {destination.name}
                    </h2>
                    {destination.tagline && (
                      <p className="mt-2 text-small-regular text-brand-surface/75">
                        {destination.tagline}
                      </p>
                    )}
                    <span className="mt-4 inline-flex items-center gap-x-2 text-xsmall-regular text-brand-surface/60">
                      {destination.product_count}{" "}
                      {destination.product_count === 1 ? "piece" : "pieces"}
                      <span
                        aria-hidden
                        className="transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
                      >
                        &rarr;
                      </span>
                    </span>
                  </div>
                </LocalizedClientLink>
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </>
  )
}
