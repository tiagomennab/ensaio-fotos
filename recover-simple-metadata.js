require('dotenv').config({ path: '.env.local' })
const { PrismaClient } = require('@prisma/client')
const Replicate = require('replicate')

const prisma = new PrismaClient()
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

async function recoverSimple() {
  try {
    const jobId = 'aqcyg3d3m5rm80cs7vhbay27cm'
    
    console.log('🔧 Simple recovery with existing schema...')
    
    // Get the real status from Replicate
    const prediction = await replicate.predictions.get(jobId)
    console.log('📊 Replicate Status:', prediction.status)
    
    if (prediction.status === 'succeeded' && prediction.output) {
      const imageUrl = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output
      console.log('🖼️ Image URL available')
      
      // Get generation details
      const generation = await prisma.generation.findFirst({
        where: { jobId },
        select: { id: true, userId: true, prompt: true, status: true }
      })
      
      if (!generation) {
        throw new Error('Generation not found')
      }
      
      console.log(`📊 Current status: ${generation.status}`)
      
      // For now, just update with basic info using existing schema
      const updateResult = await prisma.generation.update({
        where: { id: generation.id },
        data: {
          status: 'COMPLETED',
          // Note: Using existing imageUrls field until schema is updated
          imageUrls: [imageUrl], // Use temporary URL for now
          completedAt: new Date(prediction.completed_at),
          processingTime: prediction.metrics?.total_time ? Math.round(prediction.metrics.total_time * 1000) : null,
          errorMessage: null
        }
      })
      
      console.log('✅ Updated generation status to COMPLETED')
      console.log('⚠️ Using temporary URL - will need proper storage after schema update')
      
      // Verify update
      const updated = await prisma.generation.findUnique({
        where: { id: generation.id },
        select: { status: true, imageUrls: true, completedAt: true }
      })
      
      console.log('📊 Verification:')
      console.log('Status:', updated.status)
      console.log('URLs:', updated.imageUrls?.length || 0)
      console.log('Completed:', updated.completedAt)
      
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

recoverSimple()