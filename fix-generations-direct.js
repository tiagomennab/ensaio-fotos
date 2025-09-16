const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixGenerationsDirectly() {
  try {
    console.log('🔄 Processing known completed generations...')
    
    const completedJobs = [
      {
        jobId: '2w0z33mrbhrmc0cs7jksktt0d4',
        output: ['https://replicate.delivery/xezq/rKQ3REO7XQJXJNkeOzTfelDEwb8mJxtMThX9ReCFGJdGncRVB/out-0.png'],
        completedAt: '2025-09-12T06:40:49.542391073Z'
      },
      {
        jobId: 'ag9zg4nhn9rmc0cs7jh8q57ya8',
        output: ['https://replicate.delivery/xezq/ZfG7YXVxpeoooEpZ5HUutCQOaiKdzlpZ8pssOoVyjYowEXUVA/out-0.jpg'],
        completedAt: '2025-09-12T06:35:28.058260267Z'
      }
    ]

    for (const job of completedJobs) {
      console.log(`\n🔍 Processing job: ${job.jobId}`)
      
      // Find the generation
      const generation = await prisma.generation.findFirst({
        where: {
          jobId: job.jobId
        }
      })

      if (!generation) {
        console.log(`   ❌ Generation not found for job ${job.jobId}`)
        continue
      }

      console.log(`   📋 Found generation: ${generation.id}`)
      console.log(`   📊 Current status: ${generation.status}`)

      if (generation.status === 'COMPLETED') {
        console.log(`   ✅ Already completed, skipping`)
        continue
      }

      // Update the generation directly
      try {
        await prisma.generation.update({
          where: {
            id: generation.id
          },
          data: {
            status: 'COMPLETED',
            imageUrls: job.output,
            thumbnailUrls: job.output, // Use same URLs for now
            completedAt: new Date(job.completedAt),
            processingTime: Math.floor((new Date(job.completedAt) - generation.createdAt) / 1000) * 1000
          }
        })

        console.log(`   ✅ Updated generation to COMPLETED`)
        console.log(`   🖼️ Image URLs: ${job.output.length} images`)
        
      } catch (error) {
        console.log(`   ❌ Error updating generation: ${error.message}`)
      }
    }

    // Mark other old processing generations as failed
    console.log('\n🔄 Marking old stuck generations as FAILED...')
    
    const oldDate = new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
    
    const result = await prisma.generation.updateMany({
      where: {
        status: 'PROCESSING',
        createdAt: {
          lte: oldDate
        }
      },
      data: {
        status: 'FAILED',
        errorMessage: 'Generation timeout - processed by cleanup script',
        completedAt: new Date()
      }
    })

    console.log(`✅ Marked ${result.count} old generations as FAILED`)

    console.log('\n📊 Final summary:')
    const stats = await prisma.generation.groupBy({
      by: ['status'],
      _count: {
        status: true
      },
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    })

    stats.forEach(stat => {
      console.log(`   ${stat.status}: ${stat._count.status}`)
    })

  } catch (error) {
    console.error('❌ Error in fixGenerationsDirectly:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixGenerationsDirectly()