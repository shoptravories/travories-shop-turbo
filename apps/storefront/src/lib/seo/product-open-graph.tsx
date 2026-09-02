import { HttpTypes } from "@medusajs/types"

/**
 * Open Graph's product namespace, which Next's Metadata type has no form for.
 * React 19 hoists these into <head>, and they are what makes a shared product
 * link show a price and an in-stock badge on Facebook and Pinterest rather
 * than a plain article card.
 *
 * buildSeoMetadata({ type: "product" }) leaves og:type out so this owns it.
 */

type VariantWithPrice = HttpTypes.StoreProductVariant & {
  calculated_price?: { calculated_amount: number; currency_code: string }
}

const ProductOpenGraph = ({ product }: { product: HttpTypes.StoreProduct }) => {
  const priced = ((product.variants ?? []) as VariantWithPrice[]).filter(
    (variant) => typeof variant.calculated_price?.calculated_amount === "number"
  )

  const cheapest = priced.reduce<VariantWithPrice | undefined>(
    (lowest, variant) =>
      !lowest ||
      variant.calculated_price!.calculated_amount <
        lowest.calculated_price!.calculated_amount
        ? variant
        : lowest,
    undefined
  )

  const inStock = (product.variants ?? []).some(
    (variant) =>
      variant.allow_backorder ||
      !variant.manage_inventory ||
      (variant.inventory_quantity ?? 0) > 0
  )

  return (
    <>
      <meta property="og:type" content="product" />
      <meta
        property="og:availability"
        content={inStock ? "instock" : "outofstock"}
      />
      <meta
        property="product:availability"
        content={inStock ? "in stock" : "out of stock"}
      />
      <meta property="product:condition" content="new" />
      <meta property="product:retailer_item_id" content={product.handle ?? product.id} />
      {cheapest && (
        <>
          <meta
            property="product:price:amount"
            content={cheapest.calculated_price!.calculated_amount.toFixed(2)}
          />
          <meta
            property="product:price:currency"
            content={cheapest.calculated_price!.currency_code.toUpperCase()}
          />
        </>
      )}
    </>
  )
}

export default ProductOpenGraph
