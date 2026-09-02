import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"
import createMediaUploadUrlWorkflow from "../../../../workflows/create-media-upload-url"

const uploadBodySchema = z.object({
  filename: z.string().min(1),
  content_type: z.string().min(1),
  folder: z.string().trim().min(1).optional(),
  access: z.enum(["public", "private"]).optional(),
  expires_in: z.number().int().min(1).max(3600).optional(),
})

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = uploadBodySchema.parse(req.body ?? {})

  const { result } = await createMediaUploadUrlWorkflow(req.scope).run({
    input: {
      filename: body.filename,
      contentType: body.content_type,
      folder: body.folder,
      access: body.access,
      expiresIn: body.expires_in,
    },
  })

  res.json({
    upload: {
      key: result.key,
      access: result.access,
      method: result.method,
      url: result.url,
      headers: result.headers,
      expires_at: result.expiresAt,
      expires_in: result.expiresIn,
      public_url: result.publicUrl,
      store_url: result.storeUrl,
    },
  })
}
