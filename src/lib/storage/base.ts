export interface UploadResult {
  url: string
  key: string
  publicId?: string
  originalName: string
  size: number
  mimeType: string
  thumbnailUrl?: string
}

export interface UploadOptions {
  folder?: string
  filename?: string
  quality?: number
  maxWidth?: number
  maxHeight?: number
  generateThumbnail?: boolean
  makePublic?: boolean
}

export interface FileValidation {
  isValid: boolean
  error?: string
}

export interface DeleteResult {
  success: boolean
  error?: string
}

export abstract class StorageProvider {
  abstract upload(
    file: File | Buffer,
    path: string,
    options?: UploadOptions
  ): Promise<UploadResult>
  
  abstract delete(key: string): Promise<DeleteResult>
  
  abstract getPublicUrl(key: string): string
  
  abstract validateFile(file: File): FileValidation
  
  abstract generateThumbnail(
    sourceKey: string,
    thumbnailPath: string
  ): Promise<UploadResult>
}

export class StorageError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message)
    this.name = 'StorageError'
  }
}