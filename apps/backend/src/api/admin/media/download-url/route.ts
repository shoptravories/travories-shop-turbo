import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"
import createMediaDownloadUrlWorkflow from "../../../../workflows/create-media-download-url"

const downloadQuerySchema = z.object({
  key: z.string().min(1),
  expires_in: z.coerce.number().int().min(1).max(3600).optional(),
  filename: z.string().trim().min(1).optional(),
})

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = downloadQuerySchema.parse(req.query ?? {})

  const { result } = await createMediaDownloadUrlWorkflow(req.scope).run({
    input: {
      key: query.key,
      expiresIn: query.expires_in,
      downloadFilename: query.filename,
    },
  })

  res.json({
    download: {
      key: result.key,
      url: result.url,
      expires_at: result.expiresAt,
      expires_in: result.expiresIn,
      public_url: result.publicUrl,
    },
  })
}
