import crypto from "crypto"
import {
  AbstractPaymentProvider,
  MedusaError,
} from "@medusajs/framework/utils"
import {
  AuthorizePaymentInput,
  AuthorizePaymentOutput,
  CancelPaymentInput,
  CancelPaymentOutput,
  CapturePaymentInput,
  CapturePaymentOutput,
  DeleteAccountHolderInput,
  DeleteAccountHolderOutput,
  DeletePaymentInput,
  DeletePaymentOutput,
  GetPaymentStatusInput,
  GetPaymentStatusOutput,
  InitiatePaymentInput,
  InitiatePaymentOutput,
  ProviderWebhookPayload,
  RefundPaymentInput,
  RefundPaymentOutput,
  RetrieveAccountHolderInput,
  RetrieveAccountHolderOutput,
  RetrievePaymentInput,
  RetrievePaymentOutput,
  UpdatePaymentInput,
  UpdatePaymentOutput,
  WebhookActionResult,
} from "@medusajs/framework/types"
import {
  assertNprCurrency,
  amountsMatch,
  toRupees,
} from "../lib/amount"

type EsewaOptions = {
  productCode: string
  secretKey: string
  storefrontBaseUrl: string
  formUrl?: string
  statusUrl?: string
  successPath?: string
  failurePath?: string
  taxAmount?: string
  productServiceCharge?: string
  productDeliveryCharge?: string
}

type EsewaSessionData = {
  amount: string
  tax_amount: string
  total_amount: string
  transaction_uuid: string
  product_code: string
  product_service_charge: string
  product_delivery_charge: string
  success_url: string
  failure_url: string
  signed_field_names: string
  signature: string
  form_action: string
  status_check_url: string
  cart_id?: string
  country_code?: string
  gateway: "esewa"
}

type EsewaStatusResponse = {
  product_code?: string
  transaction_uuid?: string
  total_amount?: string | number
  status?: string
  ref_id?: string | null
}

const DEFAULT_FORM_URL = "https://rc-epay.esewa.com.np/api/epay/main/v2/form"
const DEFAULT_STATUS_URL =
  "https://rc.esewa.com.np/api/epay/transaction/status/"
const DEFAULT_SUCCESS_PATH = "/api/payment-return/esewa"
const DEFAULT_FAILURE_PATH = "/api/payment-return/esewa"
const SIGNED_FIELD_NAMES = "total_amount,transaction_uuid,product_code"
/** Placeholder so the return path keeps a fixed number of segments. */
const MISSING_SEGMENT = "-"

class EsewaPaymentProvider extends AbstractPaymentProvider<EsewaOptions> {
  static identifier = "esewa"

  static validateOptions(options: Record<string, unknown>) {
    for (const key of [
      "productCode",
      "secretKey",
      "storefrontBaseUrl",
    ] as const) {
      if (!options[key]) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Missing eSewa payment option: ${key}`
        )
      }
    }
  }

  private get formUrl() {
    return this.config.formUrl || DEFAULT_FORM_URL
  }

  private get statusUrl() {
    return this.config.statusUrl || DEFAULT_STATUS_URL
  }

  private normaliseAmount(value?: string) {
    const parsed = Number.parseFloat(value || "0")

    if (!Number.isFinite(parsed)) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Invalid eSewa amount "${value}"`
      )
    }

