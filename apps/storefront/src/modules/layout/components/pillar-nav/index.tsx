"use client"

import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from "@headlessui/react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { clx } from "@modules/common/components/ui"
import { Fragment } from "react"

export type PillarLink = {
  id: string
  name: string
  handle: string
}

export type PillarGroup = {
  /** null for a flat pillar such as Souvenirs, which has no sub-grouping. */
  title: string | null
  handle: string | null
  items: PillarLink[]
}

export type Pillar = {
  name: string
  handle: string
  blurb: string
  /** Where the footer link goes. Defaults to the pillar's own category. */
  blurbHref?: string
  groups: PillarGroup[]
}

const PillarDropdown = ({ pillar }: { pillar: Pillar }) => {
  const multiColumn = pillar.groups.length > 1

  return (
    <Popover className="relative h-full flex">
      {({ open, close }) => (
        <>
          <PopoverButton
            className={clx(
              "h-full flex items-center gap-x-1 px-1 transition-colors duration-150 focus:outline-none",
              open ? "text-ui-fg-base" : "hover:text-ui-fg-base"
            )}
            data-testid={`nav-pillar-${pillar.handle}`}
          >
            {pillar.name}
            <span
              aria-hidden
              className={clx(
                "text-[9px] leading-none transition-transform duration-150",
                open && "rotate-180"
              )}
            >
              ▾
            </span>
          </PopoverButton>

          <Transition
            show={open}
            as={Fragment}
            enter="transition ease-out duration-150"
            enterFrom="opacity-0 -translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 -translate-y-1"
          >
            <PopoverPanel
              static
              className="absolute top-full left-0 z-50 mt-px bg-white border border-ui-border-base rounded-rounded shadow-lg"
            >
              <div
                className={clx(
                  "p-6 flex gap-x-10",
                  multiColumn ? "min-w-[26rem]" : "min-w-[15rem]"
                )}
              >
                {pillar.groups.map((group, i) => (
                  <div key={group.handle ?? `group-${i}`} className="min-w-[10rem]">
                    {group.title && (
                      <p className="text-xsmall-regular uppercase tracking-wider text-ui-fg-muted mb-3">
                        {group.title}
                      </p>
                    )}
                    <ul className="flex flex-col gap-y-2">
                      {group.items.map((item) => (
                        <li key={item.id}>
                          <LocalizedClientLink
                            href={`/categories/${item.handle}`}
                            onClick={close}
                            className="text-base-regular text-ui-fg-subtle hover:text-brand-terracotta transition-colors duration-150"
                            data-testid={`nav-category-${item.handle}`}
                          >
                            {item.name}
                          </LocalizedClientLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="border-t border-ui-border-base px-6 py-3 bg-brand-paper rounded-b-rounded">
                <LocalizedClientLink
                  href={pillar.blurbHref ?? `/categories/${pillar.handle}`}
                  onClick={close}
                  className="text-small-semi text-brand-navy hover:text-brand-terracotta transition-colors duration-150"
                >
                  {pillar.blurb} →
                </LocalizedClientLink>
              </div>
            </PopoverPanel>
          </Transition>
        </>
      )}
    </Popover>
  )
}

const PillarNav = ({ pillars }: { pillars: Pillar[] }) => {
  if (!pillars.length) {
    return null
  }

  return (
    <div className="hidden small:flex items-center gap-x-6 h-full">
      {pillars.map((pillar) => (
        <PillarDropdown key={pillar.handle} pillar={pillar} />
      ))}
    </div>
  )
}

export default PillarNav
