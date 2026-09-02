import { JsonLdNode } from "./structured-data"

type JsonLdProps = {
  /** One node, or several to emit as a single graph. */
  data: JsonLdNode | JsonLdNode[]
  id?: string
}

/**
 * Renders schema.org JSON-LD. "<" is escaped because a product description
 * containing "</script>" would otherwise break out of the tag.
 */
const JsonLd = ({ data, id }: JsonLdProps) => {
  const payload = Array.isArray(data) ? data : [data]

  if (!payload.length) {
    return null
  }

  return (
    <>
      {payload.map((node, index) => (
        <script
          key={id ? `${id}-${index}` : index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(node).replace(/</g, "\\u003c"),
          }}
        />
      ))}
    </>
  )
}

export default JsonLd
