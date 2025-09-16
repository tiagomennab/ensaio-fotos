const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function debugUpscaleImages() {
  console.log('🔍 Debugging upscale image storage issues...\n')
  
  try {
    // Find recent upscale generations
    const upscaleGenerations = await prisma.generation.findMany({
      where: {
        prompt: {
          startsWith: '[UPSCALED]'
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5,
      select: {
        id: true,
        jobId: true,
        status: true,
        createdAt: true,
        completedAt: true,
        imageUrls: true,
        thumbnailUrls: true,
        errorMessage: true,
        prompt: true,
        user: {
          select: {
            id: true,
            email: true
          }
        }
      }
    })
    
    console.log(`Found ${upscaleGenerations.length} recent upscale generations:`)
    
    for (const gen of upscaleGenerations) {
      console.log(`\n📋 Generation ID: ${gen.id}`)
      console.log(`   Job ID: ${gen.jobId}`)
      console.log(`   Status: ${gen.status}`)
      console.log(`   Created: ${gen.createdAt}`)
      console.log(`   Completed: ${gen.completedAt}`)
      console.log(`   User: ${gen.user.email}`)
      console.log(`   Images: ${Array.isArray(gen.imageUrls) ? gen.imageUrls.length : 0}`)
      console.log(`   Thumbnails: ${Array.isArray(gen.thumbnailUrls) ? gen.thumbnailUrls.length : 0}`)
      console.log(`   Error: ${gen.errorMessage || 'None'}`)
      
      if (Array.isArray(gen.imageUrls) && gen.imageUrls.length > 0) {
        console.log(`   📸 Image URLs:`)
        gen.imageUrls.forEach((url, i) => {
          console.log(`      ${i + 1}: ${url}`)
        })
        
        // Test image accessibility
        console.log(`   🔍 Testing image accessibility...`)
        for (let i = 0; i < Math.min(gen.imageUrls.length, 2); i++) {
          try {
            const response = await fetch(gen.imageUrls[i], { method: 'HEAD' })
            console.log(`      Image ${i + 1}: ${response.ok ? '✅ Accessible' : `❌ ${response.status} ${response.statusText}`}`)
          } catch (error) {
            console.log(`      Image ${i + 1}: ❌ Error - ${error.message}`)
          }
        }
      }
      
      console.log('   ─'.repeat(50))
    }
    
    // Check webhook events
    console.log('\n🔗 Checking recent webhook events...')
    // Note: This would require a webhook_events table if it exists
    // For now, we'll just show what we found above
    
    console.log('\n💡 Troubleshooting suggestions:')
    console.log('1. Check if webhook is properly configured in Replicate dashboard')
    console.log('2. Verify AWS S3 credentials and bucket permissions')
    console.log('3. Check if webhook endpoint is accessible: POST /api/webhooks/generation')
    console.log('4. Look at server logs during upscale processing')
    console.log('5. Verify STORAGE_PROVIDER is set to "aws" in .env.local')
    
  } catch (error) {
    console.error('❌ Error debugging upscale images:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugUpscaleImages()