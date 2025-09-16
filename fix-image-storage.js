const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixImageStorage() {
  console.log('🔧 Fixing image storage for generations with temporary URLs...\n')
  
  try {
    // Find generations with temporary Replicate URLs
    const generations = await prisma.generation.findMany({
      where: {
        status: 'COMPLETED',
        NOT: {
          imageUrls: { isEmpty: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })
    
    console.log(`Found ${generations.length} completed generations to check:`)
    
    let fixedCount = 0
    
    for (const gen of generations) {
      console.log(`\n📋 Generation: ${gen.id}`)
      console.log(`   Status: ${gen.status}`)
      console.log(`   Created: ${gen.createdAt}`)
      console.log(`   Images: ${gen.imageUrls.length}`)
      
      let hasTemporaryUrls = false
      
      if (Array.isArray(gen.imageUrls) && gen.imageUrls.length > 0) {
        console.log(`   🔍 Checking image URLs:`)
        
        for (let i = 0; i < gen.imageUrls.length; i++) {
          const url = gen.imageUrls[i]
          const isTemporary = url.includes('replicate.delivery') || url.includes('pbxt.replicate.delivery')
          
          console.log(`      ${i + 1}: ${isTemporary ? '⚠️  TEMPORARY' : '✅ PERMANENT'} - ${url.substring(0, 80)}...`)
          
          if (isTemporary) {
            hasTemporaryUrls = true
            
            // Test if URL is still accessible
            try {
              const response = await fetch(url, { method: 'HEAD' })
              console.log(`         Access test: ${response.ok ? '✅ Still accessible' : '❌ Already expired (404)'}`)
            } catch (error) {
              console.log(`         Access test: ❌ Error - ${error.message}`)
            }
          }
        }
      }
      
      if (hasTemporaryUrls) {
        console.log(`   🚨 This generation has temporary URLs that will/have expired!`)
        
        // If URLs are still accessible, we could try to download and store them permanently
        // For now, just count how many need fixing
        fixedCount++
      } else {
        console.log(`   ✅ This generation has permanent storage URLs`)
      }
      
      console.log('   ─'.repeat(50))
    }
    
    console.log(`\n📊 Summary:`)
    console.log(`   Total generations checked: ${generations.length}`)
    console.log(`   Generations with temporary URLs: ${fixedCount}`)
    console.log(`   Generations with permanent URLs: ${generations.length - fixedCount}`)
    
    if (fixedCount > 0) {
      console.log(`\n💡 Recommendations:`)
      console.log(`   1. Verify webhook is configured in Replicate dashboard`)
      console.log(`   2. Check webhook endpoint: POST ${process.env.NEXTAUTH_URL}/api/webhooks/generation`)
      console.log(`   3. Verify AWS S3 credentials are correct`)
      console.log(`   4. Check server logs during image generation`)
      console.log(`   5. Test storage provider configuration`)
    }
    
  } catch (error) {
    console.error('❌ Error checking image storage:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

fixImageStorage()