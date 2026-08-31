import { MedusaService } from "@medusajs/framework/utils"
import { Artisan } from "./models/artisan"
import { Destination } from "./models/destination"

class SouvenirModuleService extends MedusaService({
  Destination,
  Artisan,
}) {}

export default SouvenirModuleService
