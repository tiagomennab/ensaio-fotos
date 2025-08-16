export const STORAGE_CONFIG = {
  // Provider selection: 's3' | 'cloudinary' | 'local'
  provider: (process.env.STORAGE_PROVIDER || 'local') as 'aws' | 'cloudinary' | 'local',
  
  // AWS S3 Configuration
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    region: process.env.AWS_REGION || 'us-east-1',
    bucket: process.env.AWS_S3_BUCKET || '',
    cloudFrontUrl: process.env.AWS_CLOUDFRONT_URL || ''
  },
  
  // Cloudinary Configuration
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    folder: process.env.CLOUDINARY_FOLDER || 'ensaio-fotos'
  },
  
  // File upload constraints
  limits: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 20,
    allowedMimeTypes: [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/webp'
    ],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp']
  },
  
  // Image processing settings
  processing: {
    // Face photos (smaller, square aspect ratio preferred)
    face: {
      maxWidth: 1024,
      maxHeight: 1024,
      quality: 90,
      format: 'jpeg'
    },
    // Body photos (can be larger, various aspect ratios)
    body: {
      maxWidth: 1536,
      maxHeight: 2048,
      quality: 85,
      format: 'jpeg'
    },
    // Generated images
    generated: {
      maxWidth: 2048,
      maxHeight: 2048,
      quality: 90,
      format: 'jpeg'
    },
    // Thumbnails
    thumbnail: {
      width: 300,
      height: 300,
      quality: 80,
      format: 'jpeg'
    }
  }
}

export const UPLOAD_PATHS = {
  training: {
    face: 'training/face',
    body: 'training/body'
  },
  generated: 'generated',
  thumbnails: 'thumbnails',
  temp: 'temp'
} as const