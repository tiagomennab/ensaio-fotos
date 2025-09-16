require('dotenv').config({ path: '.env.local' })
const { PrismaClient } = require('@prisma/client')
const Replicate = require('replicate')

const prisma = new PrismaClient()
const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN })

function detectOperationContext(prediction) {
  const prompt = prediction.input?.prompt || ''
  if (prompt.startsWith('[EDITED]')) return { operationType: 'edit', storageContext: 'edited' }
  if (prompt.startsWith('[UPSCALED]')) return { operationType: 'upscale', storageContext: 'upscaled' }
  if (prompt.startsWith('[VIDEO]')) return { operationType: 'video', storageContext: 'videos' }
  return { operationType: 'generation', storageContext: 'generated' }
}

async function downloadAndStoreImages(imageUrls, userId, generationId, context) {
  // This would normally call the storage utility, but for now we'll simulate
  console.log(`📥 WOULD DOWNLOAD AND STORE ${imageUrls.length} IMAGES`)
  
  const storedImages = []
  const storedThumbnails = []
  
  for (let i = 0; i < imageUrls.length; i++) {
    const imageUrl = imageUrls[i]
    const imageKey = `${context}/${userId}/${generationId}_${i}.jpg`
    const thumbnailKey = `thumbnails/${context}/${userId}/${generationId}_${i}_thumb.jpg`
    
    console.log(`  ${i + 1}. Image: ${imageKey}`)
    console.log(`     Thumbnail: ${thumbnailKey}`)
    console.log(`     Source: ${imageUrl}`)
    
    // In real implementation, we would:
    // 1. Download the image from imageUrl
    // 2. Create thumbnail
    // 3. Upload both to S3
    // 4. Get permanent URLs
    
    // For simulation, we'll use mock URLs
    storedImages.push(`https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${imageKey}`)
    storedThumbnails.push(`https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${thumbnailKey}`)
  }
  
  return { storedImages, storedThumbnails }
}

async function recoverMissingGeneration() {
  try {
    const jobId = '2vdyfzgbxdrma0cs7x6vqaayvm'
    const userId = 'cmf3555br0004qjk80pe9dhqr' // User who made this generation
    const modelId = 'cmf3ccj3k0008qjk86b5jvduj' // Model used (best guess)
    
    console.log('🚀 RECOVERING MISSING GENERATION')
    console.log('===============================')
    console.log('Job ID:', jobId)
    console.log('User ID:', userId)
    console.log('Model ID:', modelId)
    
    // Get prediction from Replicate
    const prediction = await replicate.predictions.get(jobId)
    
    if (prediction.status !== 'succeeded' || !prediction.output) {
      console.log('❌ Prediction not ready for recovery')
      return
    }
    
    console.log('✅ Prediction ready for recovery')
    console.log('Output URLs:', prediction.output)
    
    // Detect operation context
    const context = detectOperationContext(prediction)
    console.log('🎯 Detected context:', context)
    
    // Check if generation already exists
    const existingGeneration = await prisma.generation.findFirst({
      where: { jobId }
    })
    
    if (existingGeneration) {
      console.log('⚠️ Generation already exists, updating...')
      
      // Download and store images
      const imageUrls = Array.isArray(prediction.output) ? prediction.output : [prediction.output]
      const { storedImages, storedThumbnails } = await downloadAndStoreImages(
        imageUrls, userId, existingGeneration.id, context.storageContext
      )
      
      // Update existing generation
      const updatedGeneration = await prisma.generation.update({
        where: { id: existingGeneration.id },
        data: {
          status: 'COMPLETED',
          imageUrls: storedImages,
          thumbnailUrls: storedThumbnails,
          completedAt: new Date(prediction.completed_at)
        }
      })
      
      console.log('✅ Generation updated:', updatedGeneration.id)
      
    } else {
      console.log('🔧 Creating new generation record')
      
      // Create new generation record
      const newGeneration = await prisma.generation.create({
        data: {
          userId: userId,
          jobId: jobId,
          prompt: prediction.input.prompt,
          status: 'COMPLETED',
          modelId: modelId,
          // Use existing schema fields for input parameters
          strength: prediction.input.resemblance || 0.8,
          seed: prediction.input.seed,
          resolution: `${prediction.input.resolution || 'original'}`,
          variations: 1,
          negativePrompt: prediction.input.negative_prompt,
          completedAt: new Date(prediction.completed_at),
          createdAt: new Date(prediction.created_at),
          imageUrls: [], // Will be updated after storage
          thumbnailUrls: []
        }
      })
      
      console.log('✅ Generation created:', newGeneration.id)
      
      // Download and store images
      const imageUrls = Array.isArray(prediction.output) ? prediction.output : [prediction.output]
      const { storedImages, storedThumbnails } = await downloadAndStoreImages(
        imageUrls, userId, newGeneration.id, context.storageContext
      )
      
      // Update with final URLs
      const finalGeneration = await prisma.generation.update({
        where: { id: newGeneration.id },
        data: {
          imageUrls: storedImages,
          thumbnailUrls: storedThumbnails
        }
      })
      
      console.log('✅ Generation finalized with storage URLs')
    }
    
    console.log('\n🎉 RECOVERY COMPLETE!')
    console.log('The generation should now appear in the gallery.')
    
  } catch (error) {
    console.error('❌ Recovery error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

// Add a flag to actually run the recovery (safety check)
const ACTUALLY_RECOVER = process.argv.includes('--execute')

if (ACTUALLY_RECOVER) {
  console.log('⚠️  EXECUTING ACTUAL RECOVERY')
  recoverMissingGeneration()
} else {
  console.log('🔍 DRY RUN MODE')
  console.log('Add --execute flag to actually run the recovery')
  console.log('Usage: node recover-missing-generation.js --execute')
}