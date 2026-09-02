import { listDestinations } from "@lib/data/destinations"
import CraftMotif from "@modules/common/components/craft-motif"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Stagger, StaggerItem } from "@modules/common/components/stagger"
import type { MotifName } from "@modules/common/components/craft-motif"
import Image from "next/image"

const FACTS = [
  { value: "6", label: "Destinations" },
  { value: "100%", label: "Hand-made" },
  { value: "48h", label: "Dispatch from Kathmandu" },
]

/**
 * Three slots for the collage. Positions are fixed so the layout never
 * depends on what the API returns; only the artwork inside them does.
 */
const SLOTS: {
  fallbackSeed: string
  fallbackMotif: MotifName
  /** Placement only - framer-motion owns `transform` on the animated element,
      so a rotate class here would be wiped by the reveal's translateY. */
  position: string
  rotate: string
}[] = [
  {
    fallbackSeed: "pashmina-shawl",
    fallbackMotif: "lattice",
    position: "left-0 top-4 h-56 w-48 medium:h-60 medium:w-52",
    rotate: "-rotate-6",
  },
  {
    fallbackSeed: "himalayan-prayer-flags",
    fallbackMotif: "peaks",
    position: "right-2 top-0 h-64 w-48 medium:h-[17rem] medium:w-52",
    rotate: "rotate-3",
  },
  {
    fallbackSeed: "tibetan-singing-bowl",
    fallbackMotif: "mandala",
    position: "bottom-0 left-[28%] h-52 w-52 medium:h-56 medium:w-56",
    rotate: "-rotate-2",
  },
]

const TILE_CHROME =
  "overflow-hidden rounded-card border border-brand-surface/15 bg-brand-primary-deep shadow-[0_30px_60px_-30px_hsl(var(--brand-ink)/0.95)]"

