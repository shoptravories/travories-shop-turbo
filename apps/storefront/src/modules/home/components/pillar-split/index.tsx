import type { Pillar } from "@modules/layout/components/pillar-nav"
import CraftMotif from "@modules/common/components/craft-motif"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import SectionHeading from "@modules/common/components/section-heading"
import { Stagger, StaggerItem } from "@modules/common/components/stagger"

const COPY: Partial<Record<string, { blurb: string }>> = {
  souvenirs: {
    blurb:
      "You have been there. Take back something made where you stood, not in a factory somewhere else.",
  },
  gifts: {
    blurb:
      "Never been to Nepal, but giving something from it. Chosen by occasion, recipient and budget.",
  },
  gear: {
    blurb:
      "Trekking and mountaineering gear for the approach, the camp and the climb.",
  },
}

const getPillarCopy = (pillar: Pillar) => ({
  eyebrow: pillar.eyebrow ?? "New collection",
  motif: pillar.motif ?? (pillar.handle === "gifts" ? "mandala" : "peaks"),
  blurb:
    COPY[pillar.handle]?.blurb ??
    (pillar.groups.length > 1
      ? `Browse ${pillar.name.toLowerCase()} by group, then drill into the specific category you want.`
      : `Browse the latest ${pillar.name.toLowerCase()} additions from the same catalogue.`),
})

const PillarCard = ({ pillar }: { pillar: Pillar }) => {
  const copy = getPillarCopy(pillar)
  const chips = pillar.groups.flatMap((group) => group.items).slice(0, 8)

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden h-full rounded-card bg-white p-8 ring-1 ring-inset ring-brand-line transition-all duration-500 ease-sleek hover:-translate-y-1.5 hover:ring-brand-accent/40 hover:shadow-[0_28px_56px_-32px_hsl(var(--brand-ink)/0.4)] motion-reduce:transform-none small:p-10">
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
        <span className="inline-flex items-center gap-x-2.5 text-xsmall-regular uppercase tracking-[0.18em] text-brand-accent">
          <span aria-hidden className="h-px w-6 bg-brand-accent/50" />
          {copy.eyebrow}
        </span>
        <h3 className="mt-3 text-display text-[30px] text-brand-heading small:text-[34px]">
          {pillar.name}
        </h3>
        <p className="mt-3 max-w-md text-base-regular text-brand-slate/80">
          {copy.blurb}
        </p>
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
        eyebrow={`${pillars.length} ways in`}
        title="Shop the place, the person, or the trail"
        description="One catalogue, three front doors. Souvenirs, gifts and trail gear all meet in the same store."
        align="center"
      />

      <Stagger className="grid grid-cols-1 gap-6 small:grid-cols-2 xl:grid-cols-3">
        {pillars.map((pillar) => (
          <StaggerItem key={pillar.handle}>
            <PillarCard pillar={pillar} />
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  )
}

export default PillarSplit
