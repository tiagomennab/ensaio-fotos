const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixStuckGenerations() {
  try {
    console.log('🔍 Searching for stuck generations...')

    // Find generations stuck in PROCESSING for more than 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000)

    const stuckGenerations = await prisma.generation.findMany({
      where: {
        status: 'PROCESSING',
        createdAt: {
          lt: tenMinutesAgo
        }
      },
      select: {
        id: true,
        jobId: true,
        createdAt: true,
        prompt: true,
        userId: true
      }
    })

    console.log(`📋 Found ${stuckGenerations.length} stuck generations`)

    if (stuckGenerations.length === 0) {
      console.log('✅ No stuck generations found!')
      return
    }

    // Display details of stuck generations
    for (const gen of stuckGenerations) {
      const minutesStuck = Math.round((Date.now() - gen.createdAt.getTime()) / (1000 * 60))
      console.log(`  📌 ${gen.id} (${gen.jobId}) - ${minutesStuck}min ago - "${gen.prompt.substring(0, 50)}..."`)
    }

    console.log('\n🛠️  Fixing stuck generations...')

    // Update all stuck generations to FAILED
    const updateResult = await prisma.generation.updateMany({
      where: {
        status: 'PROCESSING',
        createdAt: {
          lt: tenMinutesAgo
        }
      },
      data: {
        status: 'FAILED',
        errorMessage: 'Generation timeout - marked as failed after being stuck in PROCESSING for more than 10 minutes. This may be due to AI provider issues.',
        completedAt: new Date(),
        updatedAt: new Date()
      }
    })

    console.log(`✅ Updated ${updateResult.count} generations to FAILED status`)

    // Verify the fix
    const remainingStuck = await prisma.generation.count({
      where: {
        status: 'PROCESSING',
        createdAt: {
          lt: tenMinutesAgo
        }
      }
    })

    if (remainingStuck === 0) {
      console.log('🎉 All stuck generations have been resolved!')
    } else {
      console.log(`⚠️  Still ${remainingStuck} stuck generations remaining`)
    }

    // Show current processing status
    const currentProcessing = await prisma.generation.count({
      where: {
        status: 'PROCESSING'
      }
    })

    console.log(`📊 Current generations in PROCESSING: ${currentProcessing}`)

  } catch (error) {
    console.error('❌ Error fixing stuck generations:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the fix
fixStuckGenerations()