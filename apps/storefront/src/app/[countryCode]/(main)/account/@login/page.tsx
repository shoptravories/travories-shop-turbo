import { buildPrivateMetadata } from "@lib/seo"
import { Metadata } from "next"

import LoginTemplate from "@modules/account/templates/login-template"

export const metadata: Metadata = buildPrivateMetadata({
  title: "Sign in",
  description: "Sign in to your Nepal Souvenirs account.",
})

export default function Login() {
  return <LoginTemplate />
}
