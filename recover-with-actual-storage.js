require('dotenv').config({ path: '.env.local' })
const { PrismaClient } = require('@prisma/client')
const Replicate = require('replicate')

const prisma = new PrismaClient()
const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN })

// Import the actual storage utility
const { downloadAndStoreImages } = require('./src/lib/storage/utils')

function detectOperationContext(prediction) {
  const prompt = prediction.input?.prompt || ''
  if (prompt.startsWith('[EDITED]')) return { operationType: 'edit', storageContext: 'edited' }
  if (prompt.startsWith('[UPSCALED]')) return { operationType: 'upscale', storageContext: 'upscaled' }
  if (prompt.startsWith('[VIDEO]')) return { operationType: 'video', storageContext: 'videos' }
  return { operationType: 'generation', storageContext: 'generated' }
}

async function recoverWithActualStorage() {
  try {
    const jobId = '2vdyfzgbxdrma0cs7x6vqaayvm'
    
    console.log('🚀 RECOVERING WITH ACTUAL STORAGE')
    console.log('=================================')
    
    // Find the generation we just created
    const generation = await prisma.generation.findFirst({
      where: { jobId }
    })
    
    if (!generation) {
      console.log('❌ Generation not found')
      return
    }
    
    console.log('✅ Found generation:', generation.id)
    console.log('Status:', generation.status)
    console.log('Current image URLs:', generation.imageUrls)
    
    // Get prediction from Replicate
    const prediction = await replicate.predictions.get(jobId)
    
    if (prediction.status !== 'succeeded' || !prediction.output) {
      console.log('❌ Prediction not ready')
      return
    }
    
    // Detect context
    const context = detectOperationContext(prediction)
    console.log('🎯 Storage context:', context.storageContext)
    
    // Download and store images using actual storage system
    console.log('\n📥 DOWNLOADING AND STORING IMAGES...')
    const imageUrls = Array.isArray(prediction.output) ? prediction.output : [prediction.output]
    console.log('Source URLs:', imageUrls)
    
    const storageResult = await downloadAndStoreImages(
      imageUrls,
      generation.id,
      generation.userId,
      context.storageContext
    )
    
    if (storageResult.success) {
      console.log('✅ Images stored successfully')
      console.log('Permanent URLs:', storageResult.permanentUrls)
      console.log('Thumbnail URLs:', storageResult.thumbnailUrls)
      
      // Update generation with permanent URLs
      const updatedGeneration = await prisma.generation.update({
        where: { id: generation.id },
        data: {
          imageUrls: storageResult.permanentUrls || [],
          thumbnailUrls: storageResult.thumbnailUrls || [],
          status: 'COMPLETED'
        }
      })
      
      console.log('\n🎉 RECOVERY COMPLETE!')
      console.log('Generation ID:', updatedGeneration.id)
      console.log('Final Status:', updatedGeneration.status)
      console.log('Final Image URLs:', updatedGeneration.imageUrls)
      console.log('Final Thumbnail URLs:', updatedGeneration.thumbnailUrls)
      
    } else {
      console.log('❌ Storage failed:', storageResult.error)
    }
    
  } catch (error) {
    console.error('❌ Recovery error:', error.message)
    console.error('Stack:', error.stack)
  } finally {
    await prisma.$disconnect()
  }
}

recoverWithActualStorage()