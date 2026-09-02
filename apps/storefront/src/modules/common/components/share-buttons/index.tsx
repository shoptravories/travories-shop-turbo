"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import { availableShareTargets, shareUrl } from "@lib/seo"
import { clx } from "@modules/common/components/ui"

import { CheckIcon, LinkIcon, ShareIcon, ShareNetworkIcon } from "./icons"

type ShareButtonsProps = {
  /** Absolute URL. Rendered on the server so the links work without JS. */
  url: string
  title: string
  description?: string
  image?: string
  label?: string
  className?: string
}

const buttonClass =
  "flex h-9 w-9 items-center justify-center rounded-full border border-brand-line bg-white text-ui-fg-subtle transition-colors duration-150 hover:border-brand-accent hover:text-brand-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"

const ShareButtons = ({
  url,
  title,
  description,
  image,
  label = "Share",
  className,
}: ShareButtonsProps) => {
  const [copied, setCopied] = useState(false)
  const [canShareNatively, setCanShareNatively] = useState(false)

  // Resolved after mount so the server and client render the same markup.
  useEffect(() => {
    setCanShareNatively(typeof navigator !== "undefined" && !!navigator.share)
  }, [])

  useEffect(() => {
    if (!copied) {
      return
    }

    const timeout = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timeout)
  }, [copied])

  const targets = useMemo(() => availableShareTargets(image), [image])

  const shareInput = useMemo(
    () => ({ url, title, description, image }),
    [url, title, description, image]
  )

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
    } catch {
      // Clipboard access is denied in some in-app browsers; select the URL so
      // the visitor can still copy it by hand rather than getting nothing.
      window.prompt("Copy this link", url)
    }
  }, [url])

  const handleNativeShare = useCallback(async () => {
    try {
      await navigator.share({ title, text: description, url })
    } catch {
      // The visitor dismissed the sheet - nothing to recover from.
    }
  }, [title, description, url])

  return (
    <div className={clx("flex flex-wrap items-center gap-2", className)}>
      <span className="text-small-regular text-ui-fg-muted mr-1">{label}</span>

      {canShareNatively && (
        <button
          type="button"
          onClick={handleNativeShare}
          className={buttonClass}
          aria-label="Share using your device"
          data-testid="share-native"
        >
          <ShareIcon />
        </button>
      )}

      {targets.map((target) => (
        <a
          key={target.id}
          href={shareUrl(target.id, shareInput)}
          target={target.id === "email" ? undefined : "_blank"}
          rel="noopener noreferrer nofollow"
          className={buttonClass}
          aria-label={`Share on ${target.label}`}
          data-testid={`share-${target.id}`}
        >
          <ShareNetworkIcon target={target.id} />
        </a>
      ))}

      <button
        type="button"
        onClick={handleCopy}
        className={clx(buttonClass, copied && "border-brand-accent text-brand-accent")}
        aria-label={copied ? "Link copied" : "Copy link"}
        data-testid="share-copy"
      >
        {copied ? <CheckIcon /> : <LinkIcon />}
      </button>

      <span className="sr-only" role="status" aria-live="polite">
        {copied ? "Link copied to clipboard" : ""}
      </span>
    </div>
  )
}

export default ShareButtons
