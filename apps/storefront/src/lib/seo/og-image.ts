import { OG_IMAGE_SIZE, SITE_SUFFIX } from "./config"
import { absoluteImageUrl, absoluteUrl } from "./urls"

export type OgImageInput = {
  title?: string
  subtitle?: string
  eyebrow?: string
  /** Product or destination photography. Rendered inside the branded card. */
  image?: string | null
}

const clamp = (value: string | undefined, max: number) => {
  const trimmed = value?.replace(/\s+/g, " ").trim()

  if (!trimmed) {
    return undefined
  }

  return trimmed.length > max ? `${trimmed.slice(0, max - 1).trimEnd()}...` : trimmed
}

/**
 * Points at the dynamic renderer in app/api/og. Every page therefore gets a
 * branded 1200x630 card even when it has no photography of its own, which is
 * what stops link previews falling back to a blank or mismatched thumbnail.
 */
export const ogImageUrl = ({ title, subtitle, eyebrow, image }: OgImageInput = {}) => {
  const params = new URLSearchParams()

  const clampedTitle = clamp(title, 90)
  const clampedSubtitle = clamp(subtitle, 140)
  const clampedEyebrow = clamp(eyebrow, 40)
  const photo = absoluteImageUrl(image)

  if (clampedTitle) {
    params.set("title", clampedTitle)
  }
  if (clampedSubtitle) {
    params.set("subtitle", clampedSubtitle)
  }
  if (clampedEyebrow) {
    params.set("eyebrow", clampedEyebrow)
  }
  if (photo) {
    params.set("image", photo)
  }

  const query = params.toString()

  return absoluteUrl(`/api/og${query ? `?${query}` : ""}`)
}

export const ogImageDescriptor = (input: OgImageInput = {}) => ({
  url: ogImageUrl(input),
  width: OG_IMAGE_SIZE.width,
  height: OG_IMAGE_SIZE.height,
  alt: input.title ? `${input.title} - ${SITE_SUFFIX}` : SITE_SUFFIX,
  type: "image/png",
})
