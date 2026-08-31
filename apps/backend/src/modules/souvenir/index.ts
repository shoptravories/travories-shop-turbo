import { Module } from "@medusajs/framework/utils"
import SouvenirModuleService from "./service"

// Module names must be camelCase - dashes break container resolution.
export const SOUVENIR_MODULE = "souvenir"

export default Module(SOUVENIR_MODULE, {
  service: SouvenirModuleService,
})
