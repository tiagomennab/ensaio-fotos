require('dotenv').config({ path: '.env.local' })
const { PrismaClient } = require('@prisma/client')
const Replicate = require('replicate')

const prisma = new PrismaClient()
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

// Simple implementation of context detection
function detectOperationContext(generation) {
  const prompt = generation.prompt || ''
  
  // Detectar por prefixo no prompt
  if (prompt.startsWith('[EDITED]')) {
    return { operationType: 'edit', storageContext: 'edited' }
  }
  if (prompt.startsWith('[UPSCALED]')) {
    return { operationType: 'upscale', storageContext: 'upscaled' }
  }
  if (prompt.startsWith('[VIDEO]')) {
    return { operationType: 'video', storageContext: 'videos' }
  }
  
  // Default: geração normal
  return { operationType: 'generation', storageContext: 'generated' }
}

// Simple implementation of storage functionality
async function downloadAndStoreImage(imageUrl, generationId, userId, context) {
  try {
    console.log('📥 Downloading image...')
    
    // Download the image
    const response = await fetch(imageUrl)
    if (!response.ok) {
      throw new Error(`Download failed: ${response.status}`)
    }
    
    const imageBuffer = Buffer.from(await response.arrayBuffer())
    console.log(`✅ Downloaded ${imageBuffer.length} bytes`)
    
    // We'll use AWS S3 directly since that's configured
    const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
    
    const s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    })
    
    // Create S3 key with context-aware path
    const timestamp = Date.now()
    const imageKey = `${context}/${userId}/${generationId}_${timestamp}.png`
    const thumbnailKey = `thumbnails/${context}/${userId}/${generationId}_${timestamp}.png`
    
    // Upload original image
    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: imageKey,
      Body: imageBuffer,
      ContentType: 'image/png'
    }))
    
    const imageUrl_permanent = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${imageKey}`
    console.log('✅ Uploaded to S3:', imageUrl_permanent)
    
    // For now, use the same URL for thumbnail
    const thumbnailUrl = imageUrl_permanent
    
    return {
      success: true,
      permanentUrls: [imageUrl_permanent],
      thumbnailUrls: [thumbnailUrl],
      storageKeys: [imageKey]
    }
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}

async function recoverJobWithMetadata() {
  try {
    const jobId = 'aqcyg3d3m5rm80cs7vhbay27cm'
    
    console.log('🔧 Recovering job with full metadata...')
    
    // Get the real status from Replicate
    const prediction = await replicate.predictions.get(jobId)
    
    console.log('📊 Replicate Status:', prediction.status)
    
    if (prediction.status === 'succeeded' && prediction.output) {
      const imageUrl = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output
      
      console.log('🖼️ Image URL:', imageUrl)
      
      // Get generation details
      const generation = await prisma.generation.findFirst({
        where: { jobId }
      })
      
      if (!generation) {
        throw new Error('Generation not found in database')
      }
      
      console.log(`👤 User ID: ${generation.userId}`)
      console.log(`📝 Prompt: ${generation.prompt?.substring(0, 100)}...`)
      
      // Detect operation context
      const context = detectOperationContext(generation)
      console.log(`📁 Detected context: ${context.operationType} -> ${context.storageContext}`)
      
      // Download and store the image
      const storageResult = await downloadAndStoreImage(imageUrl, generation.id, generation.userId, context.storageContext)
      
      if (storageResult.success) {
        console.log('✅ Image stored successfully!')
        
        // Update the generation in the database with full metadata
        const updateData = {
          status: 'COMPLETED',
          imageUrls: storageResult.permanentUrls,
          thumbnailUrls: storageResult.thumbnailUrls,
          completedAt: new Date(prediction.completed_at),
          processingTime: prediction.metrics?.total_time ? Math.round(prediction.metrics.total_time * 1000) : null,
          errorMessage: null,
          // New metadata fields
          operationType: context.operationType,
          storageContext: context.storageContext,
          storageProvider: 'aws',
          storageBucket: process.env.AWS_S3_BUCKET,
          storageKeys: storageResult.storageKeys,
          metadata: {
            context: context,
            recovered: true,
            recoveredAt: new Date().toISOString(),
            replicateJobId: jobId,
            originalImageUrl: imageUrl
          }
        }
        
        await prisma.generation.update({
          where: { id: generation.id },
          data: updateData
        })
        
        console.log('✅ Database updated with full metadata!')
        console.log('📊 Final status:', updateData.status)
        console.log('📁 Storage context:', updateData.storageContext)
        console.log('🗂️ Operation type:', updateData.operationType)
        console.log('🔗 Permanent URLs:', storageResult.permanentUrls)
        
      } else {
        console.error('❌ Storage failed:', storageResult.error)
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

recoverJobWithMetadata()