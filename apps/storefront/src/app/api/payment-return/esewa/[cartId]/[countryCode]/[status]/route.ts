import { placeOrder } from "@lib/data/cart"
import { setCartId } from "@lib/data/cookies"
import { unstable_rethrow } from "next/navigation"
import { NextRequest, NextResponse } from "next/server"

/**
 * Where the customer lands after eSewa's hosted checkout.
 *
 * The cart context is in the PATH, not the query string, because eSewa appends
 * its own `?data=<base64>` to whatever return URL it was given without checking
 * for an existing query string - see buildReturnUrl() in the backend provider.
 * Leaving the query string entirely to eSewa is what keeps this parseable.
 */

/** Matches MISSING_SEGMENT in the backend provider. */
const MISSING_SEGMENT = "-"

const segment = (value: string) =>
  value === MISSING_SEGMENT ? "" : decodeURIComponent(value)

export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ cartId: string; countryCode: string; status: string }>
  }
) {
  const { origin } = req.nextUrl
  const raw = await params

  const cartId = segment(raw.cartId)
  const countryCode = segment(raw.countryCode)
  const prefix = countryCode ? `/${countryCode}` : ""

  if (!cartId) {
    return NextResponse.redirect(`${origin}${prefix}/cart?error=payment_failed`)
  }

  await setCartId(cartId)

  // The customer cancelled or eSewa declined. Back to the payment step so they
  // can retry - a new session is created when they reselect eSewa.
  if (raw.status === "failure") {
    return NextResponse.redirect(
      `${origin}${prefix}/checkout?step=payment&error=payment_failed`
    )
  }

  // Deliberately NOT gated on eSewa's `?data=` payload. That blob arrives via
  // the customer's browser, so it proves nothing, and its presence depends on
  // eSewa's URL handling. Cart completion runs the provider's authorizePayment,
  // which calls eSewa's status API server-side and checks the product code,
  // transaction id and amount. That is the real verification.
  try {
    await placeOrder(cartId)
  } catch (error) {
    unstable_rethrow(error)

    return NextResponse.redirect(
      `${origin}${prefix}/checkout?step=review&error=payment_unverified`
    )
  }

  // Only reached when the cart did not convert into an order - placeOrder
  // redirects to the confirmation page on success.
  return NextResponse.redirect(`${origin}${prefix}/cart?error=order_failed`)
}
