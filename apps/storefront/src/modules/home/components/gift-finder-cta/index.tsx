import CraftMotif from "@modules/common/components/craft-motif"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const SHORTCUTS = [
  { label: "For her", href: "/gifts/finder?recipient=for-her" },
  { label: "For him", href: "/gifts/finder?recipient=for-him" },
  { label: "For parents", href: "/gifts/finder?recipient=for-parents" },
  { label: "Wedding", href: "/gifts/finder?occasion=wedding" },
  { label: "Housewarming", href: "/gifts/finder?occasion=housewarming" },
  {
    label: "Dashain and Tihar",
    href: "/gifts/finder?occasion=dashain-and-tihar",
  },
]

const GiftFinderCta = () => {
  return (
    <section className="content-container section-y">
      <div className="relative isolate grid grid-cols-1 items-center gap-10 overflow-hidden rounded-card bg-brand-surface-tint p-8 ring-1 ring-inset ring-brand-accent/15 small:grid-cols-[1fr_auto] small:gap-12 small:p-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_120%_at_100%_0%,hsl(var(--brand-accent)/0.14),transparent_60%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-28 h-96 w-96 opacity-[0.13] [mask-image:radial-gradient(closest-side,black,transparent)]"
        >
          <CraftMotif seed="gift-finder" motif="flags" />
        </div>

        <div className="relative">
          <span className="inline-flex items-center gap-x-2.5 text-xsmall-regular uppercase tracking-[0.2em] text-brand-accent">
            <span aria-hidden className="h-px w-6 bg-brand-accent/50" />
            Not sure what to pick
          </span>
          <h2 className="mt-3 max-w-lg text-display text-[28px] text-brand-heading small:text-[38px]">
            Answer three questions, get a shortlist
          </h2>
          <p className="mt-3 max-w-lg text-base-regular text-brand-slate/80">
            Who it is for, what the occasion is, what you want to spend. The
            gift finder does the rest.
          </p>

          <ul className="mt-7 flex flex-wrap gap-2">
            {SHORTCUTS.map((shortcut) => (
              <li key={shortcut.label}>
                <LocalizedClientLink
                  href={shortcut.href}
                  className="inline-block rounded-circle border border-brand-line bg-white px-3.5 py-2 text-small-regular text-brand-slate transition-colors duration-150 hover:border-brand-accent/40 hover:text-brand-primary"
                >
                  {shortcut.label}
                </LocalizedClientLink>
              </li>
            ))}
          </ul>
        </div>

        <LocalizedClientLink
          href="/gifts/finder"
          className="group relative inline-flex shrink-0 items-center justify-center gap-x-2 rounded-circle bg-brand-primary-deep px-7 py-3.5 text-base-semi text-brand-surface shadow-[0_18px_36px_-20px_hsl(var(--brand-ink)/0.8)] transition-colors duration-150 hover:bg-brand-accent"
          data-testid="home-gift-finder-cta"
        >
          Open the gift finder
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

export default GiftFinderCta
