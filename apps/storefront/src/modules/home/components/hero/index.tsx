import LocalizedClientLink from "@modules/common/components/localized-client-link"

const Hero = () => {
  return (
    <section className="relative w-full bg-brand-navy text-brand-paper border-b border-ui-border-base overflow-hidden">
      {/* Soft terracotta wash so the flat navy does not read as a dead block
          until real photography is dropped in behind it. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -right-24 h-[28rem] w-[28rem] rounded-circle bg-brand-terracotta/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-32 h-[26rem] w-[26rem] rounded-circle bg-brand-saffron/10 blur-3xl"
      />

      <div className="content-container relative z-10 py-20 small:py-28 flex flex-col items-center text-center gap-y-6">
        <span className="text-xsmall-regular uppercase tracking-[0.22em] text-brand-saffron">
          Part of the Travories family
        </span>

        <h1 className="font-playfair text-[34px] leading-[1.15] small:text-[54px] max-w-3xl">
          Carry a piece of Nepal home
        </h1>

        <p className="text-base-regular small:text-large-regular text-brand-paper/75 max-w-xl">
          Hand-made souvenirs and gifts from the valleys, hills and
          trails you travelled. Sourced from Nepali artisans, shipped
          from Kathmandu.
        </p>

        <div className="flex flex-col xsmall:flex-row items-center gap-3 mt-2">
          <LocalizedClientLink
            href="/categories/souvenirs"
            className="w-full xsmall:w-auto px-7 py-3 rounded-rounded bg-brand-paper text-brand-navy text-base-semi hover:bg-brand-sand transition-colors duration-150"
            data-testid="hero-souvenirs-cta"
          >
            Shop by destination
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/categories/gifts"
            className="w-full xsmall:w-auto px-7 py-3 rounded-rounded border border-brand-paper/40 text-brand-paper text-base-semi hover:bg-brand-paper/10 transition-colors duration-150"
            data-testid="hero-gifts-cta"
          >
            Find a gift
          </LocalizedClientLink>
        </div>
      </div>
    </section>
  )
}

export default Hero
