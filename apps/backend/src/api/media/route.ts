import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"
import { assertMediaKey, createPresignedDownload } from "../../lib/garage"

const mediaQuerySchema = z.object({
  key: z.string().min(1),
  filename: z.string().trim().min(1).optional(),
})

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = mediaQuerySchema.parse(req.query ?? {})
  const key = assertMediaKey(query.key)

  const { url } = await createPresignedDownload({
    key,
    downloadFilename: query.filename,
  })

  res.setHeader("Cache-Control", "no-store")
  res.redirect(url)
}
