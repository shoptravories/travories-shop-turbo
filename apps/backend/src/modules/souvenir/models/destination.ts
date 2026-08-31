import { model } from "@medusajs/framework/utils"
import { Artisan } from "./artisan"

/**
 * A place in Nepal that souvenirs come from. Mirrors the destinations the
 * Travories parent marketplace sells treks to, so a trek booking and the
 * souvenirs from that region can be cross-referenced.
 *
 * This complements the Souvenirs category tree rather than replacing it:
 * categories drive browsing and filtering, a Destination carries the story.
 */
export const Destination = model.define("destination", {
  id: model.id().primaryKey(),
  name: model.text(),
  slug: model.text().unique(),
  // Category handle this destination corresponds to, so a destination page can
  // resolve its products without every product needing an explicit link.
  category_handle: model.text().nullable(),
  region: model.text().nullable(),
  tagline: model.text().nullable(),
  story: model.text().nullable(),
  hero_image: model.text().nullable(),
  latitude: model.float().nullable(),
  longitude: model.float().nullable(),
  // Deep link to the matching trek or tour on travories.com.
  travories_url: model.text().nullable(),
  rank: model.number().default(0),
  is_active: model.boolean().default(true),
  artisans: model.hasMany(() => Artisan, {
    mappedBy: "destination",
  }),
})

export default Destination
