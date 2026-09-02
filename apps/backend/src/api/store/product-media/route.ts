import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { z } from "@medusajs/framework/zod"
import { extractMediaKeyFromUrl } from "../../../lib/garage"
import { getStoreMediaUrl } from "../../../lib/store-media"

const productMediaQuerySchema = z.object({
  product_id: z.union([z.string(), z.array(z.string())]).optional(),
})

type MediaRecord = {
  id: string
  key: string | null
  url: string | null
  alt_text: string | null
  rank: number
  is_thumbnail: boolean
  products?: { id: string }[]
}

type ProductRow = {
  id: string
  thumbnail?: string | null
  images?: { id: string; url: string | null }[]
}

const toStableUrl = (url: string | null | undefined) => {
  if (!url) {
    return null
  }

  const key = extractMediaKeyFromUrl(url)
  return key ? getStoreMediaUrl(key) : url
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = productMediaQuerySchema.parse(req.query ?? {})
  const productIds = new Set(
    (Array.isArray(query.product_id) ? query.product_id : query.product_id ? [query.product_id] : [])
      .filter(Boolean)
  )

  const graph = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const [{ data: productRows }, { data: mediaRows }] = await Promise.all([
    graph.graph({
      entity: "product",
      fields: ["id", "thumbnail", "images.id", "images.url"],
      filters: productIds.size ? { id: [...productIds] } : undefined,
    }),
    graph.graph({
      entity: "product_media",
      fields: [
        "id",
        "key",
        "url",
        "alt_text",
        "rank",
        "is_thumbnail",
        "products.id",
      ],
    }),
  ])

  const byProductId = new Map<
    string,
    {
      thumbnail: string | null
      images: Array<{ id: string; url: string | null; rank: number; alt_text: string | null }>
    }
  >()

  for (const row of productRows as unknown as ProductRow[]) {
    byProductId.set(row.id, {
      thumbnail: toStableUrl(row.thumbnail),
      images: (row.images ?? []).map((image, index) => ({
        id: image.id,
        url: toStableUrl(image.url),
        rank: index,
        alt_text: null,
      })),
    })
  }

  const customByProductId = new Map<string, MediaRecord[]>()

  for (const row of mediaRows as unknown as MediaRecord[]) {
    for (const product of row.products ?? []) {
      if (productIds.size && !productIds.has(product.id)) {
        continue
      }

      const list = customByProductId.get(product.id) ?? []
      list.push(row)
      customByProductId.set(product.id, list)
    }
  }

  for (const [productId, records] of customByProductId) {
    const sorted = [...records].sort((a, b) => {
      if (a.is_thumbnail !== b.is_thumbnail) {
        return a.is_thumbnail ? -1 : 1
      }

      return a.rank - b.rank
    })

    const images = sorted.map((record) => ({
      id: record.id,
      url: record.key ? getStoreMediaUrl(record.key) : toStableUrl(record.url),
      rank: record.rank,
      alt_text: record.alt_text,
    }))

    byProductId.set(productId, {
      thumbnail: images.find((image) => image.url)?.url ?? null,
      images,
    })
  }

  res.json({
    media: Object.fromEntries(byProductId.entries()),
  })
}
