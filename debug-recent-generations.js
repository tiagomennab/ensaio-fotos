const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function debugRecentGenerations() {
  try {
    console.log('🔍 Investigating recent generations...')
    
    // Get the 10 most recent generations
    const recentGenerations = await prisma.generation.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: 10,
      select: {
        id: true,
        status: true,
        createdAt: true,
        completedAt: true,
        imageUrls: true,
        thumbnailUrls: true,
        // storageProvider: true,
        // storageBucket: true,
        // storageKeys: true,
        // publicUrl: true,
        errorMessage: true,
        jobId: true,
        user: {
          select: {
            email: true
          }
        }
      }
    })

    console.log(`📊 Found ${recentGenerations.length} recent generations`)
    console.log('=' * 80)

    recentGenerations.forEach((gen, index) => {
      console.log(`\n${index + 1}. Generation ID: ${gen.id}`)
      console.log(`   Job ID: ${gen.jobId}`)
      console.log(`   Status: ${gen.status}`)
      console.log(`   User: ${gen.user.email}`)
      console.log(`   Created: ${gen.createdAt}`)
      console.log(`   Completed: ${gen.completedAt}`)
      // console.log(`   Storage Provider: ${gen.storageProvider || 'null'}`)
      // console.log(`   Storage Bucket: ${gen.storageBucket || 'null'}`)
      // console.log(`   Storage Keys: ${gen.storageKeys ? JSON.stringify(gen.storageKeys) : 'null'}`)
      // console.log(`   Public URL: ${gen.publicUrl || 'null'}`)
      console.log(`   Image URLs Count: ${gen.imageUrls ? gen.imageUrls.length : 0}`)
      console.log(`   Thumbnail URLs Count: ${gen.thumbnailUrls ? gen.thumbnailUrls.length : 0}`)
      
      if (gen.imageUrls && gen.imageUrls.length > 0) {
        console.log(`   First Image URL: ${gen.imageUrls[0].substring(0, 100)}...`)
        
        // Check if URL contains S3 or is temporary
        if (gen.imageUrls[0].includes('amazonaws.com')) {
          console.log(`   ✅ Appears to be S3 URL`)
        } else if (gen.imageUrls[0].includes('replicate.delivery') || gen.imageUrls[0].includes('pbxt.replicate.delivery')) {
          console.log(`   ⚠️  Appears to be temporary Replicate URL`)
        } else {
          console.log(`   ❓ Unknown URL type`)
        }
      }
      
      if (gen.errorMessage) {
        console.log(`   Error: ${gen.errorMessage}`)
      }
    })

    // Check for processing generations
    const processingCount = await prisma.generation.count({
      where: {
        status: 'PROCESSING',
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    })

    console.log(`\n📋 Processing generations in last 24h: ${processingCount}`)

    // Check for failed generations
    const failedCount = await prisma.generation.count({
      where: {
        status: 'FAILED',
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    })

    console.log(`❌ Failed generations in last 24h: ${failedCount}`)

    // Check recent system logs for storage errors
    console.log('\n🔍 Checking recent system logs for storage errors...')
    const recentLogs = await prisma.systemLog.findMany({
      where: {
        OR: [
          { message: { contains: 'storage' } },
          { message: { contains: 'S3' } },
          { message: { contains: 'download' } },
          { message: { contains: 'upload' } }
        ],
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20
    })

    if (recentLogs.length > 0) {
      console.log(`📝 Found ${recentLogs.length} storage-related logs:`)
      recentLogs.forEach(log => {
        console.log(`   ${log.createdAt}: ${log.level} - ${log.message}`)
      })
    } else {
      console.log('📝 No storage-related logs found in system logs')
    }

  } catch (error) {
    console.error('❌ Error investigating generations:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugRecentGenerations()