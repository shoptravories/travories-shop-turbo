import { HttpTypes } from "@medusajs/types"
import { Text } from "@modules/common/components/ui"

type LineItemOptionsProps = {
  variant: HttpTypes.StoreProductVariant | undefined
  /**
   * Line item metadata. Personalisation lives here (engraving), and the
   * customer needs to see it wherever the item is listed - cart, checkout
   * review and the order confirmation all render through this component.
   */
  metadata?: Record<string, unknown> | null
  "data-testid"?: string
  "data-value"?: HttpTypes.StoreProductVariant
}

const LineItemOptions = ({
  variant,
  metadata,
  "data-testid": dataTestid,
  "data-value": dataValue,
}: LineItemOptionsProps) => {
  const engraving =
    typeof metadata?.engraving === "string" ? metadata.engraving.trim() : ""

  return (
    <>
      <Text
        data-testid={dataTestid}
        data-value={dataValue}
        className="inline-block txt-medium text-ui-fg-subtle w-full overflow-hidden text-ellipsis"
      >
        Variant: {variant?.title}
      </Text>
      {engraving && (
        <Text
          data-testid="line-item-engraving"
          className="inline-block txt-medium text-brand-accent w-full overflow-hidden text-ellipsis"
        >
          Engraving: {engraving}
        </Text>
      )}
    </>
  )
}

export default LineItemOptions
