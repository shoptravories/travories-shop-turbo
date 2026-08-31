"use client"

import Lenis from "lenis"
import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"

/**
 * Interpolated smooth scrolling.
 *
 * Deliberately does NOT initialise when the OS asks for reduced motion, and
 * tears down live if the user flips that setting - globals.css already promises
 * reduced motion is honoured, and hijacking the scroll would silently break it.
 */
const SmoothScroll = () => {
  const lenisRef = useRef<Lenis | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    let rafId = 0

    const start = () => {
      if (lenisRef.current) {
        return
      }

      const lenis = new Lenis({
        duration: 1.05,
        // Exponential ease-out: quick to respond, long settle.
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 1.6,
      })

      lenisRef.current = lenis

      const raf = (time: number) => {
        lenis.raf(time)
        rafId = requestAnimationFrame(raf)
      }
      rafId = requestAnimationFrame(raf)
    }

    const stop = () => {
      if (rafId) {
        cancelAnimationFrame(rafId)
        rafId = 0
      }
      lenisRef.current?.destroy()
      lenisRef.current = null
    }

    const sync = () => (media.matches ? stop() : start())

    sync()
    media.addEventListener("change", sync)

    return () => {
      media.removeEventListener("change", sync)
      stop()
    }
  }, [])

  // Lenis owns the scroll position, so the App Router's own restoration does not
  // apply. Jump to the top on navigation rather than landing mid-page.
  useEffect(() => {
    lenisRef.current?.scrollTo(0, { immediate: true })
  }, [pathname])

  return null
}

export default SmoothScroll
