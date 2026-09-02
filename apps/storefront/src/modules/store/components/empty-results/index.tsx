import CraftMotif from "@modules/common/components/craft-motif"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const EmptyResults = ({
  title = "Nothing matches that yet",
  body = "Try clearing a filter, or start again from the whole shop.",
}: {
  title?: string
  body?: string
}) => {
  return (
    <div
      className="flex flex-col items-center gap-y-4 rounded-large border border-dashed border-ui-border-base px-6 py-20 text-center"
      data-testid="empty-results"
    >
      <div className="relative h-20 w-20 overflow-hidden rounded-circle">
        <CraftMotif seed="empty" motif="mandala" />
      </div>
      <h2 className="font-playfair text-[24px] text-brand-primary">{title}</h2>
      <p className="max-w-sm text-base-regular text-ui-fg-subtle">{body}</p>
      <LocalizedClientLink
        href="/store"
        className="mt-2 inline-flex items-center gap-x-2 rounded-circle bg-brand-primary-deep px-6 py-3 text-base-semi text-brand-surface transition-colors duration-150 hover:bg-brand-accent"
      >
        Browse everything
        <span aria-hidden>&rarr;</span>
      </LocalizedClientLink>
    </div>
  )
}

export default EmptyResults
