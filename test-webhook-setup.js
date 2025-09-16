const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testWebhookSetup() {
  try {
    console.log('🔍 Testing webhook configuration...')

    // Check environment variables
    console.log('\n📋 Environment check:')
    console.log(`✓ NEXTAUTH_URL: ${process.env.NEXTAUTH_URL || 'NOT SET'}`)
    console.log(`✓ REPLICATE_WEBHOOK_SECRET: ${process.env.REPLICATE_WEBHOOK_SECRET ? 'SET' : 'NOT SET'}`)
    console.log(`✓ AI_PROVIDER: ${process.env.AI_PROVIDER || 'NOT SET'}`)

    // Expected webhook URLs
    const baseUrl = process.env.NEXTAUTH_URL
    const webhookUrls = {
      generation: `${baseUrl}/api/webhooks/generation`,
      training: `${baseUrl}/api/webhooks/training`,
      upscale: `${baseUrl}/api/webhooks/upscale`,
      video: `${baseUrl}/api/webhooks/video`
    }

    console.log('\n🎯 Expected webhook URLs:')
    Object.entries(webhookUrls).forEach(([type, url]) => {
      console.log(`  ${type}: ${url}`)
    })

    // Check for recent generations that might be stuck
    console.log('\n🔍 Checking for recent stuck generations...')
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)

    const stuckGenerations = await prisma.generation.findMany({
      where: {
        status: 'PROCESSING',
        createdAt: { gte: oneHourAgo }
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

    if (stuckGenerations.length > 0) {
      console.log(`⚠️  Found ${stuckGenerations.length} recent stuck generations:`)
      stuckGenerations.forEach(gen => {
        const minutesAgo = Math.round((Date.now() - gen.createdAt.getTime()) / (1000 * 60))
        console.log(`  📌 ${gen.id} (${gen.jobId}) - ${minutesAgo}min ago`)
      })
    } else {
      console.log('✅ No recent stuck generations found')
    }

    // Check for generations completed in last hour (webhook success indicator)
    const completedGenerations = await prisma.generation.count({
      where: {
        status: 'COMPLETED',
        completedAt: { gte: oneHourAgo }
      }
    })

    console.log(`\n📊 Generations completed in last hour: ${completedGenerations}`)

    // Check webhook URL validation
    console.log('\n🔐 Webhook URL validation:')
    if (!baseUrl) {
      console.log('❌ NEXTAUTH_URL not set - webhooks will not work')
    } else if (!baseUrl.startsWith('https://')) {
      console.log('⚠️  NEXTAUTH_URL is not HTTPS - webhooks may not work in production')
    } else {
      console.log('✅ NEXTAUTH_URL is properly configured for webhooks')
    }

    // Webhook endpoint accessibility test
    console.log('\n🌐 Testing webhook endpoint accessibility...')
    try {
      const testUrl = `${baseUrl}/api/health`
      const response = await fetch(testUrl)
      if (response.ok) {
        console.log('✅ Base API is accessible')
      } else {
        console.log(`⚠️  API returned status ${response.status}`)
      }
    } catch (error) {
      console.log(`❌ Could not reach API: ${error.message}`)
    }

    console.log('\n🎯 Recommendations:')
    if (stuckGenerations.length > 0) {
      console.log('1. Run fix-stuck-generations-final.js to resolve stuck generations')
    }
    if (!process.env.REPLICATE_WEBHOOK_SECRET) {
      console.log('2. Set REPLICATE_WEBHOOK_SECRET for webhook security')
    }
    if (completedGenerations === 0 && stuckGenerations.length > 0) {
      console.log('3. Webhooks may not be working - check Replicate webhook configuration')
    }
    if (baseUrl && baseUrl.startsWith('https://')) {
      console.log('4. Webhook URLs are properly configured for production')
    }

  } catch (error) {
    console.error('❌ Error testing webhook setup:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
testWebhookSetup()