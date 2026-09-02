"use client"

import { getProductPrice } from "@lib/util/get-product-price"
import { getProductBadge } from "@lib/util/product-badge"
import { HttpTypes } from "@medusajs/framework/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { clx } from "@modules/common/components/ui"
import Thumbnail from "@modules/products/components/thumbnail"
import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useRef, useState } from "react"

const SHUFFLE_MS = 1800
const SHUFFLE_STEP_MS = 120

const SurpriseRevealCard = ({ product }: { product: HttpTypes.StoreProduct }) => {
  const { cheapestPrice } = getProductPrice({ product })
  const badge = getProductBadge(product)
  const isSale = cheapestPrice?.price_type === "sale"

  return (
    <LocalizedClientLink
      href={`/products/${product.handle}`}
      className="group block"
      data-testid="surprise-product"
    >
      <div className="overflow-hidden rounded-card border border-brand-accent/20 bg-white shadow-[0_28px_56px_-40px_hsl(var(--brand-primary-deep)/0.5)] transition-transform duration-300 group-hover:-translate-y-1 motion-reduce:transform-none">
        <div className="grid gap-0 small:grid-cols-[minmax(0,17rem)_1fr]">
          <div className="border-b border-brand-line/60 bg-brand-sand/50 small:border-b-0 small:border-r">
            <Thumbnail
              thumbnail={product.thumbnail}
              images={product.images}
              size="full"
              seed={product.handle ?? product.id}
              flat
            />
          </div>

          <div className="flex flex-col justify-between p-6 small:p-8">
            <div>
              <span className="text-xsmall-regular uppercase tracking-[0.18em] text-brand-accent">
                Lucky pick
              </span>
              <h3 className="mt-3 font-playfair text-[28px] leading-tight text-brand-heading">
                {product.title}
              </h3>
              <p className="mt-3 line-clamp-3 text-base-regular text-brand-slate/80">
                {product.description}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                {badge && (
                  <p className="text-small-regular text-ui-fg-muted">{badge}</p>
                )}
                {cheapestPrice && (
                  <div
                    className={clx(
                      "mt-1 flex items-baseline gap-x-2",
                      isSale ? "text-brand-accent" : "text-brand-primary"
                    )}
                  >
                    <span className="text-lg font-medium">
                      {cheapestPrice.calculated_price}
                    </span>
                    {isSale && (
                      <span className="text-small-regular text-ui-fg-muted line-through">
                        {cheapestPrice.original_price}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <span className="inline-flex items-center gap-x-2 rounded-circle bg-brand-primary-deep px-4 py-2 text-small-semi text-brand-surface">
                View product
                <span aria-hidden>&rarr;</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </LocalizedClientLink>
  )
}

export default function SurpriseProductPicker({
  products,
  title,
  description,
  compact = false,
  boxLabel = "Surprise drop",
  closedLabel = "Tap to open",
  openingLabel = "Opening...",
  shuffleLabel = "Rolling the reward reel",
  readyLabel = "Ready to open",
  unlockedLabel = "Unlocked for you",
  retryLabel = "Pick another",
}: {
  products: HttpTypes.StoreProduct[]
  title: string
  description: string
  compact?: boolean
  boxLabel?: string
  closedLabel?: string
  openingLabel?: string
  shuffleLabel?: string
  readyLabel?: string
  unlockedLabel?: string
  retryLabel?: string
}) {
  const [isShuffling, setIsShuffling] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const intervalRef = useRef<number | null>(null)
  const timeoutRef = useRef<number | null>(null)

  const clearTimers = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }

  useEffect(() => {
    setIsShuffling(false)
    setActiveIndex(0)
    setSelectedId(null)

    if (intervalRef.current) {
      window.clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current)
        intervalRef.current = null
      }

      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [products])

  if (!products.length) {
    return null
  }

  const activeProduct = products[activeIndex % products.length]
  const selectedProduct =
    products.find((product) => product.id === selectedId) ?? null

  const runShuffle = () => {
    if (isShuffling) {
      return
    }

    setSelectedId(null)
    setIsShuffling(true)

    intervalRef.current = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % products.length)
    }, SHUFFLE_STEP_MS)

    timeoutRef.current = window.setTimeout(() => {
      clearTimers()

      const nextIndex = Math.floor(Math.random() * products.length)
      setActiveIndex(nextIndex)
      setSelectedId(products[nextIndex].id)
      setIsShuffling(false)
    }, SHUFFLE_MS)
  }

  return (
    <div
      className={clx(
        "overflow-hidden rounded-[2rem] border border-brand-line bg-[radial-gradient(circle_at_top,#fff3e8,transparent_40%),linear-gradient(135deg,#fff8ef_0%,#ffffff_45%,#f7ece2_100%)] shadow-[0_30px_60px_-46px_hsl(var(--brand-primary-deep)/0.45)]",
        compact ? "p-6" : "mb-10 p-6 small:p-8"
      )}
    >
      <div
        className={clx(
          "items-center gap-8",
          compact
            ? "grid grid-cols-1 medium:grid-cols-[minmax(0,16rem)_1fr]"
            : "grid grid-cols-1 small:grid-cols-[minmax(0,18rem)_1fr]"
        )}
      >
        <div className="flex flex-col items-center text-center">
          <motion.button
            type="button"
            onClick={runShuffle}
            whileTap={{ scale: 0.98 }}
            animate={
              isShuffling
                ? { rotate: [-2, 2, -2], y: [0, -6, 0] }
                : { rotate: 0, y: 0 }
            }
            transition={
              isShuffling
                ? { duration: 0.45, repeat: Infinity, ease: "easeInOut" }
                : { duration: 0.2 }
            }
            className="relative flex h-56 w-full max-w-[16rem] items-center justify-center overflow-hidden rounded-[2rem] border border-[#ffb07a] bg-[linear-gradient(180deg,#ffb37d_0%,#ff8f63_48%,#8b2f1c_100%)] px-6 text-brand-surface shadow-[0_22px_44px_-28px_hsl(var(--brand-primary-deep)/0.8)]"
            data-testid="surprise-picker-trigger"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.25),transparent_30%),repeating-linear-gradient(135deg,transparent,transparent_14px,rgba(255,255,255,0.06)_14px,rgba(255,255,255,0.06)_28px)]" />
            <div className="absolute inset-x-5 top-4 h-8 rounded-[999px] border border-white/20 bg-white/8" />
            <motion.div
              aria-hidden
              animate={
                isShuffling
                  ? { rotate: [-12, 12, -8, 8, 0], y: [-2, 0, -1, 0] }
                  : { rotate: 0, y: 0 }
              }
              transition={
                isShuffling
                  ? { duration: 0.55, repeat: Infinity, ease: "easeInOut" }
                  : { duration: 0.2 }
              }
              className="absolute left-4 right-4 top-3 h-12 origin-bottom rounded-[1.25rem] border border-white/15 bg-[linear-gradient(180deg,#ffd564_0%,#ff9e2c_60%,#df5c24_100%)]"
            />
            <motion.div
              aria-hidden
              animate={
                isShuffling
                  ? { opacity: [0.2, 0.75, 0.2], scale: [0.9, 1.08, 0.9] }
                  : { opacity: 0.35, scale: 1 }
              }
              transition={
                isShuffling
                  ? { duration: 0.7, repeat: Infinity, ease: "easeInOut" }
                  : { duration: 0.25 }
              }
              className="absolute inset-10 rounded-full bg-[radial-gradient(circle,#ffe08f_0%,rgba(255,224,143,0)_72%)]"
            />
            <div className="relative z-10">
              <span className="block text-xsmall-regular uppercase tracking-[0.24em] text-[#fff5d4]">
                {boxLabel}
              </span>
              <span className="mt-3 block font-playfair text-[30px] leading-none">
                {isShuffling ? openingLabel : closedLabel}
              </span>
              <span className="mt-3 block text-small-regular text-brand-surface/80">
                Arcade-style random pick from live catalogue data.
              </span>
            </div>
          </motion.button>
        </div>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xsmall-regular uppercase tracking-[0.18em] text-brand-accent">
                Automatic suggestion
              </span>
              <h3 className="mt-2 font-playfair text-[28px] leading-tight text-brand-heading">
                {title}
              </h3>
            </div>
            {selectedProduct && (
              <button
                type="button"
                onClick={runShuffle}
                className="rounded-circle border border-brand-line px-4 py-2 text-small-semi text-brand-primary transition-colors duration-150 hover:border-brand-accent hover:text-brand-accent"
              >
                {retryLabel}
              </button>
            )}
          </div>

          <div className="mt-5 min-h-[5rem] rounded-[1.5rem] border border-dashed border-brand-line bg-white/70 px-5 py-4">
            <p className="text-small-regular uppercase tracking-[0.18em] text-ui-fg-muted">
              {isShuffling
                ? shuffleLabel
                : selectedProduct
                  ? unlockedLabel
                  : readyLabel}
            </p>
            <AnimatePresence mode="wait">
              <motion.p
                key={activeProduct.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className={clx(
                  "mt-2 font-playfair text-[24px] text-brand-heading",
                  isShuffling && "tracking-[0.04em]"
                )}
              >
                {selectedProduct?.title ?? activeProduct.title}
              </motion.p>
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait">
            {selectedProduct ? (
              <motion.div
                key={selectedProduct.id}
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="mt-6"
              >
                <SurpriseRevealCard product={selectedProduct} />
              </motion.div>
            ) : (
              <motion.p
                key="helper"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-6 text-base-regular text-brand-slate/75"
              >
                {isShuffling
                  ? "The box is cycling through your options."
                  : description}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
