import { StorageProvider } from './base'
import { AWSS3Provider } from './providers/aws-s3'
import { LocalStorageProvider } from './providers/local'
import { STORAGE_CONFIG, UPLOAD_PATHS } from './config'
import { buildS3Key, generateUniqueFilename, type ValidCategory } from './path-utils'

let storageProvider: StorageProvider | null = null

export function getStorageProvider(): StorageProvider {
  if (!storageProvider) {
    switch (STORAGE_CONFIG.provider) {
      case 'aws':
        storageProvider = new AWSS3Provider()
        break
      case 'local':
        storageProvider = new LocalStorageProvider()
        break
      default:
        // Fallback to local provider for development
        storageProvider = new LocalStorageProvider()
    }
  }
  return storageProvider
}
import { UploadResult } from './base'
import sharp from 'sharp'

interface DownloadResult {
  success: boolean
  error?: string
  permanentUrls?: string[]
  thumbnailUrls?: string[]
}

/**
 * Download images from temporary URLs and store them permanently using standardized structure
 * @param temporaryUrls Array of temporary image URLs from AI provider
 * @param generationId Unique generation ID
 * @param userId User ID who owns the images
 * @param context Storage context - deprecated, now uses standardized structure
 */
export async function downloadAndStoreImages(
  temporaryUrls: string[],
  generationId: string,
  userId: string,
  context: string = 'generated' // Deprecated parameter, maintained for backward compatibility
): Promise<DownloadResult> {
  try {
    const storage = getStorageProvider()
    const permanentUrls: string[] = []
    const thumbnailUrls: string[] = []

    console.log(`📥 Starting download of ${temporaryUrls.length} images for generation ${generationId}`)

    for (let i = 0; i < temporaryUrls.length; i++) {
      const tempUrl = temporaryUrls[i]

      try {
        // Download the image with timeout
        console.log(`⬇️ Downloading image ${i + 1}/${temporaryUrls.length} from ${tempUrl}`)
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

        const response = await fetch(tempUrl, {
          headers: {
            'User-Agent': 'VibePhoto/1.0',
          },
          signal: controller.signal
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error(`Failed to download image: ${response.status} ${response.statusText}`)
        }

        const imageBuffer = Buffer.from(await response.arrayBuffer())
        const contentType = response.headers.get('content-type') || 'image/png'

        // Use structure: generated/{userId}/{generationId}/filename.ext
        const fileExtension = detectFileExtension(contentType)

        // Generate simple filenames for the generation folder
        const imageFilename = `image_${i}.${fileExtension}`
        const thumbnailFilename = `thumb_${i}.${fileExtension}`

        // Build S3 keys with proper folder structure based on context
        let imageKey: string, thumbnailKey: string
        if (context === 'edited') {
          // For edited images: generated/{userId}/edited/{editId}/
          imageKey = `generated/${userId}/edited/${generationId}/${imageFilename}`
          thumbnailKey = `generated/${userId}/edited/${generationId}/${thumbnailFilename}`
        } else {
          // For regular generations: generated/{userId}/{generationId}/ (keep existing structure)
          imageKey = `generated/${userId}/${generationId}/${imageFilename}`
          thumbnailKey = `generated/${userId}/${generationId}/${thumbnailFilename}`
        }

        // Upload original image directly to generationId folder
        console.log(`☁️ Uploading original image to ${imageKey}`)
        const uploadResult = await storage.upload(
          imageBuffer,
          imageKey,
          {
            filename: imageFilename,
            makePublic: true
          }
        )

        permanentUrls.push(uploadResult.url)
        console.log(`✅ Original image uploaded successfully: ${uploadResult.url}`)

        // Generate and upload thumbnail to same generationId folder
        console.log(`🖼️ Generating thumbnail for image ${i + 1}`)
        const thumbnailBuffer = await generateThumbnailBuffer(imageBuffer)

        const thumbnailUpload = await storage.upload(
          thumbnailBuffer,
          thumbnailKey,
          {
            filename: thumbnailFilename,
            makePublic: true
          }
        )

        thumbnailUrls.push(thumbnailUpload.url)
        console.log(`✅ Thumbnail uploaded successfully: ${thumbnailUpload.url}`)

      } catch (error) {
        console.error(`❌ Failed to download/store image ${i + 1}:`, error)
        // Continue with other images even if one fails
        continue
      }
    }
    
    if (permanentUrls.length === 0) {
      return {
        success: false,
        error: 'Failed to download and store any images'
      }
    }
    
    console.log(`🎉 Successfully stored ${permanentUrls.length}/${temporaryUrls.length} images`)
    
    return {
      success: true,
      permanentUrls,
      thumbnailUrls
    }
    
  } catch (error) {
    console.error('❌ Error in downloadAndStoreImages:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Generate thumbnail buffer from image buffer
 */
export async function generateThumbnailBuffer(
  imageBuffer: Buffer,
  maxWidth: number = 300,
  maxHeight: number = 300,
  quality: number = 90
): Promise<Buffer> {
  try {
    return await sharp(imageBuffer)
      .resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .png({ quality })
      .toBuffer()
  } catch (error) {
    console.error('Error generating thumbnail:', error)
    // Fallback: return original image buffer
    return imageBuffer
  }
}

/**
 * Download a single image and return as buffer
 */
export async function downloadImageBuffer(url: string): Promise<Buffer> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'VibePhoto/1.0',
    },
    signal: controller.signal
  })
  
  clearTimeout(timeoutId)
  
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status} ${response.statusText}`)
  }
  
  return Buffer.from(await response.arrayBuffer())
}

/**
 * Clean up temporary files (for local storage provider)
 */
export async function cleanupTemporaryFiles(keys: string[]): Promise<void> {
  const storage = getStorageProvider()
  
  for (const key of keys) {
    try {
      await storage.delete(key)
      console.log(`🗑️ Cleaned up temporary file: ${key}`)
    } catch (error) {
      console.warn(`⚠️ Failed to cleanup file ${key}:`, error)
    }
  }
}

/**
 * Validate image URL is accessible
 */
export async function validateImageUrl(url: string): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
    
    const response = await fetch(url, { 
      method: 'HEAD',
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    return response.ok
  } catch (error) {
    console.warn(`Failed to validate image URL ${url}:`, error)
    return false
  }
}

/**
 * Download video from URL and store permanently using standardized structure
 */
export async function downloadAndStoreVideo(
  videoUrl: string,
  videoGenId: string,
  userId: string
): Promise<{ success: boolean; error?: string; videoUrl?: string; thumbnailUrl?: string }> {
  try {
    const storage = getStorageProvider()

    console.log(`📥 Starting download of video for generation ${videoGenId}`)

    // Download the video with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 120000) // 2 minute timeout for videos

    const response = await fetch(videoUrl, {
      headers: {
        'User-Agent': 'VibePhoto/1.0',
      },
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`Failed to download video: ${response.status} ${response.statusText}`)
    }

    const videoBuffer = Buffer.from(await response.arrayBuffer())
    const contentType = response.headers.get('content-type') || 'video/mp4'

    // Ensure we're working with a video content type
    if (!contentType.startsWith('video/')) {
      console.warn(`Unexpected content type for video: ${contentType}, forcing to video/mp4`)
    }

    // Use new standardized structure: generated/{userId}/videos/uniqueFilename.mp4
    const videoFilename = `${videoGenId}_${generateUniqueFilename('mp4')}`
    const videoKey = buildS3Key(userId, 'videos', videoFilename)

    // Upload video using standardized method
    console.log(`☁️ Uploading video to ${videoKey}`)
    let uploadResult: UploadResult

    if (storage instanceof AWSS3Provider) {
      // Use new standardized upload method
      uploadResult = await storage.uploadStandardized(
        videoBuffer,
        userId,
        'videos',
        {
          filename: videoFilename,
          makePublic: true, // Videos are public as per S3 policy
          isVideo: true
        }
      )
    } else {
      // Fallback for other providers
      uploadResult = await storage.upload(
        videoBuffer,
        videoKey,
        {
          filename: videoFilename,
          makePublic: true,
          isVideo: true
        }
      )
    }

    console.log(`✅ Video uploaded successfully: ${uploadResult.url}`)

    return {
      success: true,
      videoUrl: uploadResult.url
    }

  } catch (error) {
    console.error('❌ Error in downloadAndStoreVideo:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Generate video filename for storage
 */
export function generateVideoFilename(videoGenId: string, extension: string = 'mp4'): string {
  const timestamp = Date.now()
  return `video_${videoGenId}_${timestamp}.${extension}`
}

/**
 * Validate video URL is accessible
 */
export async function validateVideoUrl(url: string): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal
    })

    clearTimeout(timeoutId)
    return response.ok
  } catch (error) {
    console.warn(`Failed to validate video URL ${url}:`, error)
    return false
  }
}

/**
 * Detect file extension from content type
 */
function detectFileExtension(contentType: string): string {
  switch (contentType.toLowerCase()) {
    case 'image/jpeg':
    case 'image/jpg':
      return 'jpg'
    case 'image/png':
      return 'png'
    case 'image/webp':
      return 'webp'
    case 'image/gif':
      return 'gif'
    case 'video/mp4':
      return 'mp4'
    case 'video/webm':
      return 'webm'
    default:
      return 'jpg' // default fallback
  }
}