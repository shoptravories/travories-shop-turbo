import { MedusaService } from "@medusajs/framework/utils"
import { Artisan } from "./models/artisan"
import { Destination } from "./models/destination"
import { ProductMedia } from "./models/product-media"

class SouvenirModuleService extends MedusaService({
  Destination,
  Artisan,
  ProductMedia,
}) {}

export default SouvenirModuleService
