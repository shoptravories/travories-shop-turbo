import { randomUUID } from "crypto"
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { MedusaError } from "@medusajs/framework/utils"
import { mediaEnv, requiredMediaEnvKeys } from "./media-env"

const DEFAULT_UPLOAD_EXPIRES_IN = 15 * 60
const DEFAULT_DOWNLOAD_EXPIRES_IN = 15 * 60
const MAX_EXPIRES_IN = 60 * 60

export const PUBLIC_MEDIA_PREFIX = "public"
export const PRIVATE_MEDIA_PREFIX = "private"

export type MediaAccess = "public" | "private"

type GarageConfig = {
  bucket: string
  endpoint: string
  region: string
  accessKeyId: string
  secretAccessKey: string
  fileUrl?: string
}

type BuildUploadKeyInput = {
  filename: string
  folder?: string
  access?: MediaAccess
}

const cleanSegment = (value: string) =>
  value
    .trim()
    .replace(/\\/g, "/")
    .split("/")
    .map((segment) => segment.trim())
    .filter(Boolean)
    .map((segment) => segment.replace(/[^A-Za-z0-9._-]/g, "-"))
    .join("/")

const stripLeadingSlashes = (value: string) => value.replace(/^\/+/, "")

const cleanFilename = (filename: string) => {
  const cleaned = cleanSegment(filename)
  if (!cleaned) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "filename is required")
  }

  const parts = cleaned.split("/")
  return parts[parts.length - 1]
}

const getGarageConfig = (): GarageConfig => {
  const missing = requiredMediaEnvKeys.filter((key) => {
    if (key.includes("S3_BUCKET")) {
      return !mediaEnv.bucket
    }

    if (key.includes("S3_REGION")) {
      return !mediaEnv.region
    }

    if (key.includes("S3_ACCESS_KEY_ID")) {
      return !mediaEnv.accessKeyId
    }

    if (key.includes("S3_SECRET_ACCESS_KEY")) {
      return !mediaEnv.secretAccessKey
    }

    return !mediaEnv.endpoint
  })

  if (missing.length) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Garage media is not configured. Missing: ${missing.join(", ")}`
    )
  }

  return {
    endpoint: mediaEnv.endpoint!,
    bucket: mediaEnv.bucket!,
    region: mediaEnv.region!,
    accessKeyId: mediaEnv.accessKeyId!,
    secretAccessKey: mediaEnv.secretAccessKey!,
    fileUrl: mediaEnv.fileUrl,
  }
}

const getGarageClient = (config: GarageConfig) =>
  new S3Client({
    endpoint: config.endpoint,
    region: config.region,
    forcePathStyle: true,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  })

const getExpiry = (value: number | undefined, fallback: number) => {
  if (value == null) {
    return fallback
  }

  if (!Number.isInteger(value) || value < 1 || value > MAX_EXPIRES_IN) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `expires_in must be an integer between 1 and ${MAX_EXPIRES_IN}`
    )
  }

  return value
}

export const buildUploadKey = ({
  filename,
  folder,
  access = "public",
}: BuildUploadKeyInput) => {
  const prefix = access === "private" ? PRIVATE_MEDIA_PREFIX : PUBLIC_MEDIA_PREFIX
  const safeFolder = folder ? cleanSegment(folder) : ""
  const safeFilename = cleanFilename(filename)
  const datePrefix = new Date().toISOString().slice(0, 10)

  return [prefix, safeFolder, datePrefix, `${randomUUID()}-${safeFilename}`]
    .filter(Boolean)
    .join("/")
}

export const isPrivateMediaBucket = () => !mediaEnv.fileUrl

export const getPublicMediaUrl = (key: string) => {
  const config = getGarageConfig()

  if (config.fileUrl) {
    return `${config.fileUrl.replace(/\/+$/, "")}/${key}`
  }

  return `${config.endpoint.replace(/\/+$/, "")}/${config.bucket}/${key}`
}

export const extractMediaKeyFromUrl = (url: string) => {
  const config = getGarageConfig()

  try {
    const parsed = new URL(url)
    const endpoint = new URL(config.endpoint)
    const fileUrl = config.fileUrl ? new URL(config.fileUrl) : null
    const pathname = stripLeadingSlashes(parsed.pathname)

    if (
      fileUrl &&
      parsed.origin === fileUrl.origin &&
      pathname.startsWith(stripLeadingSlashes(fileUrl.pathname))
    ) {
      const basePath = stripLeadingSlashes(fileUrl.pathname)
      return stripLeadingSlashes(pathname.slice(basePath.length))
    }

    if (parsed.origin !== endpoint.origin) {
      return null
    }

    const endpointBase = stripLeadingSlashes(endpoint.pathname)
    const withoutBase = endpointBase && pathname.startsWith(endpointBase)
      ? stripLeadingSlashes(pathname.slice(endpointBase.length))
      : pathname

    if (!withoutBase.startsWith(`${config.bucket}/`)) {
      return null
    }

    return stripLeadingSlashes(withoutBase.slice(config.bucket.length + 1))
  } catch {
    return null
  }
}

export const assertMediaKey = (key: string) => {
  const cleaned = cleanSegment(key)

  if (!cleaned) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "key is required")
  }

  return cleaned
}

export const putMediaObject = async ({
  key,
  contentType,
  content,
}: {
  key: string
  contentType: string
  content: Buffer
}) => {
  const config = getGarageConfig()
  const client = getGarageClient(config)

  await client.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: content,
      ContentType: contentType,
    })
  )

  return {
    key,
    publicUrl: isPrivateMediaBucket() ? null : getPublicMediaUrl(key),
  }
}

export const createPresignedUpload = async ({
  key,
  contentType,
  expiresIn,
}: {
  key: string
  contentType: string
  expiresIn?: number
}) => {
  const config = getGarageConfig()
  const client = getGarageClient(config)
  const ttl = getExpiry(expiresIn, DEFAULT_UPLOAD_EXPIRES_IN)

  const command = new PutObjectCommand({
    Bucket: config.bucket,
    Key: key,
    ContentType: contentType,
  })

  const url = await getSignedUrl(client, command, { expiresIn: ttl })

  return {
    url,
    expiresIn: ttl,
    expiresAt: new Date(Date.now() + ttl * 1000).toISOString(),
    method: "PUT" as const,
    headers: {
      "content-type": contentType,
    },
  }
}

export const createPresignedDownload = async ({
  key,
  expiresIn,
  downloadFilename,
}: {
  key: string
  expiresIn?: number
  downloadFilename?: string
}) => {
  const config = getGarageConfig()
  const client = getGarageClient(config)
  const ttl = getExpiry(expiresIn, DEFAULT_DOWNLOAD_EXPIRES_IN)

  const command = new GetObjectCommand({
    Bucket: config.bucket,
    Key: key,
    ResponseContentDisposition: downloadFilename
      ? `attachment; filename="${cleanFilename(downloadFilename)}"`
      : undefined,
  })

  const url = await getSignedUrl(client, command, { expiresIn: ttl })

  return {
    url,
    expiresIn: ttl,
    expiresAt: new Date(Date.now() + ttl * 1000).toISOString(),
  }
}
