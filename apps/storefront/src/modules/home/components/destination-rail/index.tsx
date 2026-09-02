import { listDestinations } from "@lib/data/destinations"
import CraftMotif from "@modules/common/components/craft-motif"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import SectionHeading from "@modules/common/components/section-heading"
import { Stagger, StaggerItem } from "@modules/common/components/stagger"
import Image from "next/image"

/**
 * The souvenir pillar's front door. Destinations scroll horizontally on
 * phones and settle into a grid on desktop, so the row never collapses into
 * unreadably narrow cards.
 */
const DestinationRail = async () => {
  const destinations = await listDestinations()

  if (!destinations.length) {
    return null
  }

  return (
    <section className="content-container section-y">
      <SectionHeading
        eyebrow="Shop by place"
        title="Start where you stood"
        description="Every piece is made somewhere. Pick the valley, the lake or the ridge you actually walked."
        href="/destinations"
        linkLabel="All destinations"
      />

      <Stagger
        as="ul"
        className="hide-scrollbar -mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 small:mx-0 small:grid small:grid-cols-3 small:gap-6 small:overflow-visible small:px-0"
      >
        {destinations.map((destination) => (
          <StaggerItem
            as="li"
            key={destination.id}
            className="w-[74vw] shrink-0 snap-start xsmall:w-[46vw] small:w-auto"
          >
            <LocalizedClientLink
              href={`/destinations/${destination.slug}`}
              className="group relative flex h-full min-h-[21rem] flex-col justify-end overflow-hidden rounded-card p-6 text-brand-surface ring-1 ring-inset ring-brand-ink/10 transition-all duration-500 ease-sleek hover:-translate-y-1.5 hover:shadow-[0_28px_56px_-28px_hsl(var(--brand-ink)/0.55)] motion-reduce:transform-none"
              data-testid={`destination-card-${destination.slug}`}
            >
              {destination.hero_image ? (
                <Image
                  src={destination.hero_image}
                  alt={destination.name}
                  fill
                  sizes="(max-width: 1024px) 74vw, 33vw"
                  className="absolute inset-0 object-cover transition-transform duration-[900ms] ease-sleek group-hover:scale-[1.06] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
              ) : (
                <CraftMotif
                  seed={destination.slug}
                  className="transition-transform duration-[900ms] ease-sleek group-hover:scale-[1.06] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
              )}

              {/* Two stops rather than one: a heavy foot so the type always
                  clears its ground, and a light top wash so the image is not
                  cut in half by a hard gradient edge. */}
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-brand-ink/95 via-brand-ink/40 via-48% to-transparent"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-brand-ink/5 transition-opacity duration-300 group-hover:opacity-0"
              />

              {/* Corner affordance - the card is a link, and on a photo the
                  arrow says so faster than the underlined count below. */}
              <span
                aria-hidden
                className="absolute right-5 top-5 flex h-9 w-9 -translate-x-1 items-center justify-center rounded-circle border border-brand-surface/25 bg-brand-ink/25 text-brand-surface opacity-0 backdrop-blur transition-all duration-300 ease-out group-hover:translate-x-0 group-hover:opacity-100 motion-reduce:transition-none"
              >
                &rarr;
              </span>

              <div className="relative">
                {destination.region && (
                  <span className="text-tiny uppercase tracking-[0.18em] text-brand-accent-light">
                    {destination.region}
                  </span>
                )}
                <h3 className="mt-2 text-display text-[27px] small:text-[30px]">
                  {destination.name}
                </h3>
                {destination.tagline && (
                  <p className="mt-2 max-w-[34ch] text-small-regular leading-5 text-brand-surface/75">
                    {destination.tagline}
                  </p>
                )}
                <span className="mt-4 inline-flex items-center gap-x-2 text-xsmall-regular uppercase tracking-[0.14em] text-brand-surface/60">
                  {destination.product_count}{" "}
                  {destination.product_count === 1 ? "piece" : "pieces"}
                </span>
              </div>
            </LocalizedClientLink>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  )
}

export default DestinationRail
