const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkTotalGenerations() {
  try {
    console.log('🔍 Checking total generations...')
    
    // Count all generations by status
    const statusCounts = await prisma.generation.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    })

    console.log('\n📊 Generations by status:')
    statusCounts.forEach(status => {
      console.log(`   ${status.status}: ${status._count.status}`)
    })

    // Total count
    const totalCount = await prisma.generation.count()
    console.log(`\n📋 Total generations: ${totalCount}`)
    
    // Calculate pages with limit 20
    const limit = 20
    const pages = Math.ceil(totalCount / limit)
    console.log(`📄 Pages needed (limit ${limit}): ${pages}`)

    // Recent generations (last 30 days)
    const recentCount = await prisma.generation.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    })

    console.log(`🕐 Recent generations (30 days): ${recentCount}`)

    // With images
    const withImages = await prisma.generation.count({
      where: {
        NOT: {
          imageUrls: { equals: null }
        }
      }
    })

    console.log(`🖼️ Generations with images: ${withImages}`)

    // Sample of oldest generations
    console.log('\n📅 Oldest generations:')
    const oldest = await prisma.generation.findMany({
      orderBy: {
        createdAt: 'asc'
      },
      take: 5,
      select: {
        id: true,
        createdAt: true,
        status: true,
        prompt: true
      }
    })

    oldest.forEach((gen, index) => {
      console.log(`   ${index + 1}. ${gen.createdAt} - ${gen.status} - ${gen.prompt?.substring(0, 50) || 'No prompt'}...`)
    })

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkTotalGenerations()