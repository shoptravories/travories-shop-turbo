import { Metadata } from "next"
import { notFound } from "next/navigation"

import { getDestinationBySlug } from "@lib/data/destinations"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductPreview from "@modules/products/components/product-preview"

type Props = {
  params: Promise<{ countryCode: string; slug: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params
  const destination = await getDestinationBySlug(slug)

  if (!destination) {
    return { title: "Destination not found" }
  }

  return {
    title: `${destination.name} | Nepal Souvenirs`,
    description:
      destination.tagline ??
      `Hand-made souvenirs from ${destination.name}, Nepal.`,
  }
}

export default async function DestinationPage(props: Props) {
  const { countryCode, slug } = await props.params

  const [destination, region] = await Promise.all([
    getDestinationBySlug(slug),
    getRegion(countryCode),
  ])

  if (!destination || !region) {
    notFound()
  }

  // Products are fetched through the standard products endpoint using the IDs
  // resolved from the module link, so region pricing and VAT inclusivity come
  // from the core rather than being reimplemented here.
  const products = destination.product_ids.length
    ? await listProducts({
        countryCode,
        queryParams: { id: destination.product_ids, limit: 100 },
      }).then(({ response }) => response.products)
    : []

  const artisans = destination.artisans ?? []

  return (
    <>
      <section className="bg-brand-navy text-brand-paper">
        <div className="content-container py-14 small:py-20">
          <LocalizedClientLink
            href="/destinations"
            className="text-small-regular text-brand-paper/60 hover:text-brand-paper transition-colors duration-150"
          >
            ← All destinations
          </LocalizedClientLink>

          <div className="mt-6 max-w-3xl">
            {destination.region && (
              <span className="text-xsmall-regular uppercase tracking-[0.22em] text-brand-saffron">
                {destination.region}
              </span>
            )}
            <h1 className="font-playfair text-[34px] small:text-[50px] leading-tight mt-3">
              {destination.name}
            </h1>
            {destination.tagline && (
              <p className="text-large-regular text-brand-paper/80 mt-3">
                {destination.tagline}
              </p>
            )}
          </div>
        </div>
      </section>

      {destination.story && (
        <section className="content-container py-12 small:py-16">
          <div className="max-w-2xl">
            <p className="text-base-regular small:text-large-regular text-ui-fg-subtle leading-relaxed">
              {destination.story}
            </p>

            {destination.travories_url && (
              <a
                href={destination.travories_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-6 text-base-semi text-brand-navy hover:text-brand-terracotta transition-colors duration-150"
              >
                Plan a trip here on Travories →
              </a>
            )}
          </div>
        </section>
      )}

      <section className="content-container pb-16">
        <h2 className="font-playfair text-[26px] text-brand-navy mb-6">
          {products.length
            ? `From ${destination.name}`
            : `Nothing from ${destination.name} yet`}
        </h2>

        {products.length ? (
          <ul
            className="grid grid-cols-2 small:grid-cols-4 gap-x-6 gap-y-8"
            data-testid="destination-products"
          >
            {products.map((product) => (
              <li key={product.id}>
                <ProductPreview product={product} region={region} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-base-regular text-ui-fg-subtle">
            We have not listed anything from here yet. Check back soon.
          </p>
        )}
      </section>

      {artisans.length > 0 && (
        <section className="bg-brand-paper border-t border-ui-border-base">
          <div className="content-container py-12 small:py-16">
            <h2 className="font-playfair text-[26px] text-brand-navy mb-6">
              Makers in {destination.name}
            </h2>
            <div className="grid grid-cols-1 small:grid-cols-3 gap-6">
              {artisans.map((a) => (
                <div
                  key={a.id}
                  className="border border-ui-border-base rounded-large bg-white p-6"
                >
                  <h3 className="text-large-semi text-brand-navy">{a.name}</h3>
                  {a.craft && (
                    <p className="text-small-regular text-brand-terracotta mt-1">
                      {a.craft}
                    </p>
                  )}
                  {a.bio && (
                    <p className="text-base-regular text-ui-fg-subtle mt-3">
                      {a.bio}
                    </p>
                  )}
                  {a.workshop_location && (
                    <p className="text-small-regular text-ui-fg-muted mt-3">
                      {a.workshop_location}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
