import { mediaEnv } from "./media-env"

const encodeKey = (key: string) => encodeURIComponent(key)

export const getStoreMediaPath = (key: string) => `/media?key=${encodeKey(key)}`

export const getStoreMediaUrl = (key: string) => {
  const baseUrl = process.env.MEDUSA_BACKEND_URL || (process.env.NODE_ENV === "production" ? "" : "http://localhost:9000")
  
  if (baseUrl) {
    return `${baseUrl.replace(/\/+$/, "")}${getStoreMediaPath(key)}`
  }

  if (mediaEnv.fileUrl) {
    return `${mediaEnv.fileUrl.replace(/\/+$/, "")}/${key}`
  }

  return getStoreMediaPath(key)
}
