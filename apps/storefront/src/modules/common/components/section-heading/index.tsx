import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { clx } from "@modules/common/components/ui"

/**
 * The one heading treatment every browse section uses - eyebrow, Playfair
 * title, optional supporting line and a trailing link. Keeping it in one place
 * is what stops the home page and the store drifting apart visually.
 */
const SectionHeading = ({
  eyebrow,
  title,
  description,
  href,
  linkLabel = "View all",
  align = "left",
  tone = "light",
}: {
  eyebrow?: string
  title: string
  description?: string
  href?: string
  linkLabel?: string
  align?: "left" | "center"
  tone?: "light" | "dark"
}) => {
  const centered = align === "center"
  const dark = tone === "dark"

  return (
    <div
      className={clx(
        "mb-10 flex gap-x-8 gap-y-5 small:mb-12",
        centered
          ? "mx-auto max-w-2xl flex-col items-center text-center"
          : "flex-col items-start small:flex-row small:items-end small:justify-between"
      )}
    >
      <div className={clx(centered && "flex flex-col items-center")}>
        {eyebrow && (
          <span
            className={clx(
              "inline-flex items-center gap-x-2.5 text-xsmall-regular uppercase tracking-[0.2em]",
              dark ? "text-brand-accent-light" : "text-brand-accent"
            )}
          >
            {/* A short rule instead of a bullet - it reads as a section mark
                and lines the eyebrow up with the title's optical left edge. */}
            <span
              aria-hidden
              className={clx(
                "h-px w-6",
                dark ? "bg-brand-accent-light/60" : "bg-brand-accent/50"
              )}
            />
            {eyebrow}
          </span>
        )}
        <h2
          className={clx(
            "mt-3 text-display text-[30px] small:text-[42px]",
            dark ? "text-brand-surface" : "text-brand-heading"
          )}
        >
          {title}
        </h2>
        {description && (
          <p
            className={clx(
              "mt-3 max-w-xl text-base-regular",
              dark ? "text-brand-surface/70" : "text-brand-slate/80"
            )}
          >
            {description}
          </p>
        )}
      </div>

      {href && (
        <LocalizedClientLink
          href={href}
          className={clx(
            "group inline-flex shrink-0 items-center gap-x-2 border-b pb-1 text-base-semi transition-colors duration-150",
            dark
              ? "border-brand-surface/25 text-brand-surface hover:border-brand-accent-light hover:text-brand-accent-light"
              : "border-brand-primary/20 text-brand-primary hover:border-brand-accent hover:text-brand-accent"
          )}
        >
          {linkLabel}
          <span
            aria-hidden
            className="transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
          >
            &rarr;
          </span>
        </LocalizedClientLink>
      )}
    </div>
  )
}

export default SectionHeading
