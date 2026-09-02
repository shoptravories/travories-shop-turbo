import { createStep, createWorkflow, StepResponse, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import {
  buildUploadKey,
  createPresignedUpload,
  getPublicMediaUrl,
  type MediaAccess,
} from "../lib/garage"
import { getStoreMediaUrl } from "../lib/store-media"

export type CreateMediaUploadUrlInput = {
  filename: string
  contentType: string
  folder?: string
  access?: MediaAccess
  expiresIn?: number
}

const createMediaUploadUrlStep = createStep(
  "create-media-upload-url",
  async (input: CreateMediaUploadUrlInput) => {
    const key = buildUploadKey(input)
    const upload = await createPresignedUpload({
      key,
      contentType: input.contentType,
      expiresIn: input.expiresIn,
    })

    return new StepResponse({
      key,
      access: input.access ?? "public",
      publicUrl: input.access === "private" ? null : getPublicMediaUrl(key),
      storeUrl: getStoreMediaUrl(key),
      ...upload,
    })
  }
)

const createMediaUploadUrlWorkflow = createWorkflow(
  "create-media-upload-url",
  (input: CreateMediaUploadUrlInput) => {
    const upload = createMediaUploadUrlStep(input)

    return new WorkflowResponse(upload)
  }
)

export default createMediaUploadUrlWorkflow
