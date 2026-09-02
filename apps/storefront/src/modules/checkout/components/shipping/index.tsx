"use client"
import { Radio, RadioGroup } from "@headlessui/react"
import { setShippingMethod } from "@lib/data/cart"
import type { RequiredShippingProfile } from "@lib/data/shipping-requirements"
import { calculatePriceForShippingOption } from "@lib/data/fulfillment"
import { convertToLocale } from "@lib/util/money"
import { CheckCircleSolid, Loader } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import ErrorMessage from "@modules/checkout/components/error-message"
import Divider from "@modules/common/components/divider"
import MedusaRadio from "@modules/common/components/radio"
import { Button, clx, Heading, Text } from "@modules/common/components/ui"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

const PICKUP_OPTION_ON = "__PICKUP_ON"
const PICKUP_OPTION_OFF = "__PICKUP_OFF"

type ShippingProps = {
  cart: HttpTypes.StoreCart
  availableShippingMethods: HttpTypes.StoreCartShippingOption[] | null
  /**
   * The shipping profiles this cart's items require. A cart mixing fragile and
   * standard goods requires a method for EACH profile - Medusa refuses to
   * complete the cart otherwise.
   */
  requiredProfiles?: RequiredShippingProfile[]
}

function formatAddress(address: HttpTypes.StoreCartAddress) {
  if (!address) {
    return ""
  }

  let ret = ""

  if (address.address_1) {
    ret += ` ${address.address_1}`
  }

  if (address.address_2) {
    ret += `, ${address.address_2}`
  }

  if (address.postal_code) {
    ret += `, ${address.postal_code} ${address.city}`
  }

  if (address.country_code) {
    ret += `, ${address.country_code.toUpperCase()}`
  }

  return ret
}

