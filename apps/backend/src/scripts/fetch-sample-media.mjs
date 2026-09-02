import fs from "fs/promises"
import path from "path"

/**
 * Downloads a curated set of Wikimedia Commons images into apps/backend/media
 * so `npx medusa exec ./src/scripts/upload-media.ts` has something to attach.
 *
 * Files are fetched through Special:FilePath's `width` parameter rather than as
 * originals - the originals run 4-7MB each, which is both slow to seed and far
 * too heavy to serve from a product grid. Commons renders the thumbnail in the
 * source format, so the extension below always matches the real content type;
 * upload-media.ts derives its MIME from that extension.
 *
 *   node src/scripts/fetch-sample-media.mjs
 *
 * Existing files are kept, so an interrupted run resumes where it stopped.
 */

const MEDIA_ROOT = path.resolve(process.cwd(), "media")
const DEFAULT_WIDTH = 1600

const commons = (file, width = DEFAULT_WIDTH) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${file}?width=${width}`

const files = [
  {
    target: "products/pashmina-shawl/01.jpg",
    url: commons("Handwoven-kashmir-pashmina.jpg"),
  },
  {
    target: "products/tibetan-singing-bowl/01.jpg",
    url: commons("Tibetan%20singing%20bowl.jpg"),
  },
  {
    target: "products/thangka-painting/01.jpg",
    url: commons(
      "Contemporary%20Thangka%20Painting%2C%20c%201980%2C%20Nepal%2C%20V%26A%20Museum%2C%20London.jpg"
    ),
  },
  {
    target: "products/khukuri-knife/01.jpg",
    url: commons("Khukuri%20from%20Nepal.jpg"),
  },
  {
    target: "products/lokta-paper-journal/01.webp",
    url: commons("Sample%20of%20ancestors%20Lokta%20Paper%20written%20papers.webp"),
  },
  {
    // PNG thumbnails stay PNG, so this one is narrowed further to keep it light.
    target: "products/himalayan-prayer-flags/01.png",
    url: commons("Prayer%20flags.png", 1200),
  },
  {
    target: "products/ilam-tea-sampler/01.jpg",
    url: commons("Ilam%20tea%20garden.jpg"),
  },
  {
    target: "products/bhaktapur-window-carving/01.jpg",
    url: commons("Fen%C3%AAtre%20newar%20%28Bhaktapur%29%20%288554520945%29.jpg"),
  },
  {
    target: "products/felted-wool-slippers/01.jpg",
    url: commons("Felted%20slippers.jpg"),
  },
  {
    target: "products/rudraksha-mala/01.jpg",
    url: commons("Rudraksha%20mala.jpg"),
  },
  {
    target: "products/dhaka-topi/01.jpg",
    url: commons("Dhaka%20Topi%20on%20Display%20at%20Patan%20Durbar%20Square.jpg"),
  },
  {
    target: "products/carved-elephant-figurine/01.jpg",
    url: commons("Wooden%20elephant%20sculptures.jpg"),
  },
  {
    target: "destinations/kathmandu-valley.jpg",
    url: commons("Boudhanath%2C%20main%20stupa.jpg"),
  },
  {
    target: "destinations/pokhara.jpg",
    url: commons("Pokhara%20and%20Phewa%20Lake.jpg"),
  },
  {
    target: "destinations/everest-region.jpg",
    url: commons("Everest%20kalapatthar%20crop.jpg"),
  },
  {
    target: "destinations/chitwan.jpg",
    url: commons("Greater%20one-horned%20rhinoceros%20at%20Chitwan.jpg"),
  },
  {
    target: "destinations/lumbini.jpg",
    url: commons("Lumbini%2C%20nepal.jpg"),
  },
  {
    target: "destinations/ilam.jpg",
    url: commons("Kanyam%20Tea%20Garden.jpg"),
  },
]

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const download = async ({ target, url }) => {
  const destination = path.join(MEDIA_ROOT, target)

  await fs.mkdir(path.dirname(destination), { recursive: true })

  try {
    await fs.access(destination)
    return { destination, skipped: true }
  } catch {}

  let response

  for (let attempt = 1; attempt <= 4; attempt++) {
    response = await fetch(url, {
      redirect: "follow",
      headers: {
        "user-agent": "medusashop-media-seeder/1.0",
      },
    })

    if (response.ok) {
      break
    }

    // Commons rate-limits bulk downloads; back off rather than fail the run.
    if (response.status !== 429 || attempt === 4) {
      throw new Error(`Failed ${response.status} for ${url}`)
    }

    await sleep(attempt * 2500)
  }

  const buffer = Buffer.from(await response.arrayBuffer())
  await fs.writeFile(destination, buffer)

  await sleep(1200)

  return { destination, skipped: false, bytes: buffer.byteLength }
}

const main = async () => {
  console.log(`Downloading ${files.length} media file(s) into ${MEDIA_ROOT}`)

  for (const file of files) {
    const result = await download(file)
    const size = result.bytes ? ` (${(result.bytes / 1024).toFixed(0)}KB)` : ""
    console.log(`${result.skipped ? "kept" : "saved"} ${result.target ?? file.target}${size}`)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
