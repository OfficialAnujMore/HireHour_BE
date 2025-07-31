"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMultipleImagesFromCloudinary = exports.deleteImageFromCloudinary = exports.uploadMultipleImagesToCloudinary = exports.uploadImageToCloudinary = void 0;
const cloudinary_1 = require("cloudinary");
const stream_1 = require("stream");
// Configure Cloudinary
const configureCloudinary = () => {
    cloudinary_1.v2.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
};
// Configure on module load
configureCloudinary();
/**
 * Upload a single image to Cloudinary
 * @param imageBuffer - Buffer containing the image data
 * @param folder - Optional folder name in Cloudinary
 * @returns Promise with upload result
 */
const uploadImageToCloudinary = async (imageBuffer, folder = 'hirehour-services') => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary_1.v2.uploader.upload_stream({
            folder,
            resource_type: 'image',
            transformation: [
                { width: 800, height: 600, crop: 'limit' },
                { quality: 'auto' },
                { fetch_format: 'auto' }
            ]
        }, (error, result) => {
            if (error) {
                reject(error);
            }
            else if (result) {
                resolve(result);
            }
            else {
                reject(new Error('Upload failed'));
            }
        });
        const readableStream = new stream_1.Readable();
        readableStream.push(imageBuffer);
        readableStream.push(null);
        readableStream.pipe(uploadStream);
    });
};
exports.uploadImageToCloudinary = uploadImageToCloudinary;
/**
 * Upload multiple images to Cloudinary
 * @param imageBuffers - Array of image buffers
 * @param folder - Optional folder name in Cloudinary
 * @returns Promise with array of upload results
 */
const uploadMultipleImagesToCloudinary = async (imageBuffers, folder = 'hirehour-services') => {
    const uploadPromises = imageBuffers.map(buffer => (0, exports.uploadImageToCloudinary)(buffer, folder));
    return Promise.all(uploadPromises);
};
exports.uploadMultipleImagesToCloudinary = uploadMultipleImagesToCloudinary;
/**
 * Delete an image from Cloudinary
 * @param publicId - Public ID of the image to delete
 * @returns Promise with deletion result
 */
const deleteImageFromCloudinary = async (publicId) => {
    return cloudinary_1.v2.uploader.destroy(publicId);
};
exports.deleteImageFromCloudinary = deleteImageFromCloudinary;
/**
 * Delete multiple images from Cloudinary
 * @param publicIds - Array of public IDs to delete
 * @returns Promise with array of deletion results
 */
const deleteMultipleImagesFromCloudinary = async (publicIds) => {
    const deletePromises = publicIds.map(publicId => (0, exports.deleteImageFromCloudinary)(publicId));
    return Promise.all(deletePromises);
};
exports.deleteMultipleImagesFromCloudinary = deleteMultipleImagesFromCloudinary;
exports.default = cloudinary_1.v2;
