import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { StorageProvider, UploadResult, UploadOptions, FileValidation, DeleteResult, StorageError } from '../base'
import { STORAGE_CONFIG, UPLOAD_PATHS } from '../config'
import sharp from 'sharp'

export class AWSS3Provider extends StorageProvider {
  private s3Client: S3Client
  private bucket: string
  private cloudFrontUrl?: string

  constructor() {
    super()
    
    if (!STORAGE_CONFIG.aws.accessKeyId || !STORAGE_CONFIG.aws.secretAccessKey) {
      throw new StorageError('AWS credentials not configured', 'AWS_CONFIG_ERROR')
    }

    this.s3Client = new S3Client({
      region: STORAGE_CONFIG.aws.region,
      credentials: {
        accessKeyId: STORAGE_CONFIG.aws.accessKeyId,
        secretAccessKey: STORAGE_CONFIG.aws.secretAccessKey
      }
    })
    
    this.bucket = STORAGE_CONFIG.aws.bucket
    this.cloudFrontUrl = STORAGE_CONFIG.aws.cloudFrontUrl
  }

  async upload(
    file: File | Buffer, 
    path: string, 
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    try {
      let buffer: Buffer
      let originalName: string
      let mimeType: string
      let size: number

      if (file instanceof File) {
        buffer = Buffer.from(await file.arrayBuffer())
        originalName = file.name
        mimeType = file.type
        size = file.size
      } else {
        buffer = file
        originalName = options.filename || 'uploaded-file'
        mimeType = 'image/jpeg' // Default for processed images
        size = buffer.length
      }

      // Validate file if it's a File object
      if (file instanceof File) {
        const validation = this.validateFile(file)
        if (!validation.isValid) {
          throw new StorageError(validation.error!, 'VALIDATION_ERROR', 400)
        }
      }

      // Process image if options are provided
      if (options.maxWidth || options.maxHeight || options.quality) {
        buffer = await this.processImage(buffer, options)
        size = buffer.length
      }

      // Generate unique filename
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 15)
      const extension = originalName.split('.').pop()
      const filename = options.filename || `${timestamp}-${randomString}.${extension}`
      const key = `${path}/${filename}`

      // Upload to S3
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
        Metadata: {
          originalName,
          uploadedAt: new Date().toISOString()
        }
      })

      await this.s3Client.send(command)

      const result: UploadResult = {
        url: this.getPublicUrl(key),
        key,
        originalName,
        size,
        mimeType
      }

      // Generate thumbnail if requested
      if (options.generateThumbnail) {
        const thumbnailPath = `${UPLOAD_PATHS.thumbnails}/${filename}`
        const thumbnailResult = await this.generateThumbnail(key, thumbnailPath)
        result.thumbnailUrl = thumbnailResult.url
      }

      return result

    } catch (error) {
      if (error instanceof StorageError) {
        throw error
      }
      throw new StorageError(
        `Failed to upload to S3: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'S3_UPLOAD_ERROR'
      )
    }
  }

  async delete(key: string): Promise<DeleteResult> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key
      })

      await this.s3Client.send(command)
      
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete file'
      }
    }
  }

  getPublicUrl(key: string): string {
    if (this.cloudFrontUrl) {
      return `${this.cloudFrontUrl}/${key}`
    }
    return `https://${this.bucket}.s3.${STORAGE_CONFIG.aws.region}.amazonaws.com/${key}`
  }

  /**
   * Generate a pre-signed URL for accessing private S3 objects
   * @param key S3 object key
   * @param expiresIn Expiration time in seconds (default: 1 hour)
   * @returns Pre-signed URL that allows temporary access
   */
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key
      })
      
      const signedUrl = await getSignedUrl(this.s3Client, command, { expiresIn })
      return signedUrl
    } catch (error) {
      throw new StorageError(
        `Failed to generate signed URL: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'SIGNED_URL_ERROR'
      )
    }
  }

  validateFile(file: File): FileValidation {
    // Check file size
    if (file.size > STORAGE_CONFIG.limits.maxFileSize) {
      return {
        isValid: false,
        error: `File size exceeds maximum allowed size of ${STORAGE_CONFIG.limits.maxFileSize / 1024 / 1024}MB`
      }
    }

    // Check mime type
    if (!STORAGE_CONFIG.limits.allowedMimeTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `File type ${file.type} is not allowed. Allowed types: ${STORAGE_CONFIG.limits.allowedMimeTypes.join(', ')}`
      }
    }

    // Check file extension
    const extension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!STORAGE_CONFIG.limits.allowedExtensions.includes(extension)) {
      return {
        isValid: false,
        error: `File extension ${extension} is not allowed. Allowed extensions: ${STORAGE_CONFIG.limits.allowedExtensions.join(', ')}`
      }
    }

    return { isValid: true }
  }

  async generateThumbnail(sourceKey: string, thumbnailPath: string): Promise<UploadResult> {
    try {
      // This would typically fetch the source image from S3, process it, and upload the thumbnail
      // For now, we'll return a placeholder implementation
      const thumbnailConfig = STORAGE_CONFIG.processing.thumbnail
      
      // In a real implementation, you would:
      // 1. Download the source image from S3
      // 2. Process it with Sharp to create a thumbnail
      // 3. Upload the thumbnail back to S3
      
      return {
        url: this.getPublicUrl(thumbnailPath),
        key: thumbnailPath,
        originalName: 'thumbnail.jpg',
        size: 0,
        mimeType: 'image/jpeg'
      }
    } catch (error) {
      throw new StorageError(
        `Failed to generate thumbnail: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'THUMBNAIL_ERROR'
      )
    }
  }

  private async processImage(buffer: Buffer, options: UploadOptions): Promise<Buffer> {
    try {
      let sharpInstance = sharp(buffer)

      // Resize if dimensions are specified
      if (options.maxWidth || options.maxHeight) {
        sharpInstance = sharpInstance.resize(options.maxWidth, options.maxHeight, {
          fit: 'inside',
          withoutEnlargement: true
        })
      }

      // Set quality and format
      sharpInstance = sharpInstance.jpeg({
        quality: options.quality || 85,
        progressive: true
      })

      return await sharpInstance.toBuffer()
    } catch (error) {
      throw new StorageError(
        `Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'IMAGE_PROCESSING_ERROR'
      )
    }
  }
}