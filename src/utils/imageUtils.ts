/**
 * Convert base64 string to Buffer
 * @param base64String - Base64 encoded image string
 * @returns Buffer containing image data
 */
export const base64ToBuffer = (base64String: string): Buffer => {
  // Remove data URL prefix if present
  const base64Data = base64String.replace(/^data:image\/[a-z]+;base64,/, '')
  return Buffer.from(base64Data, 'base64')
}

/**
 * Check if a string is a valid base64 image
 * @param str - String to check
 * @returns boolean indicating if it's a valid base64 image
 */
export const isValidBase64Image = (str: string): boolean => {
  // Check if it's a data URL
  if (str.startsWith('data:image/')) {
    return true
  }
  
  // Check if it's a valid base64 string
  try {
    return btoa(atob(str)) === str
  } catch (err) {
    return false
  }
}

/**
 * Check if a string is a local file URI
 * @param uri - URI to check
 * @returns boolean indicating if it's a local file URI
 */
export const isLocalFileUri = (uri: string): boolean => {
  return uri.startsWith('file://') || uri.startsWith('content://')
}

/**
 * Check if a string is a remote URL
 * @param uri - URI to check
 * @returns boolean indicating if it's a remote URL
 */
export const isRemoteUrl = (uri: string): boolean => {
  return uri.startsWith('http://') || uri.startsWith('https://')
}

/**
 * Extract file extension from URI or filename
 * @param uri - URI or filename
 * @returns file extension
 */
export const getFileExtension = (uri: string): string => {
  const match = uri.match(/\.([^.]+)$/)
  return match ? match[1].toLowerCase() : 'jpg'
}

/**
 * Generate a unique filename for upload
 * @param originalName - Original filename or URI
 * @param userId - User ID for uniqueness
 * @returns unique filename
 */
export const generateUniqueFilename = (originalName: string, userId: string): string => {
  const timestamp = Date.now()
  const extension = getFileExtension(originalName)
  return `user_${userId}_${timestamp}.${extension}`
} 