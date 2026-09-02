import CraftMotif from "@modules/common/components/craft-motif"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Stagger, StaggerItem } from "@modules/common/components/stagger"

const STEPS = [
  {
    step: "01",
    title: "A named workshop",
    body: "Lokta paper pulled in Kathmandu, wool felted in Pokhara, tea picked in Ilam. Each piece is traced to the place and the people who made it.",
  },
  {
    step: "02",
    title: "Checked in Kathmandu",
    body: "Everything passes through one room before it ships. Nothing leaves that we would not carry home ourselves.",
  },
  {
    step: "03",
    title: "Sent wherever you are",
    body: "Packed for the flight, tracked to the door, priced with VAT already inside so nothing lands as a surprise.",
  },
]

const CraftStory = () => {
  return (
    <section className="relative isolate overflow-hidden bg-brand-ink text-brand-surface">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_70%_at_85%_0%,hsl(var(--brand-primary)/0.5),transparent_60%)]"
      />
      {/* Masked rather than faded with an overlay - an overlay left a hard
          vertical seam where the artwork panel started. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 opacity-[0.18] [mask-image:linear-gradient(to_right,transparent,black_65%)] small:block"
      >
        <CraftMotif seed="craft-story" motif="terraces" />
      </div>
      <div aria-hidden className="grain pointer-events-none absolute inset-0" />

      <div className="content-container relative z-10 section-y">
        <Stagger className="max-w-2xl">
          <StaggerItem>
            <span className="inline-flex items-center gap-x-2.5 text-xsmall-regular uppercase tracking-[0.2em] text-brand-accent-light">
              <span aria-hidden className="h-px w-6 bg-brand-accent-light/60" />
              How it works
            </span>
          </StaggerItem>
          <StaggerItem>
            <h2 className="mt-3 text-display text-[30px] small:text-[42px]">
              Made by hand, not by machine
            </h2>
          </StaggerItem>
          <StaggerItem>
            <p className="mt-4 text-base-regular text-brand-surface/70 small:text-large-regular">
              A souvenir is only worth carrying if someone actually made it.
              That is the whole rule this shop runs on.
            </p>
          </StaggerItem>
        </Stagger>

        <Stagger as="ol" className="mt-14 grid grid-cols-1 gap-x-8 gap-y-10 small:grid-cols-3">
          {STEPS.map((item) => (
            <StaggerItem as="li" key={item.step} className="group relative pt-7">
              {/* The rule doubles as the step's progress mark: a bright
                  accent segment over the full-width hairline. */}
              <span
                aria-hidden
                className="absolute inset-x-0 top-0 h-px bg-brand-surface/20"
              />
              <span
                aria-hidden
                className="absolute left-0 top-0 h-px w-10 bg-brand-accent-light"
              />
              <span className="font-playfair text-[28px] leading-none text-brand-accent-light">
                {item.step}
              </span>
              <h3 className="mt-3 text-large-semi">{item.title}</h3>
              <p className="mt-2 text-base-regular text-brand-surface/65">
                {item.body}
              </p>
            </StaggerItem>
          ))}
        </Stagger>

        <LocalizedClientLink
          href="/store"
          className="group mt-14 inline-flex items-center gap-x-2 rounded-circle border border-brand-surface/30 px-6 py-3 text-base-semi text-brand-surface transition-colors duration-150 hover:border-brand-surface/60 hover:bg-brand-surface/10"
        >
          Browse the whole shop
          <span
            aria-hidden
            className="transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
          >
            &rarr;
          </span>
        </LocalizedClientLink>
      </div>
    </section>
  )
}

export default CraftStory
