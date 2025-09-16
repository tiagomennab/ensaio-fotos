const { PrismaClient } = require('@prisma/client')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const prisma = new PrismaClient()

async function fixVideoSchema() {
  try {
    console.log('🔧 Checking video_generation table structure...')

    // Check if storageProvider column exists
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'video_generations'
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `

    console.log('📋 Current columns:')
    result.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`)
    })

    // Check if storageProvider exists
    const hasStorageProvider = result.some(col => col.column_name === 'storageProvider')

    if (!hasStorageProvider) {
      console.log('\n⚠️ storageProvider column missing, adding it...')

      try {
        await prisma.$queryRaw`
          ALTER TABLE video_generations
          ADD COLUMN "storageProvider" TEXT;
        `
        console.log('✅ Added storageProvider column successfully')
      } catch (addError) {
        console.error('❌ Failed to add storageProvider column:', addError.message)
      }
    } else {
      console.log('\n✅ storageProvider column already exists')
    }

    // Test a simple query
    console.log('\n🧪 Testing video query...')
    const videoCount = await prisma.videoGeneration.count()
    console.log(`📊 Total videos in database: ${videoCount}`)

    if (videoCount > 0) {
      const sampleVideo = await prisma.videoGeneration.findFirst({
        select: {
          id: true,
          prompt: true,
          status: true,
          videoUrl: true,
          createdAt: true
        }
      })
      console.log('📹 Sample video:', JSON.stringify(sampleVideo, null, 2))
    }

  } catch (error) {
    console.error('❌ Error checking video schema:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the check
fixVideoSchema()