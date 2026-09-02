"use client"

import * as Accordion from "@radix-ui/react-accordion"
import { useEffect, useState } from "react"

import { sdk } from "@lib/config"
import { ChevronDownMini } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { clx } from "@modules/common/components/ui"

type OptionsPickerProps = {
  selectedValueIds: string[]
  setOptionValueIds: (valueIds: string[]) => void
  onClear?: () => void
}

const OptionsPicker = ({
  selectedValueIds,
  setOptionValueIds,
  onClear,
}: OptionsPickerProps) => {
  const [options, setOptions] = useState<HttpTypes.StoreProductOption[]>([])
  const [openItems, setOpenItems] = useState<string[]>([])

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await sdk.client.fetch<{
          product_options?: HttpTypes.StoreProductOption[]
        }>("/store/product-options", {
          method: "GET",
          query: {
            is_exclusive: false,
            fields: "*values",
          },
        })

        if (response?.product_options) {
          setOptions(response.product_options)
        }
      } catch (error) {
        console.error("Failed to fetch product options", error)
      }
    }

    fetchOptions()
  }, [])

  useEffect(() => {
    if (options.length) {
      setOpenItems(options.map((option) => option.id))
    }
  }, [options])

  if (!options.length) {
    return null
  }

  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xsmall-regular uppercase tracking-[0.18em] text-brand-accent">
          Refine
        </span>
        {selectedValueIds.length > 0 && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="text-small-regular text-ui-fg-muted underline-offset-4 transition-colors duration-150 hover:text-brand-primary hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      <Accordion.Root
        type="multiple"
        value={openItems}
        onValueChange={(values) => setOpenItems(values as string[])}
        className="flex flex-col gap-y-1"
      >
        {options.map((option) => {
          const values =
            option.values
              ?.map((value) => ({ id: value.id, label: value.value }))
              .filter(
                (value): value is { id: string; label: string } =>
                  !!value.id && !!value.label
              ) || []

          if (!values.length) {
            return null
          }

          const toggleValue = (valueId: string) => {
            const isSelected = selectedValueIds.includes(valueId)
            const nextSelections = isSelected
              ? selectedValueIds.filter((id) => id !== valueId)
              : [...selectedValueIds, valueId]

            setOptionValueIds(Array.from(new Set(nextSelections)))
          }

          const isOpen = openItems.includes(option.id)
          const selectedCount = values.filter((value) =>
            selectedValueIds.includes(value.id)
          ).length

          return (
            <Accordion.Item
              key={option.id}
              value={option.id}
              className="overflow-hidden border-b border-ui-border-base last:border-b-0"
            >
              <Accordion.Header>
                <Accordion.Trigger className="flex w-full items-center justify-between py-3.5 text-left">
                  <span className="flex items-center gap-x-2 text-base-semi text-brand-primary">
                    {option.title || "Option"}
                    {selectedCount > 0 && (
                      <span className="rounded-circle bg-brand-accent px-1.5 py-0.5 text-tiny text-white">
                        {selectedCount}
                      </span>
                    )}
                  </span>
                  <span
                    className={clx(
                      "flex h-6 w-6 items-center justify-center text-ui-fg-muted transition-transform duration-150",
                      isOpen && "rotate-180"
                    )}
                  >
                    <ChevronDownMini />
                  </span>
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className="pb-4 pt-1">
                <div className="flex flex-wrap gap-2">
                  {values.map((value) => {
                    const isSelected = selectedValueIds.includes(value.id)

                    return (
                      <button
                        key={value.id}
                        type="button"
                        onClick={() => toggleValue(value.id)}
                        className={clx(
                          "flex h-9 items-center rounded-circle border px-3.5 text-small-regular transition-colors duration-150",
                          isSelected
                            ? "border-brand-primary bg-brand-primary-deep text-brand-surface"
                            : "border-ui-border-base text-ui-fg-subtle hover:border-brand-accent/50 hover:text-brand-primary"
                        )}
                        aria-pressed={isSelected}
                      >
                        {value.label}
                      </button>
                    )
                  })}
                </div>
              </Accordion.Content>
            </Accordion.Item>
          )
        })}
      </Accordion.Root>
    </div>
  )
}

export default OptionsPicker
