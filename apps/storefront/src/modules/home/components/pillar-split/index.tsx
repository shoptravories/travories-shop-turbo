import type { Pillar } from "@modules/layout/components/pillar-nav"
import CraftMotif from "@modules/common/components/craft-motif"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import SectionHeading from "@modules/common/components/section-heading"

const COPY: Record<
  string,
  { eyebrow: string; blurb: string; motif: "peaks" | "mandala" }
> = {
  souvenirs: {
    eyebrow: "For travellers",
    blurb:
      "You have been there. Take back something made where you stood, not in a factory somewhere else.",
    motif: "peaks",
  },
  gifts: {
    eyebrow: "For gift shoppers",
    blurb:
      "Never been to Nepal, but giving something from it. Chosen by occasion, recipient and budget.",
    motif: "mandala",
  },
}

const PillarCard = ({ pillar }: { pillar: Pillar }) => {
  const copy = COPY[pillar.handle]
  const chips = pillar.groups.flatMap((group) => group.items).slice(0, 8)

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-large bg-white p-8 ring-1 ring-inset ring-brand-line transition-all duration-300 ease-out hover:-translate-y-1.5 hover:ring-brand-accent/40 hover:shadow-[0_28px_56px_-32px_hsl(var(--brand-ink)/0.4)] motion-reduce:transform-none small:p-10">
      {/* A quiet corner of generated artwork so the two cards read as objects
          rather than two boxes of text. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 opacity-[0.16] [mask-image:radial-gradient(closest-side,black,transparent)] transition-transform duration-700 ease-out group-hover:scale-110 motion-reduce:transition-none"
      >
        <CraftMotif seed={pillar.handle} motif={copy?.motif} />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-accent/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />

      <div className="relative">
        {copy && (
          <span className="inline-flex items-center gap-x-2.5 text-xsmall-regular uppercase tracking-[0.18em] text-brand-accent">
            <span aria-hidden className="h-px w-6 bg-brand-accent/50" />
            {copy.eyebrow}
          </span>
        )}
        <h3 className="mt-3 text-display text-[30px] text-brand-heading small:text-[34px]">
          {pillar.name}
        </h3>
        {copy && (
          <p className="mt-3 max-w-md text-base-regular text-brand-slate/80">
            {copy.blurb}
          </p>
        )}
      </div>

      <div className="relative mt-9">
        <ul className="flex flex-wrap gap-2">
          {chips.map((item) => (
            <li key={item.id}>
              <LocalizedClientLink
                href={`/categories/${item.handle}`}
                className="inline-block rounded-circle border border-brand-line bg-brand-sand px-3.5 py-2 text-small-regular text-brand-slate transition-colors duration-150 hover:border-brand-accent/40 hover:bg-brand-surface-tint hover:text-brand-primary"
                data-testid={`pillar-chip-${item.handle}`}
              >
                {item.name}
              </LocalizedClientLink>
            </li>
          ))}
        </ul>

        <LocalizedClientLink
          href={pillar.blurbHref ?? `/categories/${pillar.handle}`}
          className="mt-8 inline-flex items-center gap-x-2 border-b border-brand-primary/20 pb-1 text-base-semi text-brand-primary transition-colors duration-150 hover:border-brand-accent hover:text-brand-accent"
        >
          {pillar.blurb}
          <span
            aria-hidden
            className="transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
          >
            &rarr;
          </span>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

const PillarSplit = ({ pillars }: { pillars: Pillar[] }) => {
  if (!pillars.length) {
    return null
  }

  return (
    <section className="content-container section-y">
      <SectionHeading
        eyebrow="Two ways in"
        title="Shop the place, or the person"
        description="One catalogue, two front doors. Both end at the same makers."
        align="center"
      />

      <div className="grid grid-cols-1 gap-6 small:grid-cols-2">
        {pillars.map((pillar) => (
          <PillarCard key={pillar.handle} pillar={pillar} />
        ))}
      </div>
    </section>
  )
}

export default PillarSplit
