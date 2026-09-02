import { BigNumberInput } from "@medusajs/framework/types"
import { MathBN, MedusaError } from "@medusajs/framework/utils"

/**
 * Amount conversion for the Nepali gateways.
 *
 * The repo rule "prices are stored as-is, never multiply by 100" is about
 * MEDUSA's storage: an NPR 4,500.00 price is the number 4500, not 450000. That
 * rule still holds everywhere else in this codebase.
 *
 * It does not describe the gateways' wire formats, which differ from each other:
 *   - eSewa  expects rupees  (4500)
 *   - Khalti expects paisa   (450000)
 *
 * So the x100 below is a unit conversion at the network boundary, not a
 * misunderstanding of how Medusa stores money. Removing it would undercharge
 * every Khalti customer by a factor of 100.
 */

export const NEPAL_CURRENCY = "npr"

function toNumber(amount: BigNumberInput): number {
  const value = MathBN.convert(amount).toNumber()

  if (!Number.isFinite(value)) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Cannot convert amount "${String(amount)}" to a number`
    )
  }

  return value
}

/** Rupees, as eSewa's form fields and signature both require. */
export function toRupees(amount: BigNumberInput): string {
  const value = toNumber(amount)

  // The signature is computed over the exact string submitted in the form, so
  // this must be the single source of both. Trailing ".00" is dropped because
  // eSewa echoes the value back unpadded and the comparison would fail.
  return Number.isInteger(value) ? String(value) : value.toFixed(2)
}

/** Paisa, as Khalti requires. Integer only - Khalti rejects decimals. */
export function toPaisa(amount: BigNumberInput): number {
  return Math.round(toNumber(amount) * 100)
}

/** Khalti reports back in paisa; bring it into Medusa's units for comparison. */
export function fromPaisa(paisa: number): number {
  return paisa / 100
}

/**
 * Both gateways settle in NPR only. Failing here is far better than letting a
 * USD cart through and charging the number as rupees.
 */
export function assertNprCurrency(currencyCode: string, provider: string): void {
  if (currencyCode?.toLowerCase() !== NEPAL_CURRENCY) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `${provider} settles in NPR only, but this payment is in ${currencyCode?.toUpperCase()}`
    )
  }
}

/**
 * Guards against a tampered redirect: the amount the gateway confirms must be
 * the amount Medusa asked for. Tolerance covers float representation only.
 */
export function amountsMatch(expected: number, actual: number): boolean {
  return Math.abs(expected - actual) < 0.01
}
