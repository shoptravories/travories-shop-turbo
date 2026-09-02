"use client"

import { motion, useReducedMotion, type Variants } from "framer-motion"

/**
 * Scroll-triggered stagger for grids and rails.
 *
 * `Reveal` fades a whole band in as one object, which is right for editorial
 * blocks but makes a six-card grid land with a thud. This animates the
 * children one after another instead, so a row assembles rather than appears.
 *
 * Both parts accept `as` because the markup they wrap is often a real list -
 * turning a `ul`/`li` into divs to get animation would cost the semantics.
 */

const CONTAINER: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.07, delayChildren: 0.04 },
  },
}

const ITEM: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    // Matches the `ease-sleek` curve in tailwind.config.js, so a card that
    // reveals and then lifts on hover decelerates the same way twice.
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
}

type Tag = "div" | "ul" | "ol" | "li" | "section"

type Props = {
  children: React.ReactNode
  className?: string
  as?: Tag
  /** Forwarded explicitly - JSX does not type-check hyphenated attributes on
      a custom component, so an `aria-hidden` passed by a caller would be
      silently dropped instead of reaching the DOM. */
  "aria-hidden"?: boolean
}

export const Stagger = ({
  children,
  className,
  as = "div",
  "aria-hidden": ariaHidden,
  /** `mount` for above-the-fold content that is already in view on load. */
  mode = "view",
}: Props & { mode?: "view" | "mount" }) => {
  const reduceMotion = useReducedMotion()
  const Tag = motion[as]

  if (reduceMotion) {
    const Plain = as
    return (
      <Plain className={className} aria-hidden={ariaHidden}>
        {children}
      </Plain>
    )
  }

  return (
    <Tag
      className={className}
      aria-hidden={ariaHidden}
      variants={CONTAINER}
      initial="hidden"
      {...(mode === "mount"
        ? { animate: "show" }
        : {
            whileInView: "show",
            viewport: { once: true, amount: 0.08, margin: "0px 0px -6% 0px" },
          })}
    >
      {children}
    </Tag>
  )
}

export const StaggerItem = ({
  children,
  className,
  as = "div",
  "aria-hidden": ariaHidden,
}: Props) => {
  const reduceMotion = useReducedMotion()
  const Tag = motion[as]

  if (reduceMotion) {
    const Plain = as
    return (
      <Plain className={className} aria-hidden={ariaHidden}>
        {children}
      </Plain>
    )
  }

  return (
    <Tag className={className} aria-hidden={ariaHidden} variants={ITEM}>
      {children}
    </Tag>
  )
}
