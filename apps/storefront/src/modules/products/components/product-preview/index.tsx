import { getProductBadge } from "@lib/util/product-badge"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { clx } from "@modules/common/components/ui"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"

export default async function ProductPreview({
  product,
  region: _region,
}: {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
}) {
  const { cheapestPrice } = getProductPrice({ product })
  const badge = getProductBadge(product)
  const isSale = cheapestPrice?.price_type === "sale"

  return (
    <LocalizedClientLink
      href={`/products/${product.handle}`}
      className="group block h-full"
    >
      <div
        className="flex h-full flex-col overflow-hidden rounded-card border border-ui-border-base bg-white transition-all duration-500 ease-sleek hover:-translate-y-1 hover:border-brand-accent/40 hover:shadow-[0_18px_40px_-24px_hsl(var(--brand-primary-deep)/0.45)] motion-reduce:transform-none motion-reduce:transition-none"
        data-testid="product-wrapper"
      >
        <div className="relative">
          <Thumbnail
            thumbnail={product.thumbnail}
            images={product.images}
            size="full"
            seed={product.handle ?? product.id}
            flat
          />

          {isSale && (
            <span className="absolute left-3 top-3 rounded-circle bg-brand-accent px-2.5 py-1 text-tiny uppercase tracking-[0.14em] text-white">
              Sale
            </span>
          )}

          <span className="pointer-events-none absolute inset-x-3 bottom-3 flex translate-y-2 items-center justify-center rounded-circle bg-brand-primary-deep/90 py-2 text-xsmall-regular text-brand-surface opacity-0 backdrop-blur transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100 motion-reduce:transition-none">
            View piece
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-y-1 p-4">
          {badge && (
            <span className="text-tiny uppercase tracking-[0.16em] text-brand-accent">
              {badge}
            </span>
          )}

          <h3
            className="text-base-regular text-brand-heading transition-colors duration-200 group-hover:text-brand-accent"
            data-testid="product-title"
          >
            {product.title}
          </h3>

          <div
            className={clx(
              "mt-auto flex items-baseline gap-x-2 pt-3 text-base-semi",
              isSale ? "text-brand-accent" : "text-brand-primary"
            )}
          >
            {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
          </div>
        </div>
      </div>
    </LocalizedClientLink>
  )
}
