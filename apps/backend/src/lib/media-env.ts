const readFirst = (...keys: string[]) => {
  for (const key of keys) {
    const value = process.env[key]
    if (value) {
      return value
    }
  }

  return undefined
}

export const mediaEnv = {
  fileUrl: readFirst("S3_FILE_URL"),
  endpoint: readFirst("S3_ENDPOINT"),
  bucket: readFirst("S3_BUCKET", "S3_BUCKET_NAME_PUBLIC"),
  region: readFirst("S3_REGION", "AWS_REGION", "AWS_DEFAULT_REGION"),
  accessKeyId: readFirst("S3_ACCESS_KEY_ID", "S3_ACCESS_KEY", "AWS_ACCESS_KEY_ID"),
  secretAccessKey: readFirst(
    "S3_SECRET_ACCESS_KEY",
    "S3_SECRET_KEY",
    "AWS_SECRET_ACCESS_KEY"
  ),
}

export const requiredMediaEnvKeys = [
  "S3_ENDPOINT",
  "S3_BUCKET or S3_BUCKET_NAME_PUBLIC",
  "S3_REGION or AWS_REGION",
  "S3_ACCESS_KEY_ID or S3_ACCESS_KEY",
  "S3_SECRET_ACCESS_KEY or S3_SECRET_KEY",
]
