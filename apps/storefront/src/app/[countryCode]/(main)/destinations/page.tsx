import { Metadata } from "next"

import { listDestinations } from "@lib/data/destinations"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "Destinations | Nepal Souvenirs",
  description:
    "Browse hand-made Nepali souvenirs by the place they came from - Kathmandu Valley, Pokhara, the Everest region, Chitwan, Lumbini and Ilam.",
}

export default async function DestinationsPage() {
  const destinations = await listDestinations()

  return (
    <>
      <section className="bg-brand-navy text-brand-paper">
        <div className="content-container py-16 small:py-20 text-center">
          <span className="text-xsmall-regular uppercase tracking-[0.22em] text-brand-saffron">
            Shop by place
          </span>
          <h1 className="font-playfair text-[34px] small:text-[46px] leading-tight mt-4">
            Destinations
          </h1>
          <p className="text-base-regular text-brand-paper/75 max-w-xl mx-auto mt-4">
            Every piece is made somewhere. Start with the place you travelled,
            or the one you are still planning.
          </p>
        </div>
      </section>

      <section className="content-container py-12 small:py-16">
        {!destinations.length ? (
          <p className="text-base-regular text-ui-fg-subtle text-center">
            No destinations published yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 xsmall:grid-cols-2 small:grid-cols-3 gap-6">
            {destinations.map((d) => (
              <LocalizedClientLink
                key={d.id}
                href={`/destinations/${d.slug}`}
                className="group flex flex-col justify-between border border-ui-border-base rounded-large bg-white p-6 hover:border-brand-terracotta transition-colors duration-200"
                data-testid={`destination-card-${d.slug}`}
              >
                <div>
                  {d.region && (
                    <span className="text-xsmall-regular uppercase tracking-[0.16em] text-brand-terracotta">
                      {d.region}
                    </span>
                  )}
                  <h2 className="font-playfair text-[24px] leading-tight text-brand-navy mt-2">
                    {d.name}
                  </h2>
                  {d.tagline && (
                    <p className="text-base-regular text-ui-fg-subtle mt-2">
                      {d.tagline}
                    </p>
                  )}
                </div>
                <span className="text-small-regular text-ui-fg-muted mt-6">
                  {d.product_count}{" "}
                  {d.product_count === 1 ? "piece" : "pieces"}
                </span>
              </LocalizedClientLink>
            ))}
          </div>
        )}
      </section>
    </>
  )
}