    return Number.isInteger(parsed) ? String(parsed) : parsed.toFixed(2)
  }

  private computeTotal(parts: string[]) {
    const total = parts.reduce((sum, part) => sum + Number.parseFloat(part), 0)

    return this.normaliseAmount(String(total))
  }

  private sign(totalAmount: string, transactionUuid: string, productCode: string) {
    const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`

    return crypto
      .createHmac("sha256", this.config.secretKey)
      .update(message)
      .digest("base64")
  }

  private buildTransactionUuid(reference?: string) {
    const seed = reference || crypto.randomUUID()

    return `${seed}-${Date.now()}`
      .replace(/[^a-zA-Z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48)
  }

  /**
   * The return URL must carry NO query string of its own.
   *
   * eSewa appends its Base64 response as `?data=...` literally, without
   * checking whether the URL already has a query string. A return URL built as
   * `...?cart_id=x&status=success` therefore comes back as
   * `...?cart_id=x&status=success?data=eyJ...`, where `data` is invisible to
   * URLSearchParams and `status` reads as "success?data=eyJ...". Every
   * successful payment then looks like a failure to the storefront.
   *
   * So the context goes in the path and the query string is left entirely to
   * eSewa. MISSING_SEGMENT keeps the path shape fixed when a value is absent,
   * so the storefront route always matches.
   */
  private buildReturnUrl(
    path: string,
    data: { cartId?: string; countryCode?: string; status: string }
  ) {
    const segments = [data.cartId, data.countryCode, data.status].map(
      (segment) => encodeURIComponent(segment || MISSING_SEGMENT)
    )

    return new URL(
      `${path.replace(/\/+$/, "")}/${segments.join("/")}`,
      this.config.storefrontBaseUrl
    ).toString()
  }

  private buildSessionData(input: {
    amount: string
    currencyCode: string
    cartId?: string
    countryCode?: string
    existingTransactionUuid?: string
  }): EsewaSessionData {
    assertNprCurrency(input.currencyCode, "eSewa")

    const amount = this.normaliseAmount(input.amount)
    const taxAmount = this.normaliseAmount(this.config.taxAmount)
    const productServiceCharge = this.normaliseAmount(
      this.config.productServiceCharge
    )
    const productDeliveryCharge = this.normaliseAmount(
      this.config.productDeliveryCharge
    )
    const totalAmount = this.computeTotal([
      amount,
      taxAmount,
      productServiceCharge,
      productDeliveryCharge,
    ])
    const transactionUuid =
      input.existingTransactionUuid ||
      this.buildTransactionUuid(input.cartId || input.countryCode)
    const countryCode = input.countryCode?.toLowerCase()

    return {
      gateway: "esewa",
      amount,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      transaction_uuid: transactionUuid,
      product_code: this.config.productCode,
      product_service_charge: productServiceCharge,
      product_delivery_charge: productDeliveryCharge,
      success_url: this.buildReturnUrl(
        this.config.successPath || DEFAULT_SUCCESS_PATH,
        {
          cartId: input.cartId,
          countryCode,
          status: "success",
        }
      ),
      failure_url: this.buildReturnUrl(
        this.config.failurePath || DEFAULT_FAILURE_PATH,
        {
          cartId: input.cartId,
          countryCode,
          status: "failure",
        }
      ),
      signed_field_names: SIGNED_FIELD_NAMES,
      signature: this.sign(
        totalAmount,
        transactionUuid,
        this.config.productCode
      ),
      form_action: this.formUrl,
      status_check_url: this.statusUrl,
      cart_id: input.cartId,
      country_code: countryCode,
    }
  }

  private asSessionData(data: Record<string, unknown> | undefined): EsewaSessionData {
    if (!data?.transaction_uuid || !data?.total_amount || !data?.product_code) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Missing eSewa payment session data"
      )
    }

    return data as EsewaSessionData
  }

  private async fetchStatus(data: EsewaSessionData) {
    const url = new URL(data.status_check_url || this.statusUrl)
    url.searchParams.set("product_code", data.product_code)
    url.searchParams.set("total_amount", data.total_amount)
    url.searchParams.set("transaction_uuid", data.transaction_uuid)

    const response = await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    })

    if (!response.ok) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `eSewa status check failed with ${response.status}`
      )
    }

    return (await response.json()) as EsewaStatusResponse
  }

  private mapStatus(status?: string): GetPaymentStatusOutput["status"] {
    switch (status?.toUpperCase()) {
      case "COMPLETE":
        return "captured"
      case "PENDING":
        return "pending_authorization"
      case "CANCELED":
      case "FAILED":
        return "error"
      default:
        return "pending"
    }
  }

  async getStatus(data: Record<string, unknown>): Promise<string> {
    return this.mapStatus((data.status as string | undefined) || undefined)
  }

  async getPaymentData(data: Record<string, unknown>) {
    return data
  }

  async initiatePayment(
    input: InitiatePaymentInput
  ): Promise<InitiatePaymentOutput> {
    const session = this.buildSessionData({
      amount: toRupees(input.amount),
      currencyCode: input.currency_code,
      cartId: input.data?.cart_id as string | undefined,
      countryCode: input.data?.country_code as string | undefined,
    })

    return {
      id: session.transaction_uuid,
      status: "pending",
      data: session,
    }
  }

  async getPaymentStatus(
    input: GetPaymentStatusInput
  ): Promise<GetPaymentStatusOutput> {
    const session = this.asSessionData(input.data)
    const status = await this.fetchStatus(session)

    return {
      status: this.mapStatus(status.status),
      data: {
        ...session,
        status: status.status,
        ref_id: status.ref_id,
      },
    }
  }

  async retrievePayment(
    input: RetrievePaymentInput
  ): Promise<RetrievePaymentOutput> {
    const session = this.asSessionData(input.data)
    const status = await this.fetchStatus(session)

    return {
      data: {
        ...session,
        status: status.status,
        ref_id: status.ref_id,
      },
    }
  }

  async authorizePayment(
    input: AuthorizePaymentInput
  ): Promise<AuthorizePaymentOutput> {
    const session = this.asSessionData(input.data)
    const status = await this.fetchStatus(session)
    const mapped = this.mapStatus(status.status)
    const remoteAmount = Number.parseFloat(String(status.total_amount ?? "0"))
    const localAmount = Number.parseFloat(session.total_amount)

    if (
      mapped === "captured" &&
      status.product_code === session.product_code &&
      status.transaction_uuid === session.transaction_uuid &&
      amountsMatch(localAmount, remoteAmount)
    ) {
      return {
        status: "captured",
        data: {
          ...session,
          status: status.status,
          ref_id: status.ref_id,
        },
      }
    }

    if (mapped === "pending_authorization") {
      return {
        status: "pending_authorization",
        data: {
          ...session,
          status: status.status,
          ref_id: status.ref_id,
        },
      }
    }

    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      "eSewa payment could not be verified"
    )
  }

  async updatePayment(input: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
    const previous = (input.data || {}) as Record<string, unknown>
    const session = this.buildSessionData({
      amount: toRupees(input.amount),
      currencyCode: input.currency_code,
      cartId: previous.cart_id as string | undefined,
      countryCode: previous.country_code as string | undefined,
      existingTransactionUuid: previous.transaction_uuid as string | undefined,
    })

    return {
      status: "pending",
      data: session,
    }
  }

  async deletePayment(_: DeletePaymentInput): Promise<DeletePaymentOutput> {
    return { data: {} }
  }

  async capturePayment(input: CapturePaymentInput): Promise<CapturePaymentOutput> {
    return { data: input.data }
  }

  async retrieveAccountHolder(
    input: RetrieveAccountHolderInput
  ): Promise<RetrieveAccountHolderOutput> {
    return { id: input.id }
  }

  async createAccountHolder(): Promise<{ id: string; data?: Record<string, unknown> }> {
    return { id: crypto.randomUUID() }
  }

  async deleteAccountHolder(
    _: DeleteAccountHolderInput
  ): Promise<DeleteAccountHolderOutput> {
    return { data: {} }
  }

  async refundPayment(_: RefundPaymentInput): Promise<RefundPaymentOutput> {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "eSewa refunds must be handled outside this custom provider"
    )
  }

  async cancelPayment(input: CancelPaymentInput): Promise<CancelPaymentOutput> {
    return { data: input.data }
  }

  async getWebhookActionAndData(
    _: ProviderWebhookPayload["payload"]
  ): Promise<WebhookActionResult> {
    return {
      action: "not_supported",
    }
  }
}

export { EsewaPaymentProvider }

export default {
  services: [EsewaPaymentProvider],
}
