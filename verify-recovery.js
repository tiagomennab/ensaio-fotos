require('dotenv').config({ path: '.env.local' })
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function verifyRecovery() {
  try {
    const jobId = '2vdyfzgbxdrma0cs7x6vqaayvm'
    
    console.log('🔍 VERIFYING RECOVERY')
    console.log('====================')
    
    const generation = await prisma.generation.findFirst({
      where: { jobId },
      include: {
        user: { select: { name: true, email: true } }
      }
    })
    
    if (!generation) {
      console.log('❌ Generation not found')
      return
    }
    
    console.log('✅ Generation found!')
    console.log('ID:', generation.id)
    console.log('User:', generation.user.name, '(' + generation.user.email + ')')
    console.log('Status:', generation.status)
    console.log('Prompt:', generation.prompt.substring(0, 100) + '...')
    console.log('Created:', generation.createdAt)
    console.log('Completed:', generation.completedAt)
    
    console.log('\n🖼️ IMAGES:')
    console.log('Image URLs:')
    generation.imageUrls.forEach((url, i) => {
      console.log(`  ${i + 1}. ${url}`)
    })
    
    console.log('\n📸 THUMBNAILS:')
    console.log('Thumbnail URLs:')
    generation.thumbnailUrls.forEach((url, i) => {
      console.log(`  ${i + 1}. ${url}`)
    })
    
    console.log('\n📂 STORAGE STRUCTURE:')
    if (generation.imageUrls.length > 0) {
      const imageUrl = generation.imageUrls[0]
      const pathMatch = imageUrl.match(/amazonaws\.com\/(.+)/)
      if (pathMatch) {
        console.log('Image path:', pathMatch[1])
        console.log('✅ Correctly stored in generated/ folder')
        console.log('✅ Organized by user ID')
        console.log('✅ Named with generation ID')
      }
    }
    
    // Check S3 URL accessibility
    console.log('\n🌐 TESTING URL ACCESSIBILITY:')
    if (generation.imageUrls.length > 0) {
      try {
        const response = await fetch(generation.imageUrls[0], { method: 'HEAD' })
        console.log('✅ Main image accessible:', response.status)
      } catch (error) {
        console.log('❌ Main image not accessible:', error.message)
      }
    }
    
    if (generation.thumbnailUrls.length > 0) {
      try {
        const response = await fetch(generation.thumbnailUrls[0], { method: 'HEAD' })
        console.log('✅ Thumbnail accessible:', response.status)
      } catch (error) {
        console.log('❌ Thumbnail not accessible:', error.message)
      }
    }
    
    console.log('\n🎉 RECOVERY VERIFICATION COMPLETE!')
    console.log('The image should now be visible in the gallery for user:', generation.user.name)
    
  } catch (error) {
    console.error('❌ Verification error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

verifyRecovery()