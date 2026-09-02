"use client"

import { motion, useReducedMotion } from "framer-motion"

/**
 * Fades and lifts its children into view once they are scrolled to.
 *
 * Honours prefers-reduced-motion by rendering the content outright, matching
 * the promise globals.css already makes - `useReducedMotion` keeps that in
 * step with the OS setting if it changes mid-session.
 *
 * `delay` stays in milliseconds so existing call sites read the same as they
 * did under the hand-rolled IntersectionObserver version.
 */
const Reveal = ({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) => {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      // `once` matches the old observer, which disconnected after the first
      // intersection; `amount` is the old 0.05 threshold.
      viewport={{ once: true, amount: 0.05, margin: "0px 0px -8% 0px" }}
      transition={{
        duration: 0.7,
        delay: delay / 1000,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  )
}

export default Reveal
