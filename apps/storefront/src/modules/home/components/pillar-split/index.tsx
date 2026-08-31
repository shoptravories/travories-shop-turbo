import type { Pillar } from "@modules/layout/components/pillar-nav"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const COPY: Record<string, { eyebrow: string; blurb: string }> = {
  souvenirs: {
    eyebrow: "For travellers",
    blurb:
      "You have been there. Take back something made where you stood, not in a factory somewhere else.",
  },
  gifts: {
    eyebrow: "For gift shoppers",
    blurb:
      "Never been to Nepal, but giving something from it. Chosen by occasion, recipient and budget.",
  },
}

const PillarCard = ({ pillar }: { pillar: Pillar }) => {
  const copy = COPY[pillar.handle]
  const chips = pillar.groups.flatMap((g) => g.items).slice(0, 8)

  return (
    <div className="flex flex-col justify-between border border-ui-border-base rounded-large bg-white p-8 hover:border-brand-terracotta transition-colors duration-200">
      <div>
        {copy && (
          <span className="text-xsmall-regular uppercase tracking-[0.18em] text-brand-terracotta">
            {copy.eyebrow}
          </span>
        )}
        <h3 className="font-playfair text-[28px] leading-tight text-brand-navy mt-2">
          {pillar.name}
        </h3>
        {copy && (
          <p className="text-base-regular text-ui-fg-subtle mt-3 max-w-md">
            {copy.blurb}
          </p>
        )}
      </div>

      <div className="mt-6">
        <ul className="flex flex-wrap gap-2">
          {chips.map((item) => (
            <li key={item.id}>
              <LocalizedClientLink
                href={`/categories/${item.handle}`}
                className="inline-block px-3 py-1.5 rounded-circle bg-brand-paper text-small-regular text-brand-slate hover:bg-brand-sand transition-colors duration-150"
                data-testid={`pillar-chip-${item.handle}`}
              >
                {item.name}
              </LocalizedClientLink>
            </li>
          ))}
        </ul>

        <LocalizedClientLink
          href={pillar.blurbHref ?? `/categories/${pillar.handle}`}
          className="inline-block mt-6 text-base-semi text-brand-navy hover:text-brand-terracotta transition-colors duration-150"
        >
          {pillar.blurb} →
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
    <section className="content-container py-16 small:py-20">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="font-playfair text-[30px] small:text-[36px] leading-tight text-brand-navy">
          Two ways in
        </h2>
        <p className="text-base-regular text-ui-fg-subtle mt-3">
          Shop the place you visited, or the person you are buying for.
        </p>
      </div>

      <div className="grid grid-cols-1 small:grid-cols-2 gap-6">
        {pillars.map((pillar) => (
          <PillarCard key={pillar.handle} pillar={pillar} />
        ))}
      </div>
    </section>
  )
}

export default PillarSplit
