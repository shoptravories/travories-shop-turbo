import { clx } from "@modules/common/components/ui"

/**
 * Deterministic generated artwork used wherever real photography has not
 * landed yet - product thumbnails, destination cards, editorial panels.
 *
 * The same seed always yields the same motif and palette, so a product looks
 * identical on the home page, the store grid and its own detail page, and the
 * catalogue reads as a designed set rather than a wall of grey placeholders.
 * Every colour comes from the brand tokens in globals.css.
 */

export type MotifName =
  | "mandala"
  | "peaks"
  | "flags"
  | "terraces"
  | "lattice"
  | "bowl"

const MOTIFS: MotifName[] = [
  "mandala",
  "peaks",
  "flags",
  "terraces",
  "lattice",
  "bowl",
]

type Palette = {
  /** Background wash, top to bottom. */
  from: string
  to: string
  /** The drawn line work. */
  ink: string
  /** A single accent used sparingly. */
  accent: string
}

const PALETTES: Palette[] = [
  // Light cards carry the #7e5cd9 accent over the #f5f5f5 surface; dark cards
  // invert onto the deep purple with the light lavender doing the line work.
  // Alternating the two is what gives a grid of generated art any rhythm.
  {
    from: "hsl(var(--brand-surface))",
    to: "hsl(var(--brand-surface-tint))",
    ink: "hsl(var(--brand-accent))",
    accent: "hsl(var(--brand-primary-deep))",
  },
  {
    from: "hsl(var(--brand-surface-tint))",
    to: "hsl(var(--brand-surface))",
    ink: "hsl(var(--brand-primary))",
    accent: "hsl(var(--brand-accent))",
  },
  {
    from: "hsl(var(--brand-primary-deep))",
    to: "hsl(var(--brand-primary))",
    ink: "hsl(var(--brand-accent-light))",
    accent: "hsl(var(--brand-surface))",
  },
  {
    from: "hsl(var(--brand-surface))",
    to: "hsl(var(--brand-surface))",
    ink: "hsl(var(--brand-primary-deep))",
    accent: "hsl(var(--brand-accent))",
  },
  {
    from: "hsl(var(--brand-primary))",
    to: "hsl(var(--brand-primary-deep))",
    ink: "hsl(var(--brand-surface))",
    accent: "hsl(var(--brand-accent-light))",
  },
]

