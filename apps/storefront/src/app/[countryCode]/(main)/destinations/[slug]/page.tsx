import { Metadata } from "next"
import { notFound } from "next/navigation"

import { getDestinationBySlug } from "@lib/data/destinations"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { buildSeoMetadata } from "@lib/seo"
import ProductPreview from "@modules/products/components/product-preview"
import Reveal from "@modules/common/components/reveal"
import SectionHeading from "@modules/common/components/section-heading"
import BrowseHeader from "@modules/store/components/browse-header"

type Props = {
  params: Promise<{ countryCode: string; slug: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { countryCode, slug } = await props.params
  const destination = await getDestinationBySlug(slug)

  if (!destination) {
    return buildSeoMetadata({
      title: "Destination not found",
      countryCode,
      path: `/destinations/${slug}`,
      noIndex: true,
    })
  }

  return buildSeoMetadata({
    title: destination.name,
    description:
      destination.tagline ??
      `Hand-made souvenirs from ${destination.name}, Nepal.`,
    countryCode,
    path: `/destinations/${slug}`,
    image: destination.hero_image ?? null,
    keywords: [
      `${destination.name} souvenirs`,
      `${destination.name} Nepal gifts`,
      `shop ${destination.name}`,
    ],
  })
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
      <BrowseHeader
        eyebrow={destination.region ?? undefined}
        title={destination.name}
        description={destination.tagline}
        crumbs={[
          { label: "Shop", href: "/store" },
          { label: "Destinations", href: "/destinations" },
        ]}
        seed={destination.slug}
      />

      {destination.story && (
        <Reveal>
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
                className="inline-block mt-6 text-base-semi text-brand-primary hover:text-brand-accent transition-colors duration-150"
              >
                Plan a trip here on Travories →
              </a>
            )}
          </div>
        </section>
        </Reveal>
      )}

      <Reveal delay={60}>
      <section className="content-container pb-16">
        <SectionHeading
          eyebrow="Made here"
          title={
            products.length
              ? `From ${destination.name}`
              : `Nothing from ${destination.name} yet`
          }
        />

        {products.length ? (
          <ul
            className="grid grid-cols-2 gap-x-4 gap-y-8 small:grid-cols-4 small:gap-x-6"
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
      </Reveal>

      {artisans.length > 0 && (
        <section className="bg-brand-surface border-t border-ui-border-base">
          <div className="content-container py-12 small:py-16">
            <SectionHeading
              eyebrow="The people behind it"
              title={`Makers in ${destination.name}`}
            />
            <div className="grid grid-cols-1 small:grid-cols-3 gap-6">
              {artisans.map((a) => (
                <div
                  key={a.id}
                  className="border border-ui-border-base rounded-large bg-white p-6"
                >
                  <h3 className="text-large-semi text-brand-primary">{a.name}</h3>
                  {a.craft && (
                    <p className="text-small-regular text-brand-accent mt-1">
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