const Hero = async () => {
  // Real destination photography where it exists, generated craft artwork
  // where it does not - the same fallback the product grid uses.
  const destinations = await listDestinations().catch(() => [])

  const tiles = SLOTS.map((slot, index) => {
    const destination = destinations[index]

    return {
      ...slot,
      key: destination?.slug ?? slot.fallbackSeed,
      image: destination?.hero_image ?? null,
      caption: destination?.name ?? null,
      seed: destination?.slug ?? slot.fallbackSeed,
    }
  })

  return (
    <section className="relative isolate w-full overflow-hidden bg-brand-ink text-brand-surface">
      {/* Ground: two soft light sources rather than a flat block, so the type
          has somewhere to sit behind the collage. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(115%_85%_at_12%_-10%,hsl(var(--brand-primary)/0.62),transparent_62%),radial-gradient(85%_75%_at_102%_4%,hsl(var(--brand-accent)/0.4),transparent_58%)]"
      />
      {/* Settles the light back down into the horizon at the foot. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-brand-ink to-transparent"
      />
      <div aria-hidden className="grain pointer-events-none absolute inset-0" />

      <div className="content-container relative z-10 grid grid-cols-1 items-center gap-12 pb-12 pt-16 small:grid-cols-[1.05fr_0.95fr] small:gap-10 small:pb-10 small:pt-24">
        {/* Above the fold, so this choreographs on mount rather than waiting
            for a scroll that may never come. */}
        <Stagger mode="mount" className="flex flex-col items-start">
          <StaggerItem>
            <span className="inline-flex items-center gap-x-2 rounded-circle border border-brand-surface/20 bg-brand-surface/5 px-3.5 py-1.5 text-xsmall-regular uppercase tracking-[0.2em] text-brand-accent-light backdrop-blur">
              <span
                aria-hidden
                className="h-1.5 w-1.5 rounded-circle bg-brand-accent-light"
              />
              Part of the Travories family
            </span>
          </StaggerItem>

          <StaggerItem>
            <h1 className="mt-6 text-display text-[42px] small:text-[60px] medium:text-[70px]">
              Carry a piece of
              <br />
              {/* The italic overhangs its box, so it needs a little air before
                  the roman word that follows. */}
              <span className="mr-[0.12em] italic text-brand-accent-light">
                Nepal
              </span>{" "}
              home
            </h1>
          </StaggerItem>

          <StaggerItem>
            <p className="mt-5 max-w-md text-base-regular text-brand-surface/70 small:max-w-lg small:text-large-regular">
              Hand-made souvenirs and gifts from the valleys, hills and trails
              you walked. Made by Nepali artisans, packed in Kathmandu, sent
              wherever you are now.
            </p>
          </StaggerItem>

          <StaggerItem className="w-full xsmall:w-auto">
            <div className="mt-8 flex w-full flex-col items-stretch gap-3 xsmall:w-auto xsmall:flex-row xsmall:items-center">
              <LocalizedClientLink
                href="/destinations"
                className="group inline-flex items-center justify-center gap-x-2 rounded-circle bg-brand-surface px-7 py-3.5 text-base-semi text-brand-primary shadow-[0_16px_32px_-18px_hsl(var(--brand-ink)/0.9)] transition-colors duration-200 ease-sleek hover:bg-brand-surface-tint"
                data-testid="hero-souvenirs-cta"
              >
                Shop by destination
                <span
                  aria-hidden
                  className="transition-transform duration-300 ease-sleek group-hover:translate-x-1 motion-reduce:transition-none"
                >
                  &rarr;
                </span>
              </LocalizedClientLink>
              <LocalizedClientLink
                href="/gifts/finder"
                className="rounded-circle border border-brand-surface/30 px-7 py-3.5 text-center text-base-semi text-brand-surface transition-colors duration-200 ease-sleek hover:border-brand-surface/60 hover:bg-brand-surface/10"
                data-testid="hero-gifts-cta"
              >
                Find a gift
              </LocalizedClientLink>
            </div>
          </StaggerItem>

          {/* Mobile collage - the desktop column is absolutely positioned and
              cannot reflow, so phones get their own flat row here. */}
          <StaggerItem className="w-full small:hidden">
            <ul aria-hidden className="mt-10 grid w-full grid-cols-3 gap-3">
              {tiles.map((tile) => (
                <li
                  key={tile.key}
                  className={`relative aspect-[3/4] ${TILE_CHROME}`}
                >
                  {tile.image ? (
                    <Image
                      src={tile.image}
                      alt=""
                      fill
                      sizes="33vw"
                      className="object-cover"
                    />
                  ) : (
                    <CraftMotif seed={tile.seed} motif={tile.fallbackMotif} />
                  )}
                </li>
              ))}
            </ul>
          </StaggerItem>

          <StaggerItem className="w-full">
            <dl className="mt-10 grid w-full max-w-md grid-cols-3 border-t border-brand-surface/15 pt-6">
              {FACTS.map((fact, index) => (
                <div
                  key={fact.label}
                  className={`flex flex-col gap-y-1.5 ${
                    index > 0 ? "border-l border-brand-surface/15 pl-4" : "pr-4"
                  }`}
                >
                  <dt className="font-playfair text-[26px] leading-none text-brand-accent-light">
                    {fact.value}
                  </dt>
                  <dd className="text-xsmall-regular uppercase tracking-[0.12em] text-brand-surface/55">
                    {fact.label}
                  </dd>
                </div>
              ))}
            </dl>
          </StaggerItem>
        </Stagger>

        <Stagger
          mode="mount"
          aria-hidden
          className="relative hidden h-[25rem] small:block"
        >
          {tiles.map((tile) => (
            <StaggerItem key={tile.key} className={`absolute ${tile.position}`}>
              <div
                className={`relative h-full w-full ${tile.rotate} ${TILE_CHROME} transition-transform duration-500 ease-sleek hover:rotate-0 motion-reduce:transition-none`}
              >
                {tile.image ? (
                  <Image
                    src={tile.image}
                    alt=""
                    fill
                    sizes="25vw"
                    className="object-cover"
                    priority
                  />
                ) : (
                  <CraftMotif seed={tile.seed} motif={tile.fallbackMotif} />
                )}
                {tile.caption && (
                  <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-brand-ink/85 to-transparent px-3 pb-2.5 pt-10 text-tiny uppercase tracking-[0.16em] text-brand-surface/85">
                    {tile.caption}
                  </span>
                )}
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>

      {/* Horizon into the next section. A sawtooth read as a graphic sawtooth;
          curved shoulders read as land. The near range carries the following
          section's ground colour so the seam disappears. */}
      <svg
        aria-hidden
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className="relative z-10 block h-[68px] w-full small:h-[104px]"
      >
        <path
          d="M0 120 L0 56 C 196 18 372 82 596 54 C 820 26 964 84 1164 58 C 1300 40 1378 54 1440 40 L1440 120 Z"
          fill="hsl(var(--brand-sand))"
          fillOpacity="0.15"
        />
        <path
          d="M0 120 L0 76 C 180 40 358 98 558 74 C 758 50 902 104 1122 80 C 1282 62 1362 76 1440 60 L1440 120 Z"
          fill="hsl(var(--brand-sand))"
        />
      </svg>
    </section>
  )
}

export default Hero
