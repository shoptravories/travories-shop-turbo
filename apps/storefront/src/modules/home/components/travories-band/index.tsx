/**
 * The cross-sell back to the parent marketplace. Kept deliberately quiet - it
 * is a bridge, not a second storefront competing with this one.
 */
const TravoriesBand = () => {
  return (
    <section className="border-y border-brand-line bg-brand-sand">
      <div className="content-container flex flex-col items-start justify-between gap-6 py-12 small:flex-row small:items-center small:py-14">
        <div>
          <span className="inline-flex items-center gap-x-2.5 text-xsmall-regular uppercase tracking-[0.2em] text-brand-accent">
            <span aria-hidden className="h-px w-6 bg-brand-accent/50" />
            The other half of the trip
          </span>
          <p className="mt-3 max-w-xl text-large-regular text-brand-heading small:text-[19px] small:leading-7">
            Travories books the treks and tours these places belong to. If you
            have not been yet, start there.
          </p>
        </div>

        <a
          href="https://travories.com"
          target="_blank"
          rel="noreferrer"
          className="group inline-flex shrink-0 items-center gap-x-2 rounded-circle border border-brand-primary px-6 py-3 text-base-semi text-brand-primary transition-colors duration-150 hover:bg-brand-primary-deep hover:text-brand-surface"
        >
          Visit Travories
          <span
            aria-hidden
            className="transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
          >
            &rarr;
          </span>
        </a>
      </div>
    </section>
  )
}

export default TravoriesBand
