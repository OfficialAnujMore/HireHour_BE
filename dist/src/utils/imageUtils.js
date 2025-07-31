"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUniqueFilename = exports.getFileExtension = exports.isRemoteUrl = exports.isLocalFileUri = exports.isValidBase64Image = exports.base64ToBuffer = void 0;
/**
 * Convert base64 string to Buffer
 * @param base64String - Base64 encoded image string
 * @returns Buffer containing image data
 */
const base64ToBuffer = (base64String) => {
    // Remove data URL prefix if present
    const base64Data = base64String.replace(/^data:image\/[a-z]+;base64,/, '');
    return Buffer.from(base64Data, 'base64');
};
exports.base64ToBuffer = base64ToBuffer;
/**
 * Check if a string is a valid base64 image
 * @param str - String to check
 * @returns boolean indicating if it's a valid base64 image
 */
const isValidBase64Image = (str) => {
    // Check if it's a data URL
    if (str.startsWith('data:image/')) {
        return true;
    }
    // Check if it's a valid base64 string
    try {
        return btoa(atob(str)) === str;
    }
    catch (err) {
        return false;
    }
};
exports.isValidBase64Image = isValidBase64Image;
/**
 * Check if a string is a local file URI
 * @param uri - URI to check
 * @returns boolean indicating if it's a local file URI
 */
const isLocalFileUri = (uri) => {
    return uri.startsWith('file://') || uri.startsWith('content://');
};
exports.isLocalFileUri = isLocalFileUri;
/**
 * Check if a string is a remote URL
 * @param uri - URI to check
 * @returns boolean indicating if it's a remote URL
 */
const isRemoteUrl = (uri) => {
    return uri.startsWith('http://') || uri.startsWith('https://');
};
exports.isRemoteUrl = isRemoteUrl;
/**
 * Extract file extension from URI or filename
 * @param uri - URI or filename
 * @returns file extension
 */
const getFileExtension = (uri) => {
    const match = uri.match(/\.([^.]+)$/);
    return match ? match[1].toLowerCase() : 'jpg';
};
exports.getFileExtension = getFileExtension;
/**
 * Generate a unique filename for upload
 * @param originalName - Original filename or URI
 * @param userId - User ID for uniqueness
 * @returns unique filename
 */
const generateUniqueFilename = (originalName, userId) => {
    const timestamp = Date.now();
    const extension = (0, exports.getFileExtension)(originalName);
    return `user_${userId}_${timestamp}.${extension}`;
};
exports.generateUniqueFilename = generateUniqueFilename;
