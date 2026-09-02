import { SITE_SUFFIX, TWITTER_HANDLE } from "./config"

export type ShareTarget =
  | "x"
  | "facebook"
  | "whatsapp"
  | "pinterest"
  | "linkedin"
  | "telegram"
  | "email"

export type ShareInput = {
  /** Absolute URL of the page being shared. */
  url: string
  title: string
  description?: string
  /** Pinterest refuses a pin without an image. */
  image?: string
}

export const SHARE_TARGETS: { id: ShareTarget; label: string }[] = [
  { id: "x", label: "X" },
  { id: "facebook", label: "Facebook" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "pinterest", label: "Pinterest" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "telegram", label: "Telegram" },
  { id: "email", label: "Email" },
]

/**
 * Every network takes a different parameter name for the same three values, so
 * the intent - "share this page" - is expressed once here and the components
 * just render links.
 */
export const shareUrl = (target: ShareTarget, { url, title, description, image }: ShareInput) => {
  const text = description ? `${title} - ${description}` : title

  switch (target) {
    case "x": {
      const params = new URLSearchParams({ url, text: title })
      if (TWITTER_HANDLE) {
        params.set("via", TWITTER_HANDLE.replace("@", ""))
      }
      return `https://twitter.com/intent/tweet?${params.toString()}`
    }
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?${new URLSearchParams({ u: url })}`
    case "whatsapp":
      return `https://wa.me/?${new URLSearchParams({ text: `${title} ${url}` })}`
    case "pinterest":
      return `https://pinterest.com/pin/create/button/?${new URLSearchParams({
        url,
        description: text,
        ...(image ? { media: image } : {}),
      })}`
    case "linkedin":
      return `https://www.linkedin.com/sharing/share-offsite/?${new URLSearchParams({ url })}`
    case "telegram":
      return `https://t.me/share/url?${new URLSearchParams({ url, text: title })}`
    case "email":
      return `mailto:?${new URLSearchParams({
        subject: `${title} | ${SITE_SUFFIX}`,
        body: `${text}\n\n${url}`,
      })
        .toString()
        .replace(/\+/g, "%20")}`
  }
}

/** Networks that cannot pin without an image are dropped when there is none. */
export const availableShareTargets = (image?: string) =>
  SHARE_TARGETS.filter((target) => target.id !== "pinterest" || Boolean(image))
