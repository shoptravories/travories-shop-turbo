import CraftMotif, { MotifName } from "@modules/common/components/craft-motif"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { clx } from "@modules/common/components/ui"

export type Crumb = { label: string; href?: string }

export type HeaderChip = { label: string; href: string; active?: boolean }

/**
 * The masthead every browse page shares - store, category and collection.
 * Using one band across all three is what makes the shop feel like a single
 * place rather than three templates that happen to list products.
 */
const BrowseHeader = ({
  eyebrow,
  title,
  description,
  crumbs = [],
  chips = [],
  motif,
  seed,
  "data-testid": dataTestId,
}: {
  eyebrow?: string
  title: string
  description?: string | null
  crumbs?: Crumb[]
  chips?: HeaderChip[]
  motif?: MotifName
  seed?: string
  "data-testid"?: string
}) => {
  return (
    <section className="relative overflow-hidden bg-brand-primary-deep text-brand-surface">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-1/2 opacity-25"
      >
        <CraftMotif seed={seed ?? title} motif={motif} />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-brand-primary-deep via-brand-primary-deep/95 to-brand-primary-deep/40"
      />

      <div className="content-container relative z-10 py-12 small:py-16">
        {crumbs.length > 0 && (
          <nav
            aria-label="Breadcrumb"
            className="mb-4 flex flex-wrap items-center gap-x-2 text-xsmall-regular uppercase tracking-[0.16em] text-brand-surface/50"
          >
            {crumbs.map((crumb, index) => (
              <span key={`${crumb.label}-${index}`} className="flex items-center gap-x-2">
                {crumb.href ? (
                  <LocalizedClientLink
                    href={crumb.href}
                    className="transition-colors duration-150 hover:text-brand-accent-light"
                  >
                    {crumb.label}
                  </LocalizedClientLink>
                ) : (
                  <span>{crumb.label}</span>
                )}
                {index < crumbs.length - 1 && <span aria-hidden>/</span>}
              </span>
            ))}
          </nav>
        )}

        {eyebrow && (
          <span className="text-xsmall-regular uppercase tracking-[0.2em] text-brand-accent-light">
            {eyebrow}
          </span>
        )}

        <h1
          className="mt-2 font-playfair text-[34px] leading-tight small:text-[48px]"
          data-testid={dataTestId}
        >
          {title}
        </h1>

        {description && (
          <p className="mt-4 max-w-xl text-base-regular text-brand-surface/70">
            {description}
          </p>
        )}

        {chips.length > 0 && (
          <ul className="mt-8 flex flex-wrap gap-2">
            {chips.map((chip) => (
              <li key={chip.href}>
                <LocalizedClientLink
                  href={chip.href}
                  className={clx(
                    "inline-block rounded-circle border px-3.5 py-2 text-small-regular transition-colors duration-150",
                    chip.active
                      ? "border-brand-surface bg-brand-surface text-brand-primary-deep"
                      : "border-brand-surface/25 text-brand-surface/80 hover:border-brand-accent-light hover:text-brand-accent-light"
                  )}
                >
                  {chip.label}
                </LocalizedClientLink>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

export default BrowseHeader
