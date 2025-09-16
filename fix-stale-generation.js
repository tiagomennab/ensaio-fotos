require('dotenv').config({ path: '.env.local' })
const { PrismaClient } = require('@prisma/client')
const Replicate = require('replicate')

const prisma = new PrismaClient()
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

async function fixStaleGeneration() {
  try {
    const jobId = '4dhqtrw1q5rj40cs7tk83jkgmr'
    const generationId = 'cmfh0wh0o0001qj1w66lwyev4'
    
    console.log('🔧 Fixing stale generation...')
    console.log(`Generation ID: ${generationId}`)
    console.log(`Job ID: ${jobId}`)
    
    // Get the real status from Replicate
    const prediction = await replicate.predictions.get(jobId)
    
    console.log('\n📊 Replicate Status:', prediction.status)
    console.log('Output available:', !!prediction.output)
    
    if (prediction.status === 'succeeded' && prediction.output) {
      const imageUrl = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output
      
      console.log('🖼️ Image URL:', imageUrl)
      
      // Now we need to download and store this image permanently
      console.log('📥 Starting image download and storage...')
      
      const { downloadAndStoreImages } = require('./src/lib/storage/utils.ts')
      
      // Get generation details for user ID
      const generation = await prisma.generation.findUnique({
        where: { id: generationId }
      })
      
      if (!generation) {
        throw new Error('Generation not found in database')
      }
      
      console.log(`👤 User ID: ${generation.userId}`)
      
      // Download and store the image
      const storageResult = await downloadAndStoreImages(
        [imageUrl],
        generationId,
        generation.userId
      )
      
      if (storageResult.success) {
        console.log('✅ Image stored successfully!')
        console.log('Permanent URLs:', storageResult.permanentUrls)
        console.log('Thumbnail URLs:', storageResult.thumbnailUrls)
        
        // Update the generation in the database
        await prisma.generation.update({
          where: { id: generationId },
          data: {
            status: 'COMPLETED',
            imageUrls: storageResult.permanentUrls,
            thumbnailUrls: storageResult.thumbnailUrls,
            completedAt: new Date(prediction.completed_at),
            processingTime: prediction.metrics?.total_time ? Math.round(prediction.metrics.total_time * 1000) : null,
            errorMessage: null
          }
        })
        
        console.log('✅ Database updated successfully!')
        
        // Verify the update
        const updatedGeneration = await prisma.generation.findUnique({
          where: { id: generationId }
        })
        
        console.log('\n📋 Updated Generation:')
        console.log('Status:', updatedGeneration.status)
        console.log('Image URLs:', updatedGeneration.imageUrls?.length || 0)
        console.log('Completed At:', updatedGeneration.completedAt)
        
      } else {
        console.error('❌ Storage failed:', storageResult.error)
        
        // Update with error
        await prisma.generation.update({
          where: { id: generationId },
          data: {
            status: 'FAILED',
            errorMessage: `Storage failed: ${storageResult.error}`,
            completedAt: new Date()
          }
        })
      }
      
    } else if (prediction.status === 'failed') {
      console.log('❌ Replicate job failed:', prediction.error)
      
      await prisma.generation.update({
        where: { id: generationId },
        data: {
          status: 'FAILED',
          errorMessage: prediction.error || 'Generation failed on Replicate',
          completedAt: new Date(prediction.completed_at || new Date())
        }
      })
      
    } else {
      console.log('⚠️ Unexpected status:', prediction.status)
    }
    
  } catch (error) {
    console.error('❌ Error fixing generation:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixStaleGeneration()