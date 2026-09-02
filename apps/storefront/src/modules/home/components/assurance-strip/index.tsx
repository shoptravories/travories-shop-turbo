import { Stagger, StaggerItem } from "@modules/common/components/stagger"
import { clx } from "@modules/common/components/ui"

const PROMISES = [
  {
    title: "Made by hand",
    body: "Every piece comes from a named workshop, not a factory line.",
  },
  {
    title: "Prices include VAT",
    body: "The number on the card is the number you pay in NPR.",
  },
  {
    title: "Packed for the flight home",
    body: "Fragile items are boxed to survive the trip, wherever it ends.",
  },
  {
    title: "Backed by Travories",
    body: "The same team that books treks across Nepal stands behind this.",
  },
]

/**
 * The grid reflows 1 -> 2 -> 4 columns, so the dividers are derived from the
 * cell index rather than a gap. A gap alone drew nothing, and a blanket
 * `divide-x` would have left stray rules hanging at the row ends.
 */
const cellClass = (index: number) =>
  clx(
    "flex flex-col gap-y-2 border-brand-line py-8 medium:border-t-0",
    index > 0 && "border-t",
    index === 1 && "xsmall:border-t-0",
    index % 2 === 1 && "xsmall:border-l",
    index > 0 && "medium:border-l",
    "xsmall:px-6",
    index % 2 === 0 ? "xsmall:pl-0" : "xsmall:pr-0",
    index === 1 && "medium:pr-6",
    index === 2 && "medium:pl-6"
  )

const AssuranceStrip = () => {
  return (
    <section className="border-b border-brand-line bg-brand-sand">
      <Stagger className="content-container grid grid-cols-1 xsmall:grid-cols-2 medium:grid-cols-4">
        {PROMISES.map((promise, index) => (
          <StaggerItem key={promise.title} className={cellClass(index)}>
            <span className="text-tiny uppercase tracking-[0.18em] text-brand-accent">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="text-base-semi text-brand-heading">
              {promise.title}
            </h3>
            <p className="text-small-regular leading-5 text-brand-slate/80">
              {promise.body}
            </p>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  )
}

export default AssuranceStrip
