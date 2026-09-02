"use client"

import { isEsewa, isManual, isStripeLike } from "@lib/constants"
import { placeOrder } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@modules/common/components/ui"
import { useElements, useStripe } from "@stripe/react-stripe-js"
import { useParams } from "next/navigation"
import React, { useState } from "react"
import ErrorMessage from "../error-message"

type PaymentButtonProps = {
  cart: HttpTypes.StoreCart
  "data-testid": string
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  cart,
  "data-testid": dataTestId,
}) => {
  const notReady =
    !cart ||
    !cart.shipping_address ||
    !cart.billing_address ||
    !cart.email ||
    (cart.shipping_methods?.length ?? 0) < 1

  const paymentSession =
    cart.payment_collection?.payment_sessions?.find(
      (session) => session.status === "pending"
    ) || cart.payment_collection?.payment_sessions?.[0]

  switch (true) {
    case isStripeLike(paymentSession?.provider_id):
      return (
        <StripePaymentButton
          notReady={notReady}
          cart={cart}
          data-testid={dataTestId}
        />
      )
    case isManual(paymentSession?.provider_id):
      return (
        <ManualTestPaymentButton notReady={notReady} data-testid={dataTestId} />
      )
    case isEsewa(paymentSession?.provider_id):
      return (
        <EsewaPaymentButton
          cart={cart}
          notReady={notReady}
          paymentSession={paymentSession}
          data-testid={dataTestId}
        />
      )
    default:
      return <Button disabled>Select a payment method</Button>
  }
}

type EsewaSessionData = {
  amount?: string
  tax_amount?: string
  total_amount?: string
  transaction_uuid?: string
  product_code?: string
  product_service_charge?: string
  product_delivery_charge?: string
  success_url?: string
  failure_url?: string
  signed_field_names?: string
  signature?: string
  form_action?: string
}

/**
 * The fields getEsewaSessionData() proves are present, so building the form
 * below needs no fallbacks. eSewa signs total_amount, transaction_uuid and
 * product_code, so posting a blank for any of them would fail the signature
 * check at the gateway rather than here.
 */
type VerifiedEsewaSessionData = EsewaSessionData &
  Required<
    Pick<
      EsewaSessionData,
      | "amount"
      | "total_amount"
      | "transaction_uuid"
      | "product_code"
      | "success_url"
      | "failure_url"
      | "signed_field_names"
      | "signature"
      | "form_action"
    >
  >

const getEsewaSessionData = (
  session: HttpTypes.StorePaymentSession | undefined
): VerifiedEsewaSessionData | null => {
  const data = session?.data as EsewaSessionData | undefined

  if (
    !data?.form_action ||
    !data.amount ||
    !data.total_amount ||
    !data.transaction_uuid ||
    !data.product_code ||
    !data.success_url ||
    !data.failure_url ||
    !data.signed_field_names ||
    !data.signature
  ) {
    return null
  }

  // The guard above checks every field, but narrowing individual optional
  // properties does not re-type the object itself.
  return data as VerifiedEsewaSessionData
}

const StripePaymentButton = ({
  cart,
  notReady,
  "data-testid": dataTestId,
}: {
  cart: HttpTypes.StoreCart
  notReady: boolean
  "data-testid"?: string
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onPaymentCompleted = async () => {
    await placeOrder()
      .catch((err) => {
        setErrorMessage(err.message)
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  const stripe = useStripe()
  const elements = useElements()
  const { countryCode } = useParams()

  const disabled = !stripe || !elements ? true : false

  const handlePayment = async () => {
    if (!stripe || !elements || !cart) {
      return
    }

    setSubmitting(true)

    await stripe
      .confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/api/payment-return?cart_id=${cart.id}&country_code=${countryCode}`,
          payment_method_data: {
            billing_details: {
              name:
                cart.billing_address?.first_name +
                " " +
                cart.billing_address?.last_name,
              address: {
                city: cart.billing_address?.city ?? undefined,
                country: cart.billing_address?.country_code ?? undefined,
                line1: cart.billing_address?.address_1 ?? undefined,
                line2: cart.billing_address?.address_2 ?? undefined,
                postal_code: cart.billing_address?.postal_code ?? undefined,
                state: cart.billing_address?.province ?? undefined,
              },
              email: cart.email,
              phone: cart.billing_address?.phone ?? undefined,
            },
          },
        },
        // Only leave the site when the selected method actually requires it, so
        // card payments still complete inline.
        redirect: "if_required",
      })
      .then(({ error, paymentIntent }) => {
        if (error) {
          const pi = error.payment_intent

          if (
            (pi && pi.status === "requires_capture") ||
            (pi && pi.status === "succeeded")
          ) {
            onPaymentCompleted()
            return
          }

          setErrorMessage(error.message || null)
          setSubmitting(false)
          return
        }

        if (
          paymentIntent.status === "requires_capture" ||
          paymentIntent.status === "succeeded"
        ) {
          onPaymentCompleted()
          return
        }

        setSubmitting(false)
      })
  }

  return (
    <>
      <Button
        disabled={disabled || notReady}
        onClick={handlePayment}
        size="large"
        isLoading={submitting}
        data-testid={dataTestId}
      >
        Place order
      </Button>
      <ErrorMessage
        error={errorMessage}
        data-testid="stripe-payment-error-message"
      />
    </>
  )
}

const ManualTestPaymentButton = ({ notReady }: { notReady: boolean }) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onPaymentCompleted = async () => {
    await placeOrder()
      .catch((err) => {
        setErrorMessage(err.message)
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  const handlePayment = () => {
    setSubmitting(true)

    onPaymentCompleted()
  }

  return (
    <>
      <Button
        disabled={notReady}
        isLoading={submitting}
        onClick={handlePayment}
        size="large"
        data-testid="submit-order-button"
      >
        Place order
      </Button>
      <ErrorMessage
        error={errorMessage}
        data-testid="manual-payment-error-message"
      />
    </>
  )
}

const EsewaPaymentButton = ({
  notReady,
  paymentSession,
}: {
  cart: HttpTypes.StoreCart
  notReady: boolean
  paymentSession?: HttpTypes.StorePaymentSession
  "data-testid"?: string
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const session = getEsewaSessionData(paymentSession)

  const handlePayment = () => {
    if (!session) {
      setErrorMessage("eSewa session is not ready yet. Please reselect eSewa.")
      return
    }

    setSubmitting(true)
    setErrorMessage(null)

    const form = document.createElement("form")
    form.method = "POST"
    form.action = session.form_action

    const fields = {
      amount: session.amount,
      tax_amount: session.tax_amount || "0",
      total_amount: session.total_amount,
      transaction_uuid: session.transaction_uuid,
      product_code: session.product_code,
      product_service_charge: session.product_service_charge || "0",
      product_delivery_charge: session.product_delivery_charge || "0",
      success_url: session.success_url,
      failure_url: session.failure_url,
      signed_field_names: session.signed_field_names,
      signature: session.signature,
    }

    for (const [name, value] of Object.entries(fields)) {
      const input = document.createElement("input")
      input.type = "hidden"
      input.name = name
      input.value = value
      form.appendChild(input)
    }

    document.body.appendChild(form)
    form.submit()
  }

  return (
    <>
      <Button
        disabled={notReady || !session}
        onClick={handlePayment}
        size="large"
        isLoading={submitting}
        data-testid="submit-order-button"
      >
        Pay with eSewa
      </Button>
      <ErrorMessage error={errorMessage} data-testid="esewa-payment-error" />
    </>
  )
}

export default PaymentButton
