const https = require('https')

// Simple test to check if we can access S3 URLs
async function checkS3Access() {
  console.log('🔍 Checking S3 bucket access...')
  
  // Let's check if we can list recent generations with S3 URLs
  const { PrismaClient } = require('@prisma/client')
  const prisma = new PrismaClient()
  
  try {
    const s3Generations = await prisma.generation.findMany({
      where: {
        NOT: {
          imageUrls: { equals: null }
        },
        status: 'COMPLETED',
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      },
      select: {
        id: true,
        createdAt: true,
        imageUrls: true,
        thumbnailUrls: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })
    
    console.log(`📊 Found ${s3Generations.length} completed generations with images`)
    
    for (const gen of s3Generations) {
      console.log(`\n📋 Generation: ${gen.id}`)
      console.log(`🕐 Created: ${gen.createdAt}`)
      console.log(`🖼️ Image URLs: ${gen.imageUrls?.length || 0}`)
      
      if (gen.imageUrls && gen.imageUrls.length > 0) {
        const firstUrl = gen.imageUrls[0]
        console.log(`🔗 First URL: ${firstUrl.substring(0, 100)}...`)
        
        // Check if it's S3 or temporary
        if (firstUrl.includes('amazonaws.com')) {
          console.log('✅ S3 URL detected')
        } else if (firstUrl.includes('replicate.delivery')) {
          console.log('⚠️ Temporary Replicate URL (will expire)')
        } else {
          console.log('❓ Unknown URL type')
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkS3Access()