const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkImageGeneration() {
  try {
    console.log('🔍 Checking image generation with jobId: 6wxh24r67hrma0cs84c9fsepw0')
    
    // Find the generation by jobId
    const generation = await prisma.generation.findFirst({
      where: {
        jobId: '6wxh24r67hrma0cs84c9fsepw0'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        model: {
          select: {
            id: true,
            name: true,
            class: true
          }
        }
      }
    })

    if (!generation) {
      console.log('❌ Image generation not found with that jobId')
      return
    }

    console.log('📋 Image Generation Details:')
    console.log('  ID:', generation.id)
    console.log('  User:', generation.user.name || generation.user.email)
    console.log('  Model:', generation.model.name)
    console.log('  Status:', generation.status)
    console.log('  Prompt:', generation.prompt)
    console.log('  Negative Prompt:', generation.negativePrompt || 'None')
    console.log('  Created At:', generation.createdAt)
    console.log('  Updated At:', generation.updatedAt)
    console.log('  Completed At:', generation.completedAt || 'Not completed')
    console.log('')

    console.log('📁 Storage URLs:')
    console.log('  Image URLs Count:', Array.isArray(generation.imageUrls) ? generation.imageUrls.length : 0)
    if (Array.isArray(generation.imageUrls) && generation.imageUrls.length > 0) {
      generation.imageUrls.forEach((url, index) => {
        console.log(`    Image ${index + 1}:`, url)
      })
    } else {
      console.log('    ❌ NO IMAGE URLs FOUND')
    }
    
    console.log('  Thumbnail URLs Count:', Array.isArray(generation.thumbnailUrls) ? generation.thumbnailUrls.length : 0)
    if (Array.isArray(generation.thumbnailUrls) && generation.thumbnailUrls.length > 0) {
      generation.thumbnailUrls.forEach((url, index) => {
        console.log(`    Thumbnail ${index + 1}:`, url)
      })
    } else {
      console.log('    ❌ NO THUMBNAIL URLs FOUND')
    }
    console.log('')

    console.log('⚙️ Processing Info:')
    console.log('  Job ID:', generation.jobId)
    console.log('  Error Message:', generation.errorMessage || 'None')
    console.log('  Processing Time:', generation.processingTime || 'Unknown')
    console.log('  Estimated Cost:', generation.estimatedCost || 'Unknown')
    console.log('')

    // Test URL accessibility
    if (Array.isArray(generation.imageUrls) && generation.imageUrls.length > 0) {
      console.log('🔗 Testing image URL accessibility...')
      for (const [index, url] of generation.imageUrls.entries()) {
        try {
          const response = await fetch(url, { method: 'HEAD' })
          console.log(`  Image ${index + 1}:`, response.status, response.ok ? '✅' : '❌')
          console.log(`    Content-Type:`, response.headers.get('content-type'))
          console.log(`    Content-Length:`, response.headers.get('content-length'), 'bytes')
        } catch (error) {
          console.log(`  Image ${index + 1} Error:`, error.message, '❌')
        }
      }
    }

    if (Array.isArray(generation.thumbnailUrls) && generation.thumbnailUrls.length > 0) {
      console.log('🖼️ Testing thumbnail URL accessibility...')
      for (const [index, url] of generation.thumbnailUrls.entries()) {
        try {
          const response = await fetch(url, { method: 'HEAD' })
          console.log(`  Thumbnail ${index + 1}:`, response.status, response.ok ? '✅' : '❌')
        } catch (error) {
          console.log(`  Thumbnail ${index + 1} Error:`, error.message, '❌')
        }
      }
    }

    console.log('')
    console.log('📊 Summary:')
    console.log('  Status:', generation.status)
    console.log('  Has Images:', generation.imageUrls?.length > 0 ? '✅' : '❌')
    console.log('  Has Thumbnails:', generation.thumbnailUrls?.length > 0 ? '✅' : '❌')
    console.log('  Images Count:', generation.imageUrls?.length || 0)

  } catch (error) {
    console.error('❌ Error checking image generation:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkImageGeneration()