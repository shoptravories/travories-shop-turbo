import fs from "fs"
import path from "path"
import { MedusaContainer } from "@medusajs/framework"
import {
  ContainerRegistrationKeys,
  MedusaError,
  Modules,
} from "@medusajs/framework/utils"
import {
  updateProductsWorkflow,
  uploadFilesWorkflow,
} from "@medusajs/medusa/core-flows"
import { buildUploadKey, isPrivateMediaBucket, putMediaObject } from "../lib/garage"
import { SOUVENIR_MODULE } from "../modules/souvenir"

/**
 * Uploads local media and attaches the results to products, destinations and
 * artisans.
 *
 * Products, destinations and artisans all upload through the same helper, but
 * the persistence differs:
 *   - products prefer the custom product_media model for private buckets
 *   - destinations/artisans store key fields on the souvenir module tables
 *   - public/local setups can still fall back to Medusa's URL-based fields
 *
 *   npx medusa exec ./src/scripts/upload-media.ts            # upload + attach
 *   npx medusa exec ./src/scripts/upload-media.ts -- --dry   # report only
 *   npx medusa exec ./src/scripts/upload-media.ts -- --force # re-upload existing
 *
 * Directory layout, relative to apps/backend/media:
 *
 *   media/
 *   ├── products/<product-handle>/01.jpg   first file becomes the thumbnail
 *   │                            /02.jpg
 *   ├── destinations/<slug>.jpg            becomes destination.hero_image_key
 *   └── artisans/<slug>.jpg                becomes artisan.photo_key
 *
 * Filenames sort ASCII-ascending, so zero-pad if order matters.
 */

const MEDIA_ROOT = path.resolve(process.cwd(), "media")

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
}

// Garage, S3 and most CDNs are fine well beyond this; the ceiling here is
// Node holding the whole file as base64 in memory during upload.
const MAX_BYTES = 10 * 1024 * 1024

type Uploaded = { url: string; id: string; key?: string | null }

const mimeFor = (file: string) => {
  const mime = MIME[path.extname(file).toLowerCase()]
  if (!mime) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Unsupported media type: ${file}. Supported: ${Object.keys(MIME).join(", ")}`
    )
  }
  return mime
}

const listFiles = (dir: string) =>
  fs.existsSync(dir)
    ? fs
        .readdirSync(dir, { withFileTypes: true })
        .filter((e) => e.isFile() && !e.name.startsWith("."))
        .map((e) => e.name)
        .sort()
    : []

const listDirs = (dir: string) =>
  fs.existsSync(dir)
    ? fs
        .readdirSync(dir, { withFileTypes: true })
        .filter((e) => e.isDirectory() && !e.name.startsWith("."))
        .map((e) => e.name)
        .sort()
    : []

export default async function uploadMedia({
  container,
  args = [],
}: {
  container: MedusaContainer
  args?: string[]
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const souvenir: any = container.resolve(SOUVENIR_MODULE)

  // `medusa exec` declares its CLI as `exec [file] [args..]`, so yargs claims
  // anything dash-prefixed as its own option and `args` arrives empty - which
  // silently turned --dry into a real upload. Fall back to the raw process
  // argv so both flags work however the CLI decides to forward them.
  const flags = new Set([...args, ...process.argv.slice(2)])
  const dryRun = flags.has("--dry")
  const force = flags.has("--force")

  const provider = process.env.S3_ENDPOINT
    ? `S3-compatible (${process.env.S3_ENDPOINT})`
    : "local file provider (no S3_* variables set)"

  logger.info(`Media root : ${MEDIA_ROOT}`)
  logger.info(`Provider   : ${provider}`)
  if (dryRun) {
    logger.info("DRY RUN - nothing will be uploaded or written")
  }

  if (!fs.existsSync(MEDIA_ROOT)) {
    logger.warn(
      `No media directory at ${MEDIA_ROOT}. Create it and add files - see the ` +
        "layout in this script's header."
    )
    return
  }

  /** Uploads one file and returns its resulting URL and optional object key. */
  const upload = async (absolute: string): Promise<Uploaded | null> => {
    const stat = fs.statSync(absolute)
    if (stat.size > MAX_BYTES) {
      logger.warn(
        `  skipped ${path.basename(absolute)} - ${(stat.size / 1024 / 1024).toFixed(1)}MB exceeds the ${MAX_BYTES / 1024 / 1024}MB limit`
      )
      return null
    }

    if (dryRun) {
      return {
        url: `<dry-run>/${path.basename(absolute)}`,
        id: "dry",
        key: `dry/${path.basename(absolute)}`,
      }
    }

    if (process.env.S3_ENDPOINT && isPrivateMediaBucket()) {
      const key = buildUploadKey({
        filename: path.basename(absolute),
        folder: path.dirname(path.relative(MEDIA_ROOT, absolute)),
        access: "private",
      })

      const uploaded = await putMediaObject({
        key,
        contentType: mimeFor(absolute),
        content: fs.readFileSync(absolute),
      })

      return {
        url: uploaded.publicUrl ?? key,
        id: key,
        key,
      }
    }

    const { result } = await uploadFilesWorkflow(container).run({
      input: {
        files: [
          {
            filename: path.basename(absolute),
            mimeType: mimeFor(absolute),
            content: fs.readFileSync(absolute).toString("base64"),
            access: "public",
          },
        ],
      },
    })

    const file = (result as unknown as Uploaded[])[0]
    if (!file?.url) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Upload returned no URL for ${absolute}`
      )
    }
    return file
  }

  let uploaded = 0
  let skipped = 0

  // ── products ──────────────────────────────────────────────────────────────
  const productDirs = listDirs(path.join(MEDIA_ROOT, "products"))

  if (productDirs.length) {
    const [{ data: products }, { data: productMediaRows }] = await Promise.all([
      query.graph({
        entity: "product",
        fields: ["id", "handle", "thumbnail", "images.id", "images.url"],
        filters: { handle: productDirs },
      }),
      query.graph({
        entity: "product_media",
        fields: ["id", "products.id"],
      }),
    ])

    const byHandle = new Map(
      (products as unknown as {
        id: string
        handle: string
        thumbnail?: string | null
        images?: { url: string }[]
      }[]).map((p) => [p.handle, p])
    )
    const mediaByProductId = new Map<string, string[]>() 

    for (const row of productMediaRows as Array<{ id: string; products?: { id: string }[] }>) {
      for (const product of row.products ?? []) {
        const ids = mediaByProductId.get(product.id) ?? []
        ids.push(row.id)
        mediaByProductId.set(product.id, ids)
      }
    }

    for (const handle of productDirs) {
      const product = byHandle.get(handle)
      if (!product) {
        logger.warn(`  products/${handle}: no product with that handle, skipped`)
        continue
      }

      const existingProductMediaIds = mediaByProductId.get(product.id) ?? []

      if ((existingProductMediaIds.length || product.images?.length) && !force) {
        logger.info(
          `  products/${handle}: already has images, skipped (--force to replace)`
        )
        skipped++
        continue
      }

      const files = listFiles(path.join(MEDIA_ROOT, "products", handle))
      if (!files.length) {
        continue
      }

      const uploads: Uploaded[] = []
      for (const file of files) {
        const result = await upload(path.join(MEDIA_ROOT, "products", handle, file))
        if (result) {
          uploads.push(result)
          uploaded++
        }
      }

      if (!uploads.length || dryRun) {
        logger.info(`  products/${handle}: ${files.length} file(s)`)
        continue
      }

      if (process.env.S3_ENDPOINT && isPrivateMediaBucket()) {
        if (existingProductMediaIds.length) {
          await souvenir.deleteProductMedias(existingProductMediaIds)
        }

        for (const [index, media] of uploads.entries()) {
          const record = await souvenir.createProductMedias({
            key: media.key ?? null,
            url: media.key ? null : media.url,
            rank: index,
            is_thumbnail: index === 0,
          })

          await link.create({
            [Modules.PRODUCT]: { product_id: product.id },
            [SOUVENIR_MODULE]: { product_media_id: record.id },
          })
        }

        logger.info(`  products/${handle}: ${uploads.length} private image(s) attached`)
        continue
      }

      const urls = uploads.map((media) => media.url)

      await updateProductsWorkflow(container).run({
        input: {
          products: [
            {
              id: product.id,
              // First file is the thumbnail - it is what every product grid shows.
              thumbnail: urls[0],
              images: urls.map((url) => ({ url })),
            },
          ],
        },
      })
      logger.info(`  products/${handle}: ${urls.length} image(s) attached`)
    }
  }

  // ── destinations ──────────────────────────────────────────────────────────
  const destFiles = listFiles(path.join(MEDIA_ROOT, "destinations"))

  if (destFiles.length) {
    const destinations = await souvenir.listDestinations({})
    const bySlug = new Map(
      destinations.map((d: { slug: string; id: string; hero_image?: string | null }) => [
        d.slug,
        d,
      ])
    )

    for (const file of destFiles) {
      const slug = path.basename(file, path.extname(file))
      const destination: any = bySlug.get(slug)

      if (!destination) {
        logger.warn(`  destinations/${file}: no destination "${slug}", skipped`)
        continue
      }
      if ((destination.hero_image_key || destination.hero_image) && !force) {
        logger.info(`  destinations/${slug}: already set, skipped`)
        skipped++
        continue
      }

      const result = await upload(path.join(MEDIA_ROOT, "destinations", file))
      if (!result) {
        continue
      }
      uploaded++

      if (!dryRun) {
        await souvenir.updateDestinations({
          id: destination.id,
          ...(result.key ? { hero_image_key: result.key } : { hero_image: result.url }),
        })
      }
      logger.info(`  destinations/${slug}: hero image set`)
    }
  }

  // ── artisans ──────────────────────────────────────────────────────────────
  const artisanFiles = listFiles(path.join(MEDIA_ROOT, "artisans"))

  if (artisanFiles.length) {
    const artisans = await souvenir.listArtisans({})
    const bySlug = new Map(
      artisans.map(
        (a: { slug: string; id: string; photo?: string | null; photo_key?: string | null }) => [
          a.slug,
          a,
        ]
      )
    )

    for (const file of artisanFiles) {
      const slug = path.basename(file, path.extname(file))
      const artisan: any = bySlug.get(slug)

      if (!artisan) {
        logger.warn(`  artisans/${file}: no artisan "${slug}", skipped`)
        continue
      }
      if ((artisan.photo_key || artisan.photo) && !force) {
        logger.info(`  artisans/${slug}: already set, skipped`)
        skipped++
        continue
      }

      const result = await upload(path.join(MEDIA_ROOT, "artisans", file))
      if (!result) {
        continue
      }
      uploaded++

      if (!dryRun) {
        await souvenir.updateArtisans({
          id: artisan.id,
          ...(result.key ? { photo_key: result.key } : { photo: result.url }),
        })
      }
      logger.info(`  artisans/${slug}: photo set`)
    }
  }

  logger.info(
    `Finished. ${uploaded} file(s) uploaded, ${skipped} target(s) skipped as already set.`
  )

  if (!process.env.S3_ENDPOINT && uploaded > 0) {
    logger.warn(
      "These went to the LOCAL provider. Re-run after setting S3_* to move them to Garage."
    )
  }
}
