const { PrismaClient } = require('@prisma/client')
const Replicate = require('replicate')

const prisma = new PrismaClient()

async function debugSpecificJob() {
  try {
    const jobId = '94zq23hxssrma0cs9d08p4kvjg'
    console.log(`🔍 Debugging job: ${jobId}`)

    // Get generation from database
    const generation = await prisma.generation.findFirst({
      where: { jobId },
      select: {
        id: true,
        jobId: true,
        status: true,
        imageUrls: true,
        createdAt: true,
        updatedAt: true,
        prompt: true,
        userId: true
      }
    })

    if (!generation) {
      console.log('❌ Generation not found in database')
      return
    }

    console.log('\n📋 Database record:')
    console.log(`  ID: ${generation.id}`)
    console.log(`  JobID: ${generation.jobId}`)
    console.log(`  Status: ${generation.status}`)
    console.log(`  Created: ${generation.createdAt}`)
    console.log(`  Updated: ${generation.updatedAt}`)
    console.log(`  Images: ${generation.imageUrls?.length || 0}`)
    console.log(`  Prompt: ${generation.prompt?.substring(0, 100)}...`)

    // Check with Replicate API
    if (process.env.REPLICATE_API_TOKEN) {
      console.log('\n🔗 Checking with Replicate API...')

      const replicate = new Replicate({
        auth: process.env.REPLICATE_API_TOKEN
      })

      try {
        const prediction = await replicate.predictions.get(jobId)

        console.log('\n📡 Replicate status:')
        console.log(`  Status: ${prediction.status}`)
        console.log(`  Created: ${prediction.created_at}`)
        console.log(`  Started: ${prediction.started_at}`)
        console.log(`  Completed: ${prediction.completed_at}`)

        if (prediction.error) {
          console.log(`  Error: ${prediction.error}`)
        }

        if (prediction.output) {
          console.log(`  Output type: ${typeof prediction.output}`)
          console.log(`  Output: ${JSON.stringify(prediction.output, null, 2)}`)
        }

        if (prediction.metrics) {
          console.log(`  Metrics: ${JSON.stringify(prediction.metrics, null, 2)}`)
        }

        // Show what the auto-storage should do
        if (prediction.status === 'succeeded' && prediction.output) {
          console.log('\n✅ This job should be processed by auto-storage!')
          console.log('Expected behavior:')
          console.log('1. Download images from temporary URLs')
          console.log('2. Save to S3: generated/{userId}/{generationId}/')
          console.log('3. Update database with permanent URLs')
        }

      } catch (replicateError) {
        console.error('❌ Error checking with Replicate:', replicateError.message)
      }
    } else {
      console.log('⚠️ REPLICATE_API_TOKEN not set, cannot check with API')
    }

  } catch (error) {
    console.error('❌ Error debugging job:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the debug
debugSpecificJob()