require('dotenv').config({ path: '.env.local' })
const { PrismaClient } = require('@prisma/client')
const Replicate = require('replicate')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

// Simple implementation of storage functionality
async function downloadAndStoreImage(imageUrl, generationId, userId) {
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
    
    // Create S3 key
    const timestamp = Date.now()
    const imageKey = `generated/${userId}/${generationId}_${timestamp}.png`
    const thumbnailKey = `thumbnails/${userId}/${generationId}_${timestamp}.png`
    
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
      thumbnailUrls: [thumbnailUrl]
    }
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}

async function fixStaleGeneration() {
  try {
    const jobId = '4dhqtrw1q5rj40cs7tk83jkgmr'
    const generationId = 'cmfh0wh0o0001qj1w66lwyev4'
    
    console.log('🔧 Fixing stale generation...')
    
    // Get the real status from Replicate
    const prediction = await replicate.predictions.get(jobId)
    
    console.log('📊 Replicate Status:', prediction.status)
    
    if (prediction.status === 'succeeded' && prediction.output) {
      const imageUrl = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output
      
      console.log('🖼️ Image URL:', imageUrl)
      
      // Get generation details for user ID
      const generation = await prisma.generation.findUnique({
        where: { id: generationId }
      })
      
      if (!generation) {
        throw new Error('Generation not found in database')
      }
      
      console.log(`👤 User ID: ${generation.userId}`)
      
      // Download and store the image
      const storageResult = await downloadAndStoreImage(imageUrl, generationId, generation.userId)
      
      if (storageResult.success) {
        console.log('✅ Image stored successfully!')
        
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
        console.log('Permanent URLs:', storageResult.permanentUrls)
        
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

fixStaleGeneration()