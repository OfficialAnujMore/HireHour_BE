import { v2 as cloudinary } from 'cloudinary'
import { Readable } from 'stream'

// Configure Cloudinary
const configureCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })
}

// Configure on module load
configureCloudinary()

interface UploadResult {
  public_id: string
  secure_url: string
  url: string
  format: string
  width: number
  height: number
  bytes: number
}

/**
 * Upload a single image to Cloudinary
 * @param imageBuffer - Buffer containing the image data
 * @param folder - Optional folder name in Cloudinary
 * @returns Promise with upload result
 */
export const uploadImageToCloudinary = async (
  imageBuffer: Buffer,
  folder: string = 'hirehour-services'
): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [
          { width: 800, height: 600, crop: 'limit' },
          { quality: 'auto' },
          { fetch_format: 'auto' }
        ]
      },
      (error, result) => {
        if (error) {
          reject(error)
        } else if (result) {
          resolve(result as UploadResult)
        } else {
          reject(new Error('Upload failed'))
        }
      }
    )

    const readableStream = new Readable()
    readableStream.push(imageBuffer)
    readableStream.push(null)
    readableStream.pipe(uploadStream)
  })
}

/**
 * Upload multiple images to Cloudinary
 * @param imageBuffers - Array of image buffers
 * @param folder - Optional folder name in Cloudinary
 * @returns Promise with array of upload results
 */
export const uploadMultipleImagesToCloudinary = async (
  imageBuffers: Buffer[],
  folder: string = 'hirehour-services'
): Promise<UploadResult[]> => {
  const uploadPromises = imageBuffers.map(buffer => 
    uploadImageToCloudinary(buffer, folder)
  )
  
  return Promise.all(uploadPromises)
}

/**
 * Delete an image from Cloudinary
 * @param publicId - Public ID of the image to delete
 * @returns Promise with deletion result
 */
export const deleteImageFromCloudinary = async (
  publicId: string
): Promise<any> => {
  return cloudinary.uploader.destroy(publicId)
}

/**
 * Delete multiple images from Cloudinary
 * @param publicIds - Array of public IDs to delete
 * @returns Promise with array of deletion results
 */
export const deleteMultipleImagesFromCloudinary = async (
  publicIds: string[]
): Promise<any[]> => {
  const deletePromises = publicIds.map(publicId => 
    deleteImageFromCloudinary(publicId)
  )
  
  return Promise.all(deletePromises)
}

export default cloudinary 