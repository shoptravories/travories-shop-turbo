import { Container, clx } from "@modules/common/components/ui"
import Image from "next/image"
import React from "react"

import CraftMotif from "@modules/common/components/craft-motif"
import PlaceholderImage from "@modules/common/icons/placeholder-image"

type ThumbnailProps = {
  thumbnail?: string | null
  images?: { url?: string }[] | null
  size?: "small" | "medium" | "large" | "full" | "square"
  className?: string
  /**
   * Drops the card chrome - border radius, background and shadow - so the
   * image sits flush inside a card that already draws its own frame.
   */
  flat?: boolean
  /**
   * Stable identifier - usually the product handle. When supplied and no photo
   * exists, generated craft artwork stands in for the missing image instead of
   * a grey placeholder box.
   */
  seed?: string
  "data-testid"?: string
}

const Thumbnail: React.FC<ThumbnailProps> = ({
  thumbnail,
  images,
  size = "small",
  className,
  flat,
  seed,
  "data-testid": dataTestid,
}) => {
  const initialImage = thumbnail || images?.[0]?.url

  return (
    <Container
      className={clx(
        "relative w-full overflow-hidden bg-ui-bg-subtle",
        flat
          ? "p-0"
          : "p-4 shadow-elevation-card-rest rounded-large group-hover:shadow-elevation-card-hover transition-shadow ease-in-out duration-150",
        className,
        {
          "aspect-[11/14]": size !== "square",
          "aspect-[1/1]": size === "square",
          "w-[180px]": size === "small",
          "w-[290px]": size === "medium",
          "w-[440px]": size === "large",
          "w-full": size === "full",
        }
      )}
      data-testid={dataTestid}
    >
      <ImageOrPlaceholder image={initialImage} size={size} seed={seed} />
    </Container>
  )
}

const ImageOrPlaceholder = ({
  image,
  size,
  seed,
}: Pick<ThumbnailProps, "size" | "seed"> & { image?: string }) => {
  if (image) {
    return (
      <Image
        src={image}
        alt="Thumbnail"
        className="absolute inset-0 object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        draggable={false}
        quality={50}
        sizes="(max-width: 576px) 280px, (max-width: 768px) 360px, (max-width: 992px) 480px, 800px"
        fill
      />
    )
  }

  if (seed) {
    return (
      <CraftMotif
        seed={seed}
        className="transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
      />
    )
  }

  return (
    <div className="w-full h-full absolute inset-0 flex items-center justify-center">
      <PlaceholderImage size={size === "small" ? 16 : 24} />
    </div>
  )
}

export default Thumbnail
