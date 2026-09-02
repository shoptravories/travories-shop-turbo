import { createStep, createWorkflow, StepResponse, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { createPresignedDownload, getPublicMediaUrl } from "../lib/garage"

export type CreateMediaDownloadUrlInput = {
  key: string
  expiresIn?: number
  downloadFilename?: string
}

const createMediaDownloadUrlStep = createStep(
  "create-media-download-url",
  async (input: CreateMediaDownloadUrlInput) => {
    const download = await createPresignedDownload(input)

    return new StepResponse({
      key: input.key,
      publicUrl: getPublicMediaUrl(input.key),
      ...download,
    })
  }
)

const createMediaDownloadUrlWorkflow = createWorkflow(
  "create-media-download-url",
  (input: CreateMediaDownloadUrlInput) => {
    const download = createMediaDownloadUrlStep(input)

    return new WorkflowResponse(download)
  }
)

export default createMediaDownloadUrlWorkflow
