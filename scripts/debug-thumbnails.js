const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function debugThumbnails() {
  try {
    console.log('🔍 Debugging thumbnail issues...\n')
    
    // Get recent generations with completed status
    const recentGenerations = await prisma.generation.findMany({
      where: {
        status: 'COMPLETED',
      },
      select: {
        id: true,
        createdAt: true,
        status: true,
        imageUrls: true,
        thumbnailUrls: true,
        errorMessage: true,
        prompt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })

    console.log(`Found ${recentGenerations.length} recent completed generations:\n`)

    recentGenerations.forEach((gen, index) => {
      console.log(`${index + 1}. Generation ID: ${gen.id}`)
      console.log(`   Created: ${gen.createdAt}`)
      console.log(`   Status: ${gen.status}`)
      console.log(`   Prompt: ${gen.prompt?.substring(0, 50)}...`)
      console.log(`   Image URLs: ${gen.imageUrls?.length || 0} items`)
      console.log(`   Thumbnail URLs: ${gen.thumbnailUrls?.length || 0} items`)
      
      if (gen.imageUrls?.length > 0) {
        console.log(`   Sample Image URL: ${gen.imageUrls[0]?.substring(0, 60)}...`)
      }
      
      if (gen.thumbnailUrls?.length > 0) {
        console.log(`   Sample Thumbnail URL: ${gen.thumbnailUrls[0]?.substring(0, 60)}...`)
      } else {
        console.log(`   ⚠️  NO THUMBNAIL URLS FOUND`)
      }
      
      if (gen.errorMessage) {
        console.log(`   Error: ${gen.errorMessage}`)
      }
      
      console.log('')
    })

    // Check if thumbnails are same as images (fallback case)
    const sameUrlGenerations = recentGenerations.filter(gen => 
      gen.imageUrls?.length > 0 && 
      gen.thumbnailUrls?.length > 0 &&
      gen.imageUrls[0] === gen.thumbnailUrls[0]
    )

    if (sameUrlGenerations.length > 0) {
      console.log(`⚠️  Found ${sameUrlGenerations.length} generations where thumbnail URLs are same as image URLs (fallback mode)`)
    }

    // Check if any have missing thumbnails
    const missingThumbnails = recentGenerations.filter(gen => 
      gen.imageUrls?.length > 0 && 
      (!gen.thumbnailUrls || gen.thumbnailUrls.length === 0)
    )

    if (missingThumbnails.length > 0) {
      console.log(`❌ Found ${missingThumbnails.length} generations with missing thumbnail URLs`)
      missingThumbnails.forEach(gen => {
        console.log(`   - ${gen.id}: ${gen.imageUrls?.length} images, ${gen.thumbnailUrls?.length || 0} thumbnails`)
      })
    }

  } catch (error) {
    console.error('Error debugging thumbnails:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugThumbnails()