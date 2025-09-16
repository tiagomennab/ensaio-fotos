require('dotenv').config({ path: '.env.local' })
const { PrismaClient } = require('@prisma/client')
const Replicate = require('replicate')
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')

const prisma = new PrismaClient()
const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN })
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
})

async function recoverCurrentJob() {
  try {
    const jobId = 'aqcyg3d3m5rm80cs7vhbay27cm'
    
    console.log('🔧 Final recovery of current job...')
    
    // Check current status in database
    const generation = await prisma.generation.findFirst({
      where: { jobId },
      select: { id: true, userId: true, status: true, imageUrls: true, prompt: true }
    })
    
    if (!generation) {
      console.log('❌ Generation not found in database')
      return
    }
    
    console.log(`📊 Current DB status: ${generation.status}`)
    console.log(`🖼️ Current image URLs: ${generation.imageUrls?.length || 0}`)
    
    // Get real status from Replicate
    const prediction = await replicate.predictions.get(jobId)
    console.log(`📊 Replicate status: ${prediction.status}`)
    
    if (prediction.status === 'succeeded' && prediction.output) {
      const replicateUrl = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output
      console.log('🔗 Replicate image URL available')
      
      // Check if we need to download and store permanently
      const needsStorage = !generation.imageUrls?.some(url => url.includes('ensaio-fotos-prod.s3'))
      
      if (needsStorage) {
        console.log('📥 Downloading and storing permanently...')
        
        // Download image
        const response = await fetch(replicateUrl)
        if (!response.ok) throw new Error(`Download failed: ${response.status}`)
        
        const imageBuffer = Buffer.from(await response.arrayBuffer())
        console.log(`✅ Downloaded ${imageBuffer.length} bytes`)
        
        // Store in new organized structure
        const imageKey = `generated/${generation.userId}/${generation.id}_0.png`
        const thumbnailKey = `thumbnails/generated/${generation.userId}/${generation.id}_0_thumb.png`
        
        // Upload original
        await s3Client.send(new PutObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET,
          Key: imageKey,
          Body: imageBuffer,
          ContentType: 'image/png'
        }))
        
        const permanentUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${imageKey}`
        console.log(`✅ Stored permanently: ${permanentUrl}`)
        
        // Update database
        await prisma.generation.update({
          where: { id: generation.id },
          data: {
            status: 'COMPLETED',
            imageUrls: [permanentUrl],
            thumbnailUrls: [permanentUrl], // Using same for now
            completedAt: new Date(prediction.completed_at),
            processingTime: prediction.metrics?.total_time ? Math.round(prediction.metrics.total_time * 1000) : null,
            errorMessage: null
          }
        })
        
        console.log('✅ Database updated successfully!')
        
      } else if (generation.status !== 'COMPLETED') {
        console.log('📝 Updating status only...')
        
        // Just update status, images are already stored
        await prisma.generation.update({
          where: { id: generation.id },
          data: {
            status: 'COMPLETED',
            completedAt: new Date(prediction.completed_at),
            errorMessage: null
          }
        })
        
        console.log('✅ Status updated to COMPLETED!')
      } else {
        console.log('✅ Generation already completed and stored!')
      }
      
      // Verify final state
      const final = await prisma.generation.findUnique({
        where: { id: generation.id },
        select: { status: true, imageUrls: true, completedAt: true }
      })
      
      console.log('📊 Final verification:')
      console.log(`Status: ${final.status}`)
      console.log(`URLs: ${final.imageUrls?.length || 0}`)
      console.log(`Completed: ${final.completedAt}`)
      
      if (final.imageUrls?.length > 0) {
        console.log('🎉 SUCCESS! Image should now appear in gallery!')
      }
      
    } else {
      console.log('⚠️ Replicate job not succeeded or no output')
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

recoverCurrentJob()