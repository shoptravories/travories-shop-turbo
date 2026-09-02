import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import { listDestinations } from "@lib/data/destinations"
import { categoryDepth } from "@lib/util/product-badge"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import MedusaCTA from "@modules/layout/components/medusa-cta"
import { Text } from "@modules/common/components/ui"

const HELP_LINKS = [
  { label: "Gift finder", href: "/gifts/finder" },
  { label: "All products", href: "/store" },
  { label: "Destinations", href: "/destinations" },
  { label: "Your account", href: "/account" },
  { label: "Cart", href: "/cart" },
]

const FooterColumn = ({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) => (
  <div className="flex flex-col gap-y-3">
    <span className="text-xsmall-regular uppercase tracking-[0.18em] text-brand-accent-light">
      {title}
    </span>
    <ul className="flex flex-col gap-y-2 text-base-regular text-brand-surface/70">
      {children}
    </ul>
  </div>
)

export default async function Footer() {
  const [{ collections }, categories, destinations] = await Promise.all([
    listCollections({ fields: "id, handle, title" }),
    listCategories().catch(() => []),
    listDestinations(),
  ])

  const giftCategories = (categories ?? [])
    .filter((category) => categoryDepth(category) === 3)
    .slice(0, 6)

  return (
    <footer className="bg-brand-primary-deep text-brand-surface">
      <div className="content-container flex flex-col">
        <div className="grid grid-cols-1 gap-10 border-b border-brand-surface/15 py-16 small:grid-cols-[1.2fr_repeat(3,minmax(0,1fr))] small:py-20">
          <div className="flex flex-col gap-y-4">
            <LocalizedClientLink
              href="/"
              className="flex flex-col leading-none transition-opacity duration-150 hover:opacity-80"
            >
              <span className="font-playfair text-[22px] tracking-tight">
                Nepal Souvenirs
              </span>
              <span className="mt-1 text-tiny uppercase tracking-[0.2em] text-brand-surface/50">
                by Travories
              </span>
            </LocalizedClientLink>

            <p className="max-w-xs text-base-regular text-brand-surface/65">
              Hand-made souvenirs and gifts from Nepal. Sourced from named
              workshops, packed in Kathmandu, sent wherever you are.
            </p>

            <a
              href="https://travories.com"
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex w-fit items-center gap-x-2 rounded-circle border border-brand-surface/30 px-5 py-2.5 text-base-semi transition-colors duration-150 hover:bg-brand-surface/10"
            >
              Book a trek on Travories
              <span aria-hidden>&rarr;</span>
            </a>
          </div>

          {destinations.length > 0 && (
            <FooterColumn title="Destinations">
              {destinations.slice(0, 6).map((destination) => (
                <li key={destination.id}>
                  <LocalizedClientLink
                    href={`/destinations/${destination.slug}`}
                    className="transition-colors duration-150 hover:text-brand-accent-light"
                    data-testid="footer-destination-link"
                  >
                    {destination.name}
                  </LocalizedClientLink>
                </li>
              ))}
            </FooterColumn>
          )}

          {giftCategories.length > 0 && (
            <FooterColumn title="Gifts">
              {giftCategories.map((category) => (
                <li key={category.id}>
                  <LocalizedClientLink
                    href={`/categories/${category.handle}`}
                    className="transition-colors duration-150 hover:text-brand-accent-light"
                    data-testid="category-link"
                  >
                    {category.name}
                  </LocalizedClientLink>
                </li>
              ))}
            </FooterColumn>
          )}

          <FooterColumn title="Shop">
            {HELP_LINKS.map((link) => (
              <li key={link.href}>
                <LocalizedClientLink
                  href={link.href}
                  className="transition-colors duration-150 hover:text-brand-accent-light"
                >
                  {link.label}
                </LocalizedClientLink>
              </li>
            ))}
            {collections?.slice(0, 3).map((collection) => (
              <li key={collection.id}>
                <LocalizedClientLink
                  href={`/collections/${collection.handle}`}
                  className="transition-colors duration-150 hover:text-brand-accent-light"
                >
                  {collection.title}
                </LocalizedClientLink>
              </li>
            ))}
          </FooterColumn>
        </div>

        <div className="flex flex-col items-start justify-between gap-4 py-8 text-brand-surface/50 small:flex-row small:items-center">
          <Text className="text-small-regular">
            &copy; {new Date().getFullYear()} Nepal Souvenirs by Travories. All
            prices in NPR, VAT included.
          </Text>
          <MedusaCTA />
        </div>
      </div>
    </footer>
  )
}
