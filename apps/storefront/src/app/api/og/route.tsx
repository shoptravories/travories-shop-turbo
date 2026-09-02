import { ImageResponse } from "next/og"
import { NextRequest } from "next/server"

import { OG_COLORS, OG_IMAGE_SIZE, SITE_NAME, SITE_TAGLINE } from "@lib/seo"
import { getBaseURL } from "@lib/util/env"

export const runtime = "nodejs"

/**
 * Renders the branded 1200x630 card used for Open Graph and Twitter previews.
 * Pages pass their own title through ogImageUrl(), so a page with no
 * photography of its own still previews as something recognisably ours rather
 * than as a blank or a mismatched thumbnail.
 */

/** Only our own media may be composited in - the route is public, and without
 *  this it would happily proxy and re-host any image on the internet. */
const allowedImageHost = (url: URL) => {
  const hosts = [
    new URL(getBaseURL()).hostname,
    process.env.NEXT_PUBLIC_MEDIA_HOSTNAME,
    process.env.MEDUSA_CLOUD_S3_HOSTNAME,
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
      ? new URL(process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL).hostname
      : undefined,
  ].filter((host): host is string => Boolean(host))

  return (
    hosts.includes(url.hostname) ||
    url.hostname === "localhost" ||
    /\.amazonaws\.com$/.test(url.hostname)
  )
}

/** satori decodes PNG, JPEG, GIF and SVG - notably not WebP, which the media
 *  pipeline emits. An unsupported type renders as an empty panel with no error,
 *  so it is resolved to a data URI here and dropped when that is not possible. */
const DECODABLE = ["image/png", "image/jpeg", "image/gif", "image/svg+xml"]
const MAX_IMAGE_BYTES = 5 * 1024 * 1024

const resolveImage = async (value: string | null) => {
  if (!value) {
    return undefined
  }

  let url: URL

  try {
    url = new URL(value)
  } catch {
    return undefined
  }

  if (!/^https?:$/.test(url.protocol) || !allowedImageHost(url)) {
    return undefined
  }

  try {
    // redirect: "follow" matters - product media is served as a 302 to a
    // presigned URL rather than as the bytes themselves.
    const response = await fetch(url, { redirect: "follow" })

    if (!response.ok) {
      return undefined
    }

    const contentType = response.headers.get("content-type")?.split(";")[0].trim()

    if (!contentType || !DECODABLE.includes(contentType)) {
      return undefined
    }

    const buffer = await response.arrayBuffer()

    if (buffer.byteLength > MAX_IMAGE_BYTES) {
      return undefined
    }

    return `data:${contentType};base64,${Buffer.from(buffer).toString("base64")}`
  } catch {
    return undefined
  }
}

const clamp = (value: string | null, max: number) => {
  const trimmed = value?.replace(/\s+/g, " ").trim()

  if (!trimmed) {
    return undefined
  }

  return trimmed.length > max ? `${trimmed.slice(0, max - 1).trimEnd()}...` : trimmed
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl

  const title = clamp(searchParams.get("title"), 90) ?? SITE_NAME
  const subtitle = clamp(searchParams.get("subtitle"), 140) ?? SITE_TAGLINE
  const eyebrow = clamp(searchParams.get("eyebrow"), 40) ?? "Made in Nepal"
  const image = await resolveImage(searchParams.get("image"))

  // Long titles need to step down a size or they overflow the card.
  const titleSize = title.length > 60 ? 56 : title.length > 34 ? 68 : 82

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: OG_COLORS.ink,
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        {/* Brand wash so the card reads as ours even at thumbnail size. */}
        <div
          style={{
            position: "absolute",
            top: -260,
            left: -160,
            width: 700,
            height: 700,
            borderRadius: 9999,
            backgroundColor: OG_COLORS.primary,
            opacity: 0.35,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -320,
            right: image ? 260 : -140,
            width: 620,
            height: 620,
            borderRadius: 9999,
            backgroundColor: OG_COLORS.accent,
            opacity: 0.28,
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: 64,
            width: image ? "58%" : "100%",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                fontSize: 22,
                letterSpacing: 4,
                textTransform: "uppercase",
                color: OG_COLORS.accentLight,
              }}
            >
              {eyebrow}
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 24,
                fontSize: titleSize,
                lineHeight: 1.08,
                fontWeight: 700,
                letterSpacing: -1.5,
              }}
            >
              {title}
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 24,
                fontSize: 26,
                lineHeight: 1.45,
                color: "rgba(255,255,255,0.78)",
                maxWidth: image ? 560 : 900,
              }}
            >
              {subtitle}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                display: "flex",
                width: 44,
                height: 44,
                borderRadius: 12,
                backgroundColor: OG_COLORS.accent,
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                fontWeight: 700,
              }}
            >
              N
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginLeft: 16,
              }}
            >
              <div style={{ display: "flex", fontSize: 26, fontWeight: 600 }}>
                {SITE_NAME}
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 20,
                  color: "rgba(255,255,255,0.6)",
                }}
              >
                by Travories
              </div>
            </div>
          </div>
        </div>

        {image ? (
          <div
            style={{
              display: "flex",
              width: "42%",
              height: "100%",
              position: "relative",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt=""
              width={OG_IMAGE_SIZE.width}
              height={OG_IMAGE_SIZE.height}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        ) : null}
      </div>
    ),
    {
      ...OG_IMAGE_SIZE,
      headers: {
        // The query string fully determines the pixels, so a new title is a
        // new URL and this can be cached hard.
        "cache-control": "public, immutable, no-transform, max-age=31536000",
      },
    }
  )
}
