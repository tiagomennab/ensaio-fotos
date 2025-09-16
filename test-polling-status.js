const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testPollingStatus() {
  try {
    console.log('🔍 Testing polling and auto-storage status...')

    // Check for recent generations that should be processed
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)

    const recentGenerations = await prisma.generation.findMany({
      where: {
        createdAt: { gte: fiveMinutesAgo }
      },
      select: {
        id: true,
        jobId: true,
        status: true,
        imageUrls: true,
        createdAt: true,
        updatedAt: true,
        prompt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    console.log(`\n📊 Found ${recentGenerations.length} recent generations (last 5 minutes)`)

    if (recentGenerations.length > 0) {
      console.log('\n📋 Recent generations:')
      recentGenerations.forEach(gen => {
        const minutesAgo = Math.round((Date.now() - gen.createdAt.getTime()) / (1000 * 60))
        const hasImages = gen.imageUrls && gen.imageUrls.length > 0
        console.log(`  • ${gen.id} | ${gen.status} | ${hasImages ? `${gen.imageUrls.length} imgs` : 'No images'} | ${minutesAgo}min ago`)
        if (gen.imageUrls && gen.imageUrls.length > 0) {
          console.log(`    First URL: ${gen.imageUrls[0]}`)
        }
      })
    }

    // Check for PROCESSING generations that should be handled by polling
    const processingGenerations = await prisma.generation.findMany({
      where: {
        status: 'PROCESSING'
      },
      select: {
        id: true,
        jobId: true,
        createdAt: true,
        prompt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    console.log(`\n⏳ Currently PROCESSING generations: ${processingGenerations.length}`)
    if (processingGenerations.length > 0) {
      processingGenerations.forEach(gen => {
        const minutesAgo = Math.round((Date.now() - gen.createdAt.getTime()) / (1000 * 60))
        console.log(`  • ${gen.id} (${gen.jobId}) - ${minutesAgo}min ago`)
      })
    }

    // Check for completed generations with image URLs that contain S3 paths
    const completedWithS3 = await prisma.generation.count({
      where: {
        status: 'COMPLETED',
        imageUrls: {
          hasSome: ['generated/']
        },
        createdAt: { gte: fiveMinutesAgo }
      }
    })

    console.log(`\n✅ Recent completed with S3 URLs: ${completedWithS3}`)

    // Environment check
    console.log('\n🔧 Environment:')
    console.log(`  NODE_ENV: ${process.env.NODE_ENV}`)
    console.log(`  STORAGE_PROVIDER: ${process.env.STORAGE_PROVIDER}`)
    console.log(`  AI_PROVIDER: ${process.env.AI_PROVIDER}`)

    console.log('\n💡 To test polling:')
    console.log('1. Start the dev server: npm run dev')
    console.log('2. The AutoStorageProvider should auto-start the polling')
    console.log('3. Create a generation via the UI')
    console.log('4. Check if the generation gets processed and images saved to S3')

  } catch (error) {
    console.error('❌ Error testing polling status:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
testPollingStatus()