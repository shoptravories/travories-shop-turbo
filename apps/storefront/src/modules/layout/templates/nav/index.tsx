import { Suspense } from "react"

import { listCategories } from "@lib/data/categories"
import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import { listRegions } from "@lib/data/regions"
import { buildPillars } from "@lib/util/pillars"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import PillarNav from "@modules/layout/components/pillar-nav"
import SideMenu from "@modules/layout/components/side-menu"

export default async function Nav() {
  const [regions, locales, currentLocale, categories] = await Promise.all([
    listRegions().then((regions: StoreRegion[]) => regions),
    listLocales(),
    getLocale(),
    listCategories().catch(() => []),
  ])

  const pillars = buildPillars(categories ?? [])

  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      <header className="relative mx-auto h-16 border-b border-ui-border-base bg-white/90 backdrop-blur duration-200 supports-[backdrop-filter]:bg-white/80">
        <nav className="content-container txt-xsmall-plus text-ui-fg-subtle flex items-center justify-between w-full h-full text-small-regular">
          <div className="flex-1 basis-0 h-full flex items-center gap-x-6">
            <div className="h-full small:hidden">
              <SideMenu
                regions={regions}
                locales={locales}
                currentLocale={currentLocale}
              />
            </div>
            <PillarNav pillars={pillars} />
          </div>

          <div className="flex items-center h-full">
            <LocalizedClientLink
              href="/"
              className="flex flex-col items-center leading-none hover:opacity-80 transition-opacity duration-150"
              data-testid="nav-store-link"
            >
              <span className="font-playfair text-base small:text-lg text-brand-primary tracking-tight">
                Nepal Souvenirs
              </span>
              <span className="text-[9px] uppercase tracking-[0.18em] text-ui-fg-muted mt-0.5">
                by Travories
              </span>
            </LocalizedClientLink>
          </div>

          <div className="flex items-center gap-x-6 h-full flex-1 basis-0 justify-end">
            <div className="hidden small:flex items-center gap-x-6 h-full">
              <LocalizedClientLink
                className="transition-colors duration-150 hover:text-brand-accent"
                href="/gifts/finder"
                data-testid="nav-gift-finder-link"
              >
                Gift finder
              </LocalizedClientLink>
              <LocalizedClientLink
                className="transition-colors duration-150 hover:text-brand-accent"
                href="/store"
                data-testid="nav-store-all-link"
              >
                All products
              </LocalizedClientLink>
              <LocalizedClientLink
                className="transition-colors duration-150 hover:text-brand-accent"
                href="/account"
                data-testid="nav-account-link"
              >
                Account
              </LocalizedClientLink>
            </div>
            <Suspense
              fallback={
                <LocalizedClientLink
                  className="flex gap-2 transition-colors duration-150 hover:text-brand-accent"
                  href="/cart"
                  data-testid="nav-cart-link"
                >
                  Cart (0)
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>
          </div>
        </nav>
      </header>
    </div>
  )
}
