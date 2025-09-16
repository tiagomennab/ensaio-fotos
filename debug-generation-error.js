const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function debugGenerationError() {
  try {
    console.log('🔍 Checking recent generation attempts...')
    
    // Look for recent generations or errors in SystemLog
    const recentLogs = await prisma.systemLog.findMany({
      where: {
        OR: [
          { level: 'ERROR' },
          { message: { contains: 'generation' } },
          { message: { contains: 'AI' } },
          { message: { contains: 'replicate' } }
        ],
        createdAt: {
          gte: new Date(Date.now() - 60 * 60 * 1000) // Last hour
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })

    console.log(`📝 Found ${recentLogs.length} recent relevant logs:`)
    
    recentLogs.forEach(log => {
      console.log(`\n[${log.createdAt}] ${log.level}`)
      console.log(`${log.message}`)
      if (log.metadata) {
        console.log(`Metadata: ${JSON.stringify(log.metadata, null, 2)}`)
      }
    })

    // Check for recent failed generations
    const recentFailedGenerations = await prisma.generation.findMany({
      where: {
        status: 'FAILED',
        createdAt: {
          gte: new Date(Date.now() - 60 * 60 * 1000) // Last hour
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5,
      select: {
        id: true,
        createdAt: true,
        errorMessage: true,
        jobId: true,
        prompt: true
      }
    })

    console.log(`\n❌ Recent failed generations: ${recentFailedGenerations.length}`)
    recentFailedGenerations.forEach(gen => {
      console.log(`\n📋 Generation: ${gen.id}`)
      console.log(`🕐 Created: ${gen.createdAt}`)
      console.log(`💬 Prompt: ${gen.prompt?.substring(0, 50)}...`)
      console.log(`🆔 Job ID: ${gen.jobId || 'null'}`)
      console.log(`❌ Error: ${gen.errorMessage || 'No error message'}`)
    })

  } catch (error) {
    console.error('❌ Error debugging:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugGenerationError()