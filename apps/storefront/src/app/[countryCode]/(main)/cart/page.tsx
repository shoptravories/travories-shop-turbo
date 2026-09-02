import { retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import CartTemplate from "@modules/cart/templates"
import { buildPrivateMetadata } from "@lib/seo"
import { Metadata } from "next"
import { notFound } from "next/navigation"

export const metadata: Metadata = buildPrivateMetadata({
  title: "Cart",
  description: "Review the souvenirs, gifts, and gear in your basket.",
})

export default async function Cart() {
  const cart = await retrieveCart().catch((error) => {
    console.error(error)
    return notFound()
  })

  const customer = await retrieveCustomer()

  return <CartTemplate cart={cart} customer={customer} />
}
