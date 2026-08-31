import { Metadata } from "next"

import { listCategories } from "@lib/data/categories"
import { BUDGET_BANDS, budgetBand, findGifts } from "@lib/data/gift-finder"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { buildPillars } from "@lib/util/pillars"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductPreview from "@modules/products/components/product-preview"

export const metadata: Metadata = {
  title: "Gift finder | Nepal Souvenirs",
  description:
    "Find a Nepali gift by who it is for, the occasion, and your budget.",
}

type SearchParams = {
  recipient?: string
  occasion?: string
  budget?: string
}

type Props = {
  params: Promise<{ countryCode: string }>
  searchParams: Promise<SearchParams>
}

const href = (base: SearchParams, patch: SearchParams) => {
  const merged = { ...base, ...patch }
  const qs = Object.entries(merged)
    .filter(([, v]) => Boolean(v))
    .map(([k, v]) => `${k}=${encodeURIComponent(v as string)}`)
    .join("&")
  return `/gifts/finder${qs ? `?${qs}` : ""}`
}

const Step = ({
  index,
  title,
  active,
  done,
  children,
}: {
  index: number
  title: string
  active: boolean
  done: boolean
  children?: React.ReactNode
}) => (
  <div
    className={
      active || done
        ? "border-l-2 border-brand-terracotta pl-6 pb-10"
        : "border-l-2 border-ui-border-base pl-6 pb-10 opacity-50"
    }
  >
    <div className="flex items-baseline gap-3">
      <span className="text-xsmall-regular uppercase tracking-[0.18em] text-brand-terracotta">
        Step {index}
      </span>
      <h2 className="font-playfair text-[22px] text-brand-navy">{title}</h2>
    </div>
    <div className="mt-4">{children}</div>
  </div>
)

const Choice = ({
  label,
  href: to,
  selected,
  testid,
}: {
  label: string
  href: string
  selected: boolean
  testid: string
}) => (
  <LocalizedClientLink
    href={to}
    data-testid={testid}
    className={
      selected
        ? "inline-block px-4 py-2.5 rounded-circle bg-brand-navy text-brand-paper text-base-semi transition-colors duration-150"
        : "inline-block px-4 py-2.5 rounded-circle bg-brand-paper text-brand-slate text-base-regular hover:bg-brand-sand transition-colors duration-150"
    }
  >
    {label}
  </LocalizedClientLink>
)

export default async function GiftFinderPage(props: Props) {
  const { countryCode } = await props.params
  const sp = await props.searchParams
  const { recipient, occasion, budget } = sp

  const [categories, region] = await Promise.all([
    listCategories().catch(() => []),
    getRegion(countryCode),
  ])

  const pillars = buildPillars(categories ?? [])
  const gifts = pillars.find((p) => p.handle === "gifts")
  const recipients =
    gifts?.groups.find((g) => g.title === "By Recipient")?.items ?? []
  const occasions =
    gifts?.groups.find((g) => g.title === "By Occasion")?.items ?? []

  const hasFacet = Boolean(recipient || occasion)
  const band = budgetBand(budget)

  // Only query once at least one facet is chosen.
  const result = hasFacet ? await findGifts({ recipient, occasion }) : null

  let products = result?.product_ids.length
    ? await listProducts({
        countryCode,
        queryParams: { id: result.product_ids, limit: 100 },
      }).then(({ response }) => response.products)
    : []

  // Budget is applied here rather than in the API because the price depends on
  // the region the shopper is browsing in.
  if (band && products.length) {
    products = products.filter((p) => {
      const amounts = (p.variants ?? [])
        .map((v) => v.calculated_price?.calculated_amount)
        .filter((n): n is number => typeof n === "number")
      if (!amounts.length) {
        return false
      }
      const cheapest = Math.min(...amounts)
      return cheapest >= band.min && cheapest < band.max
    })
  }

  return (
    <>
      <section className="bg-brand-navy text-brand-paper">
        <div className="content-container py-14 small:py-16 text-center">
          <span className="text-xsmall-regular uppercase tracking-[0.22em] text-brand-saffron">
            Not sure what to pick
          </span>
          <h1 className="font-playfair text-[32px] small:text-[44px] leading-tight mt-3">
            Gift finder
          </h1>
          <p className="text-base-regular text-brand-paper/75 max-w-lg mx-auto mt-3">
            Three questions. Answer what you know and skip the rest.
          </p>
        </div>
      </section>

      <section className="content-container py-12 small:py-16 grid grid-cols-1 small:grid-cols-[minmax(0,22rem)_1fr] gap-x-12">
        <div>
          <Step index={1} title="Who is it for?" active done={Boolean(recipient)}>
            <div className="flex flex-wrap gap-2">
              {recipients.map((r) => (
                <Choice
                  key={r.id}
                  label={r.name}
                  testid={`finder-recipient-${r.handle}`}
                  selected={recipient === r.handle}
                  href={href(sp, {
                    recipient: recipient === r.handle ? undefined : r.handle,
                  })}
                />
              ))}
            </div>
          </Step>

          <Step
            index={2}
            title="What is the occasion?"
            active={Boolean(recipient) || Boolean(occasion)}
            done={Boolean(occasion)}
          >
            <div className="flex flex-wrap gap-2">
              {occasions.map((o) => (
                <Choice
                  key={o.id}
                  label={o.name}
                  testid={`finder-occasion-${o.handle}`}
                  selected={occasion === o.handle}
                  href={href(sp, {
                    occasion: occasion === o.handle ? undefined : o.handle,
                  })}
                />
              ))}
            </div>
          </Step>

          <Step
            index={3}
            title="Budget?"
            active={hasFacet}
            done={Boolean(budget)}
          >
            <div className="flex flex-wrap gap-2">
              {BUDGET_BANDS.map((b) => (
                <Choice
                  key={b.key}
                  label={b.label}
                  testid={`finder-budget-${b.key}`}
                  selected={budget === b.key}
                  href={href(sp, {
                    budget: budget === b.key ? undefined : b.key,
                  })}
                />
              ))}
            </div>
          </Step>

          {(hasFacet || budget) && (
            <LocalizedClientLink
              href="/gifts/finder"
              className="text-small-regular text-ui-fg-muted hover:text-brand-terracotta transition-colors duration-150"
              data-testid="finder-reset"
            >
              Start over
            </LocalizedClientLink>
          )}
        </div>

        <div className="mt-12 small:mt-0" data-testid="finder-results">
          {!hasFacet ? (
            <div className="border border-dashed border-ui-border-base rounded-large p-10 text-center">
              <p className="text-base-regular text-ui-fg-subtle">
                Pick who it is for, or the occasion, and matches appear here.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-baseline justify-between mb-6">
                <h2 className="font-playfair text-[24px] text-brand-navy">
                  {products.length}{" "}
                  {products.length === 1 ? "match" : "matches"}
                </h2>
                {band && (
                  <span className="text-small-regular text-ui-fg-muted">
                    {band.label}
                  </span>
                )}
              </div>

              {products.length && region ? (
                <ul className="grid grid-cols-2 medium:grid-cols-3 gap-x-6 gap-y-8">
                  {products.map((product) => (
                    <li key={product.id}>
                      <ProductPreview product={product} region={region} />
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="border border-dashed border-ui-border-base rounded-large p-10 text-center">
                  <p className="text-base-regular text-ui-fg-subtle">
                    Nothing matches all of that yet.
                  </p>
                  <p className="text-small-regular text-ui-fg-muted mt-2">
                    Try removing the budget, or the occasion.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  )
}