const Shipping: React.FC<ShippingProps> = ({
  cart,
  availableShippingMethods,
  requiredProfiles = [],
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingPrices, setIsLoadingPrices] = useState(true)

  const [showPickupOptions, setShowPickupOptions] =
    useState<string>(PICKUP_OPTION_OFF)
  const [calculatedPricesMap, setCalculatedPricesMap] = useState<
    Record<string, number>
  >({})
  const [error, setError] = useState<string | null>(null)
  const [shippingMethodId, setShippingMethodId] = useState<string | null>(
    cart.shipping_methods?.at(-1)?.shipping_option_id || null
  )

  const profileOf = (optionId: string) =>
    availableShippingMethods?.find((o) => o.id === optionId)
      ?.shipping_profile_id ?? null

  // Seed from the cart so an in-progress checkout survives a reload.
  const [selectedByProfile, setSelectedByProfile] = useState<
    Record<string, string>
  >(() => {
    const initial: Record<string, string> = {}
    for (const method of cart.shipping_methods ?? []) {
      const optionId = method.shipping_option_id
      if (!optionId) {
        continue
      }
      const profileId = availableShippingMethods?.find(
        (o) => o.id === optionId
      )?.shipping_profile_id
      if (profileId) {
        initial[profileId] = optionId
      }
    }
    return initial
  })

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "delivery"

  const _shippingMethods = availableShippingMethods?.filter(
    (sm) => (sm as unknown as { service_zone?: { fulfillment_set?: { type?: string; location?: { address: HttpTypes.StoreCartAddress } } } }).service_zone?.fulfillment_set?.type !== "pickup"
  )

  const _pickupMethods = availableShippingMethods?.filter(
    (sm) => (sm as unknown as { service_zone?: { fulfillment_set?: { type?: string; location?: { address: HttpTypes.StoreCartAddress } } } }).service_zone?.fulfillment_set?.type === "pickup"
  )

  const hasPickupOptions = !!_pickupMethods?.length

  useEffect(() => {
    setIsLoadingPrices(true)

    if (_shippingMethods?.length) {
      const promises = _shippingMethods
        .filter((sm) => sm.price_type === "calculated")
        .map((sm) => calculatePriceForShippingOption(sm.id, cart.id))

      if (promises.length) {
        Promise.allSettled(promises).then((res) => {
          const pricesMap: Record<string, number> = {}
          res
            .filter((r) => r.status === "fulfilled")
            .forEach((p) => {
              if (p.value?.id) {
                pricesMap[p.value.id] = p.value.amount ?? 0
              }
            })

          setCalculatedPricesMap(pricesMap)
          setIsLoadingPrices(false)
        })
      }
    }

    if (_pickupMethods?.find((m) => m.id === shippingMethodId)) {
      setShowPickupOptions(PICKUP_OPTION_ON)
    }
  }, [availableShippingMethods])

  const handleEdit = () => {
    router.push(pathname + "?step=delivery", { scroll: false })
  }

  const handleSubmit = () => {
    router.push(pathname + "?step=payment", { scroll: false })
  }

  const handleSetShippingMethod = async (
    id: string,
    variant: "shipping" | "pickup"
  ) => {
    setError(null)

    if (variant === "pickup") {
      setShowPickupOptions(PICKUP_OPTION_ON)
    } else {
      setShowPickupOptions(PICKUP_OPTION_OFF)
    }

    let currentId: string | null = null
    setIsLoading(true)
    setShippingMethodId((prev) => {
      currentId = prev
      return id
    })

    await setShippingMethod({ cartId: cart.id, shippingMethodId: id })
      .catch((err) => {
        setShippingMethodId(currentId)

        setError(err.message)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const handleSelectForProfile = async (
    profileId: string,
    optionId: string
  ) => {
    setError(null)
    setShowPickupOptions(PICKUP_OPTION_OFF)

    const previous = selectedByProfile
    setSelectedByProfile({ ...previous, [profileId]: optionId })
    setShippingMethodId(optionId)
    setIsLoading(true)

    await setShippingMethod({ cartId: cart.id, shippingMethodId: optionId })
      .catch((err) => {
        setSelectedByProfile(previous)
        setError(err.message)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  // Fall back to a single unlabelled group when requirements are unavailable,
  // so this degrades to the previous behaviour rather than blocking checkout.
  const profileGroups = requiredProfiles.length
    ? requiredProfiles
    : [{ id: "__all", name: "Shipping method", product_titles: [] }]

  const optionsForProfile = (profileId: string) =>
    profileId === "__all"
      ? _shippingMethods ?? []
      : (_shippingMethods ?? []).filter(
          (o) => o.shipping_profile_id === profileId
        )

  const isPickup = showPickupOptions === PICKUP_OPTION_ON

  const allProfilesSatisfied = requiredProfiles.length
    ? requiredProfiles.every((p) => Boolean(selectedByProfile[p.id]))
    : Boolean(cart.shipping_methods?.[0])

  const canContinue = isPickup
    ? Boolean(cart.shipping_methods?.[0])
    : allProfilesSatisfied

  useEffect(() => {
    setError(null)
  }, [isOpen])

  return (
    <div className="bg-white">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          className={clx(
            "flex flex-row text-3xl-regular gap-x-2 items-baseline",
            {
              "opacity-50 pointer-events-none select-none":
                !isOpen && cart.shipping_methods?.length === 0,
            }
          )}
        >
          Delivery
          {!isOpen && (cart.shipping_methods?.length ?? 0) > 0 && (
            <CheckCircleSolid />
          )}
        </Heading>
        {!isOpen &&
          cart?.shipping_address &&
          cart?.billing_address &&
          cart?.email && (
            <Text>
              <button
                onClick={handleEdit}
                className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
                data-testid="edit-delivery-button"
              >
                Edit
              </button>
            </Text>
          )}
      </div>
      {isOpen ? (
        <>
          <div className="grid">
            <div className="flex flex-col">
              <span className="font-medium txt-medium text-ui-fg-base">
                Shipping method
              </span>
              <span className="mb-4 text-ui-fg-muted txt-medium">
                {requiredProfiles.length > 1
                  ? "Your order ships in more than one way — choose a method for each group"
                  : "How would you like your order delivered"}
              </span>
            </div>
            <div data-testid="delivery-options-container">
              <div className="pb-8 md:pt-0 pt-2">
                {hasPickupOptions && (
                  <RadioGroup
                    value={showPickupOptions}
                    onChange={(_value) => {
                      const id = _pickupMethods.find(
                        (option) => !option.insufficient_inventory
                      )?.id

                      if (id) {
                        handleSetShippingMethod(id, "pickup")
                      }
                    }}
                  >
                    <Radio
                      value={PICKUP_OPTION_ON}
                      data-testid="delivery-option-radio"
                      className={clx(
                        "flex items-center justify-between text-small-regular cursor-pointer py-4 border rounded-rounded px-8 mb-2 hover:shadow-borders-interactive-with-active",
                        {
                          "border-ui-border-interactive":
                            showPickupOptions === PICKUP_OPTION_ON,
                        }
                      )}
                    >
                      <div className="flex items-center gap-x-4">
                        <MedusaRadio
                          checked={showPickupOptions === PICKUP_OPTION_ON}
                        />
                        <span className="text-base-regular">
                          Pick up your order
                        </span>
                      </div>
                      <span className="justify-self-end text-ui-fg-base">
                        -
                      </span>
                    </Radio>
                  </RadioGroup>
                )}
                {profileGroups.map((profile) => {
                  const options = optionsForProfile(profile.id)
                  const selected = selectedByProfile[profile.id] ?? null

                  if (!options.length) {
                    return null
                  }

                  return (
                    <div key={profile.id} className="mb-6">
                      {requiredProfiles.length > 1 && (
                        <div className="mb-2">
                          <span className="font-medium txt-medium text-ui-fg-base">
                            {profile.name}
                          </span>
                          {profile.product_titles.length > 0 && (
                            <span className="text-ui-fg-muted txt-medium">
                              {" "}
                              — {profile.product_titles.join(", ")}
                            </span>
                          )}
                        </div>
                      )}

                      <RadioGroup
                        value={selected}
                        onChange={(v) => {
                          if (v) {
                            return handleSelectForProfile(profile.id, v)
                          }
                        }}
                      >
                        {options.map((option) => {
                          const isDisabled =
                            option.price_type === "calculated" &&
                            !isLoadingPrices &&
                            typeof calculatedPricesMap[option.id] !== "number"

                          return (
                            <Radio
                              key={option.id}
                              value={option.id}
                              data-testid="delivery-option-radio"
                              disabled={isDisabled}
                              className={clx(
                                "flex items-center justify-between text-small-regular cursor-pointer py-4 border rounded-rounded px-8 mb-2 hover:shadow-borders-interactive-with-active",
                                {
                                  "border-ui-border-interactive":
                                    option.id === selected,
                                  "hover:shadow-brders-none cursor-not-allowed":
                                    isDisabled,
                                }
                              )}
                            >
                              <div className="flex items-center gap-x-4">
                                <MedusaRadio checked={option.id === selected} />
                                <span className="text-base-regular">
                                  {option.name}
                                </span>
                              </div>
                              <span className="justify-self-end text-ui-fg-base">
                                {option.price_type === "flat" ? (
                                  convertToLocale({
                                    amount: option.amount!,
                                    currency_code: cart?.currency_code,
                                  })
                                ) : calculatedPricesMap[option.id] ? (
                                  convertToLocale({
                                    amount: calculatedPricesMap[option.id],
                                    currency_code: cart?.currency_code,
                                  })
                                ) : isLoadingPrices ? (
                                  <Loader />
                                ) : (
                                  "-"
                                )}
                              </span>
                            </Radio>
                          )
                        })}
                      </RadioGroup>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {showPickupOptions === PICKUP_OPTION_ON && (
            <div className="grid">
              <div className="flex flex-col">
                <span className="font-medium txt-medium text-ui-fg-base">
                  Store
                </span>
                <span className="mb-4 text-ui-fg-muted txt-medium">
                  Choose a store near you
                </span>
              </div>
              <div data-testid="delivery-options-container">
                <div className="pb-8 md:pt-0 pt-2">
                  <RadioGroup
                    value={shippingMethodId}
                    onChange={(v) => {
                      if (v) {
                        return handleSetShippingMethod(v, "pickup")
                      }
                    }}
                  >
                    {_pickupMethods?.map((option) => {
                      return (
                        <Radio
                          key={option.id}
                          value={option.id}
                          disabled={option.insufficient_inventory}
                          data-testid="delivery-option-radio"
                          className={clx(
                            "flex items-center justify-between text-small-regular cursor-pointer py-4 border rounded-rounded px-8 mb-2 hover:shadow-borders-interactive-with-active",
                            {
                              "border-ui-border-interactive":
                                option.id === shippingMethodId,
                              "hover:shadow-brders-none cursor-not-allowed":
                                option.insufficient_inventory,
                            }
                          )}
                        >
                          <div className="flex items-start gap-x-4">
                            <MedusaRadio
                              checked={option.id === shippingMethodId}
                            />
                            <div className="flex flex-col">
                              <span className="text-base-regular">
                                {option.name}
                              </span>
                              <span className="text-base-regular text-ui-fg-muted">
                                {formatAddress(
                                  (option as unknown as { service_zone?: { fulfillment_set?: { location?: { address: HttpTypes.StoreCartAddress } } } }).service_zone?.fulfillment_set?.location
                                    ?.address as HttpTypes.StoreCartAddress
                                )}
                              </span>
                            </div>
                          </div>
                          <span className="justify-self-end text-ui-fg-base">
                            {convertToLocale({
                              amount: option.amount!,
                              currency_code: cart?.currency_code,
                            })}
                          </span>
                        </Radio>
                      )
                    })}
                  </RadioGroup>
                </div>
              </div>
            </div>
          )}

          <div>
            <ErrorMessage
              error={error}
              data-testid="delivery-option-error-message"
            />
            <Button
              size="large"
              className="mt"
              onClick={handleSubmit}
              isLoading={isLoading}
              disabled={!canContinue}
              data-testid="submit-delivery-option-button"
            >
              Continue to payment
            </Button>
          </div>
        </>
      ) : (
        <div>
          <div className="text-small-regular">
            {cart && (cart.shipping_methods?.length ?? 0) > 0 && (
              <div className="flex flex-col w-1/3">
                <Text className="txt-medium-plus text-ui-fg-base mb-1">
                  Method
                </Text>
                {cart.shipping_methods!.map((method) => (
                  <Text
                    key={method.id}
                    className="txt-medium text-ui-fg-subtle"
                  >
                    {method.name}{" "}
                    {convertToLocale({
                      amount: method.amount!,
                      currency_code: cart?.currency_code,
                    })}
                  </Text>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      <Divider className="mt-8" />
    </div>
  )
}

export default Shipping
