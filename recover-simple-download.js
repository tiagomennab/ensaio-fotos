require('dotenv').config({ path: '.env.local' })
const { PrismaClient } = require('@prisma/client')
const Replicate = require('replicate')
const AWS = require('aws-sdk')
const fetch = require('node-fetch')
const sharp = require('sharp')

const prisma = new PrismaClient()
const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN })

// AWS S3 Configuration
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET

function detectOperationContext(prediction) {
  const prompt = prediction.input?.prompt || ''
  if (prompt.startsWith('[EDITED]')) return { operationType: 'edit', storageContext: 'edited' }
  if (prompt.startsWith('[UPSCALED]')) return { operationType: 'upscale', storageContext: 'upscaled' }
  if (prompt.startsWith('[VIDEO]')) return { operationType: 'video', storageContext: 'videos' }
  return { operationType: 'generation', storageContext: 'generated' }
}

async function downloadImage(url) {
  console.log(`📥 Downloading from: ${url}`)
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  const buffer = await response.buffer()
  console.log(`✅ Downloaded ${buffer.length} bytes`)
  return buffer
}

async function createThumbnail(imageBuffer) {
  console.log('🔄 Creating thumbnail...')
  const thumbnailBuffer = await sharp(imageBuffer)
    .resize(300, 300, { fit: 'cover', position: 'center' })
    .jpeg({ quality: 80 })
    .toBuffer()
  console.log(`✅ Thumbnail created (${thumbnailBuffer.length} bytes)`)
  return thumbnailBuffer
}

async function uploadToS3(buffer, key, contentType = 'image/jpeg') {
  console.log(`☁️ Uploading to S3: ${key}`)
  
  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ACL: 'public-read'
  }
  
  const result = await s3.upload(params).promise()
  console.log(`✅ Uploaded to: ${result.Location}`)
  return result.Location
}

async function processImages(imageUrls, userId, generationId, context) {
  const permanentUrls = []
  const thumbnailUrls = []
  
  for (let i = 0; i < imageUrls.length; i++) {
    const imageUrl = imageUrls[i]
    
    try {
      console.log(`\n🔄 Processing image ${i + 1}/${imageUrls.length}`)
      
      // Download original image
      const imageBuffer = await downloadImage(imageUrl)
      
      // Create thumbnail
      const thumbnailBuffer = await createThumbnail(imageBuffer)
      
      // Upload both to S3
      const imageKey = `${context}/${userId}/${generationId}_${i}.jpg`
      const thumbnailKey = `thumbnails/${context}/${userId}/${generationId}_${i}_thumb.jpg`
      
      const [imageS3Url, thumbnailS3Url] = await Promise.all([
        uploadToS3(imageBuffer, imageKey),
        uploadToS3(thumbnailBuffer, thumbnailKey)
      ])
      
      permanentUrls.push(imageS3Url)
      thumbnailUrls.push(thumbnailS3Url)
      
      console.log(`✅ Image ${i + 1} processed successfully`)
      
    } catch (error) {
      console.error(`❌ Failed to process image ${i + 1}:`, error.message)
      // Continue with other images
    }
  }
  
  return { permanentUrls, thumbnailUrls }
}

async function recoverSimpleDownload() {
  try {
    const jobId = '2vdyfzgbxdrma0cs7x6vqaayvm'
    
    console.log('🚀 RECOVERING WITH SIMPLE DOWNLOAD')
    console.log('==================================')
    
    // Check AWS configuration
    if (!BUCKET_NAME || !process.env.AWS_ACCESS_KEY_ID) {
      console.log('❌ AWS configuration missing')
      console.log('STORAGE_PROVIDER:', process.env.STORAGE_PROVIDER)
      console.log('AWS_S3_BUCKET:', !!BUCKET_NAME)
      console.log('AWS_ACCESS_KEY_ID:', !!process.env.AWS_ACCESS_KEY_ID)
      return
    }
    
    // Find the generation
    const generation = await prisma.generation.findFirst({
      where: { jobId }
    })
    
    if (!generation) {
      console.log('❌ Generation not found')
      return
    }
    
    console.log('✅ Found generation:', generation.id)
    console.log('User ID:', generation.userId)
    
    // Get prediction from Replicate
    const prediction = await replicate.predictions.get(jobId)
    
    if (prediction.status !== 'succeeded' || !prediction.output) {
      console.log('❌ Prediction not ready')
      return
    }
    
    // Detect context
    const context = detectOperationContext(prediction)
    console.log('🎯 Storage context:', context.storageContext)
    
    // Process images
    const imageUrls = Array.isArray(prediction.output) ? prediction.output : [prediction.output]
    console.log('Source URLs:', imageUrls)
    
    const { permanentUrls, thumbnailUrls } = await processImages(
      imageUrls,
      generation.userId,
      generation.id,
      context.storageContext
    )
    
    if (permanentUrls.length > 0) {
      // Update generation with permanent URLs
      const updatedGeneration = await prisma.generation.update({
        where: { id: generation.id },
        data: {
          imageUrls: permanentUrls,
          thumbnailUrls: thumbnailUrls,
          status: 'COMPLETED'
        }
      })
      
      console.log('\n🎉 RECOVERY COMPLETE!')
      console.log('Generation ID:', updatedGeneration.id)
      console.log('Status:', updatedGeneration.status)
      console.log('Image URLs:', updatedGeneration.imageUrls)
      console.log('Thumbnail URLs:', updatedGeneration.thumbnailUrls)
      
    } else {
      console.log('❌ No images were processed successfully')
    }
    
  } catch (error) {
    console.error('❌ Recovery error:', error.message)
    console.error('Stack:', error.stack)
  } finally {
    await prisma.$disconnect()
  }
}

// Check if we should actually run
const EXECUTE = process.argv.includes('--execute')

if (EXECUTE) {
  recoverSimpleDownload()
} else {
  console.log('🔍 DRY RUN MODE')
  console.log('Add --execute to actually run recovery')
  console.log('Usage: node recover-simple-download.js --execute')
}