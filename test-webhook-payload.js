const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testWebhookPayload() {
  try {
    console.log('🔍 Testing webhook payload structure and recent generations...')
    
    // Get the most recent generation to see its state
    const recentGen = await prisma.generation.findFirst({
      orderBy: { createdAt: 'desc' },
      include: {
        model: { select: { name: true } }
      }
    })
    
    if (!recentGen) {
      console.log('❌ No generations found')
      return
    }
    
    console.log(`\n📊 Most Recent Generation: ${recentGen.id}`)
    console.log(`Status: ${recentGen.status}`)
    console.log(`Created: ${recentGen.createdAt}`)
    console.log(`JobId: ${recentGen.jobId}`)
    console.log(`Image URLs: ${recentGen.imageUrls?.length || 0}`)
    console.log(`Thumbnail URLs: ${recentGen.thumbnailUrls?.length || 0}`)
    console.log(`Error: ${recentGen.errorMessage || 'None'}`)
    
    if (recentGen.imageUrls?.length > 0) {
      console.log('\n🖼️ Image URLs:')
      recentGen.imageUrls.forEach((url, i) => {
        console.log(`  ${i + 1}. ${url}`)
      })
    }
    
    // Check if it's a temporary Replicate URL that should be downloaded
    if (recentGen.imageUrls?.length > 0) {
      const firstUrl = recentGen.imageUrls[0]
      const isReplicateUrl = firstUrl.includes('replicate.delivery') || firstUrl.includes('pbxt.replicate.delivery')
      
      console.log(`\n🔍 URL Analysis:`)
      console.log(`Is Replicate temporary URL: ${isReplicateUrl}`)
      console.log(`Should be downloaded and stored: ${isReplicateUrl ? 'YES' : 'NO'}`)
      
      // Test if the URL is still accessible
      if (isReplicateUrl) {
        try {
          console.log('\n🌐 Testing URL accessibility...')
          const controller = new AbortController()
          setTimeout(() => controller.abort(), 5000)
          
          const response = await fetch(firstUrl, { 
            method: 'HEAD',
            signal: controller.signal 
          })
          
          console.log(`URL Status: ${response.status} ${response.statusText}`)
          console.log(`Content-Type: ${response.headers.get('content-type') || 'Unknown'}`)
          console.log(`Content-Length: ${response.headers.get('content-length') || 'Unknown'}`)
          
          if (response.status === 200) {
            console.log('✅ URL is accessible - webhook should have processed this')
          } else {
            console.log('❌ URL not accessible - may have expired')
          }
        } catch (error) {
          console.log(`❌ URL test failed: ${error.message}`)
        }
      }
    }
    
    // Check for any failed webhook processing
    const processingGenerations = await prisma.generation.findMany({
      where: {
        status: 'PROCESSING',
        createdAt: {
          lt: new Date(Date.now() - 10 * 60 * 1000) // Older than 10 minutes
        }
      },
      take: 3
    })
    
    if (processingGenerations.length > 0) {
      console.log(`\n⚠️ Found ${processingGenerations.length} stale PROCESSING generations:`)
      processingGenerations.forEach(gen => {
        const ageMinutes = Math.round((Date.now() - gen.createdAt.getTime()) / 60000)
        console.log(`- ${gen.id}: ${ageMinutes} minutes old, JobId: ${gen.jobId}`)
      })
    }
    
    // Environment check
    console.log(`\n🔧 Environment Check:`)
    console.log(`STORAGE_PROVIDER: ${process.env.STORAGE_PROVIDER || 'Not set'}`)
    console.log(`AI_PROVIDER: ${process.env.AI_PROVIDER || 'Not set'}`)
    console.log(`AWS_S3_BUCKET: ${process.env.AWS_S3_BUCKET ? 'Set' : 'Not set'}`)
    console.log(`REPLICATE_WEBHOOK_SECRET: ${process.env.REPLICATE_WEBHOOK_SECRET ? 'Set' : 'Not set'}`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testWebhookPayload()