/** Small stable string hash - not cryptographic, just needs to be repeatable. */
const hash = (seed: string) => {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

const Mandala = ({ ink, accent }: Palette) => (
  <g fill="none" strokeLinecap="round">
    <circle cx="100" cy="100" r="58" stroke={ink} strokeOpacity="0.28" />
    <circle cx="100" cy="100" r="42" stroke={ink} strokeOpacity="0.45" />
    <circle cx="100" cy="100" r="14" stroke={accent} strokeOpacity="0.5" />
    {Array.from({ length: 12 }).map((_, i) => (
      <ellipse
        key={i}
        cx="100"
        cy="58"
        rx="9"
        ry="24"
        stroke={ink}
        strokeOpacity="0.38"
        transform={`rotate(${i * 30} 100 100)`}
      />
    ))}
    {Array.from({ length: 24 }).map((_, i) => (
      <circle
        key={i}
        cx="100"
        cy="26"
        r="1.6"
        fill={accent}
        fillOpacity="0.45"
        stroke="none"
        transform={`rotate(${i * 15} 100 100)`}
      />
    ))}
  </g>
)

const Peaks = ({ ink, accent }: Palette) => (
  <g>
    <path
      d="M-10 150 L38 78 L70 112 L110 46 L146 100 L178 70 L210 150 Z"
      fill={ink}
      fillOpacity="0.16"
    />
    <path
      d="M-10 150 L38 78 L70 112 L110 46 L146 100 L178 70 L210 150"
      fill="none"
      stroke={ink}
      strokeOpacity="0.5"
      strokeLinejoin="round"
    />
    <path
      d="M-10 158 L30 122 L64 144 L104 108 L150 140 L186 118 L210 158 Z"
      fill={accent}
      fillOpacity="0.12"
    />
    <circle cx="152" cy="42" r="11" fill={accent} fillOpacity="0.3" />
    <path
      d="M92 62 L110 46 L128 62"
      fill="none"
      stroke={accent}
      strokeOpacity="0.5"
    />
  </g>
)

const Flags = ({ ink, accent }: Palette) => (
  <g>
    {[36, 78, 120].map((y, row) => (
      <g key={y}>
        <path
          d={`M-6 ${y - 12} Q100 ${y + 16} 206 ${y - 12}`}
          fill="none"
          stroke={ink}
          strokeOpacity="0.35"
        />
        {Array.from({ length: 7 }).map((_, i) => {
          const x = 12 + i * 29
          const dip = Math.sin((x / 200) * Math.PI) * 26
          const top = y - 12 + dip
          return (
            <path
              key={i}
              d={`M${x} ${top} L${x + 20} ${top + 2} L${x + 20} ${
                top + 24
              } L${x} ${top + 22} Z`}
              fill={(i + row) % 2 === 0 ? ink : accent}
              fillOpacity={(i + row) % 2 === 0 ? 0.3 : 0.22}
            />
          )
        })}
      </g>
    ))}
  </g>
)

const Terraces = ({ ink, accent }: Palette) => (
  <g fill="none">
    {Array.from({ length: 9 }).map((_, i) => (
      <path
        key={i}
        d={`M-10 ${44 + i * 15} Q60 ${28 + i * 15} 100 ${
          44 + i * 15
        } T210 ${36 + i * 15}`}
        stroke={i % 3 === 0 ? accent : ink}
        strokeOpacity={i % 3 === 0 ? 0.4 : 0.26}
      />
    ))}
    <circle cx="158" cy="40" r="13" fill={accent} fillOpacity="0.24" stroke="none" />
  </g>
)

const Lattice = ({ ink, accent }: Palette) => (
  <g fill="none">
    <rect
      x="34"
      y="34"
      width="132"
      height="132"
      rx="4"
      stroke={ink}
      strokeOpacity="0.45"
    />
    <rect
      x="48"
      y="48"
      width="104"
      height="104"
      rx="3"
      stroke={ink}
      strokeOpacity="0.28"
    />
    {Array.from({ length: 3 }).map((_, i) => (
      <line
        key={`v${i}`}
        x1={74 + i * 26}
        y1="48"
        x2={74 + i * 26}
        y2="152"
        stroke={ink}
        strokeOpacity="0.24"
      />
    ))}
    {Array.from({ length: 3 }).map((_, i) => (
      <line
        key={`h${i}`}
        x1="48"
        y1={74 + i * 26}
        x2="152"
        y2={74 + i * 26}
        stroke={ink}
        strokeOpacity="0.24"
      />
    ))}
    <path
      d="M100 66 L126 100 L100 134 L74 100 Z"
      stroke={accent}
      strokeOpacity="0.55"
    />
    <circle cx="100" cy="100" r="8" stroke={accent} strokeOpacity="0.4" />
  </g>
)

const Bowl = ({ ink, accent }: Palette) => (
  <g fill="none">
    <path
      d="M50 92 Q100 168 150 92"
      stroke={ink}
      strokeOpacity="0.5"
      strokeWidth="1.5"
    />
    <path d="M44 92 L156 92" stroke={ink} strokeOpacity="0.45" />
    <path d="M62 96 Q100 148 138 96" stroke={ink} strokeOpacity="0.25" />
    {[0, 1, 2, 3].map((i) => (
      <path
        key={i}
        d={`M${86 - i * 12} ${70 - i * 12} Q100 ${52 - i * 14} ${
          114 + i * 12
        } ${70 - i * 12}`}
        stroke={accent}
        strokeOpacity={0.4 - i * 0.08}
      />
    ))}
  </g>
)

const RENDERERS: Record<MotifName, (p: Palette) => React.JSX.Element> = {
  mandala: Mandala,
  peaks: Peaks,
  flags: Flags,
  terraces: Terraces,
  lattice: Lattice,
  bowl: Bowl,
}

type CraftMotifProps = {
  /** Anything stable and unique - a handle, slug or id. */
  seed: string
  /** Force a motif instead of deriving it from the seed. */
  motif?: MotifName
  /** Optional word set over the artwork, used on large panels. */
  label?: string
  className?: string
}

const CraftMotif = ({ seed, motif, label, className }: CraftMotifProps) => {
  const h = hash(seed || "nepal")
  const palette = PALETTES[h % PALETTES.length]
  const name = motif ?? MOTIFS[(h >> 3) % MOTIFS.length]
  const Motif = RENDERERS[name]
  const gradientId = `motif-${name}-${h % 997}`

  return (
    <div className={clx("absolute inset-0", className)} aria-hidden>
      <svg
        viewBox="0 0 200 200"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0.4" y2="1">
            <stop offset="0%" stopColor={palette.from} />
            <stop offset="100%" stopColor={palette.to} />
          </linearGradient>
        </defs>
        <rect width="200" height="200" fill={`url(#${gradientId})`} />
        <g transform={`rotate(${(h % 5) - 2} 100 100)`}>{Motif(palette)}</g>
      </svg>
      {label && (
        <span
          className="absolute inset-x-0 bottom-0 p-4 font-playfair text-[13px] leading-tight"
          style={{ color: palette.accent }}
        >
          {label}
        </span>
      )}
    </div>
  )
}

export default CraftMotif
