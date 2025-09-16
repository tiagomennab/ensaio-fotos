const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function debugRecentGenerations() {
  try {
    console.log('🔍 Debugging recent generations...')
    
    // Get recent generations
    const generations = await prisma.generation.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        model: {
          select: { name: true }
        }
      }
    })
    
    console.log(`\n📊 Found ${generations.length} recent generations:`)
    
    for (const gen of generations) {
      console.log(`\n--- Generation ${gen.id} ---`)
      console.log(`Status: ${gen.status}`)
      console.log(`Created: ${gen.createdAt}`)
      console.log(`Completed: ${gen.completedAt || 'Not completed'}`)
      console.log(`Model: ${gen.model?.name || 'Unknown'}`)
      console.log(`Prompt: ${gen.prompt?.substring(0, 100)}...`)
      console.log(`JobId: ${gen.jobId || 'No job ID'}`)
      console.log(`Image URLs: ${gen.imageUrls?.length || 0} URLs`)
      
      if (gen.imageUrls?.length > 0) {
        gen.imageUrls.forEach((url, i) => {
          console.log(`  ${i + 1}. ${url.substring(0, 100)}...`)
        })
      }
      
      console.log(`Thumbnail URLs: ${gen.thumbnailUrls?.length || 0} URLs`)
      console.log(`Error: ${gen.errorMessage || 'None'}`)
      console.log(`Processing time: ${gen.processingTime || 'Unknown'}ms`)
    }
    
    // Check for failed generations
    const failedGenerations = await prisma.generation.findMany({
      where: {
        status: 'FAILED',
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      take: 5
    })
    
    if (failedGenerations.length > 0) {
      console.log(`\n❌ Found ${failedGenerations.length} failed generations in last 24h:`)
      failedGenerations.forEach(gen => {
        console.log(`- ${gen.id}: ${gen.errorMessage}`)
      })
    }
    
    // Check for processing generations
    const processingGenerations = await prisma.generation.findMany({
      where: {
        status: 'PROCESSING'
      },
      take: 5
    })
    
    if (processingGenerations.length > 0) {
      console.log(`\n⏳ Found ${processingGenerations.length} still processing generations:`)
      processingGenerations.forEach(gen => {
        console.log(`- ${gen.id}: Created ${gen.createdAt}, JobId: ${gen.jobId}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugRecentGenerations()
