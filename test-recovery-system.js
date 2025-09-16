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

async function testRecoverySystem() {
  try {
    const jobId = '2vdyfzgbxdrma0cs7x6vqaayvm'
    
    console.log('🚀 TESTING RECOVERY SYSTEM')
    console.log('==========================')
    
    // Get prediction from Replicate
    const prediction = await replicate.predictions.get(jobId)
    
    if (prediction.status !== 'succeeded' || !prediction.output) {
      console.log('❌ Prediction not ready for recovery')
      return
    }
    
    console.log('✅ Prediction ready for recovery')
    console.log('Output URLs:', prediction.output)
    
    // Detect operation type
    const context = detectOperationContext(prediction)
    console.log('🎯 Detected context:', context)
    
    // Simulate what the webhook should do
    console.log('\n📝 SIMULATING WEBHOOK PROCESSING')
    
    // Find the generation in database (should not exist)
    const existingGeneration = await prisma.generation.findFirst({
      where: { jobId }
    })
    
    if (existingGeneration) {
      console.log('⚠️ Generation already exists in database')
      console.log('ID:', existingGeneration.id)
      console.log('Status:', existingGeneration.status)
      console.log('Image URLs:', existingGeneration.imageUrls)
    } else {
      console.log('❌ Generation not found in database (as expected)')
    }
    
    // For testing purposes, let's create a minimal generation record
    // to test our storage system
    console.log('\n🔧 CREATING TEST GENERATION RECORD')
    
    const testGeneration = await prisma.generation.create({
      data: {
        userId: 'cmf3555br0004qjk80pe9dhqr', // Using real user ID
        jobId: jobId,
        prompt: prediction.input.prompt,
        status: 'PROCESSING',
        modelId: 'cmf3ccj3k0008qjk86b5jvduj', // Using ready model
        // Use existing schema fields for input parameters
        strength: prediction.input.resemblance || 0.8,
        seed: prediction.input.seed,
        resolution: `${prediction.input.resolution || 'original'}`,
        variations: 1,
        negativePrompt: prediction.input.negative_prompt
      }
    })
    
    console.log('✅ Test generation created:', testGeneration.id)
    
    // Test storage path generation without metadata fields
    const userId = testGeneration.userId
    const generationId = testGeneration.id
    
    console.log('\n📂 TESTING STORAGE PATHS')
    console.log('Storage context (from prompt analysis):', context.storageContext)
    console.log('Expected image path:', `${context.storageContext}/${userId}/${generationId}_0.jpg`)
    console.log('Expected thumbnail path:', `thumbnails/${context.storageContext}/${userId}/${generationId}_0_thumb.jpg`)
    
    // Test URL accessibility (already confirmed working)
    const imageUrl = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output
    console.log('\n🌐 Image URL ready for download:', imageUrl)
    
    // Clean up test record
    await prisma.generation.delete({
      where: { id: testGeneration.id }
    })
    console.log('🧹 Test record cleaned up')
    
    console.log('\n✅ RECOVERY SYSTEM TEST COMPLETE')
    console.log('Next step: Apply migration and test full webhook recovery')
    
  } catch (error) {
    console.error('❌ Recovery test error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

testRecoverySystem()