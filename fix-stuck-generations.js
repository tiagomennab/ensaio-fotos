const { PrismaClient } = require('@prisma/client')
const fetch = require('node-fetch')
require('dotenv').config({ path: '.env.local' })

const prisma = new PrismaClient()

async function fixStuckGenerations() {
  try {
    console.log('🔄 Finding stuck PROCESSING generations...')
    
    const stuckGenerations = await prisma.generation.findMany({
      where: {
        status: 'PROCESSING',
        createdAt: {
          // Look for generations older than 2 minutes
          lte: new Date(Date.now() - 2 * 60 * 1000)
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`📊 Found ${stuckGenerations.length} stuck generations`)

    for (const generation of stuckGenerations) {
      console.log(`\n🔍 Processing generation: ${generation.id}`)
      console.log(`   Job ID: ${generation.jobId}`)
      console.log(`   Created: ${generation.createdAt}`)
      
      if (!generation.jobId) {
        console.log('   ❌ No job ID found, skipping')
        continue
      }

      try {
        // Check job status in Replicate
        const response = await fetch(`https://api.replicate.com/v1/predictions/${generation.jobId}`, {
          headers: {
            'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          console.log(`   ❌ Failed to fetch job status: ${response.status}`)
          continue
        }

        const job = await response.json()
        console.log(`   Replicate status: ${job.status}`)

        if (job.status === 'succeeded' && job.output) {
          console.log(`   ✅ Job completed successfully, processing webhook manually...`)
          
          // Simulate webhook payload
          const webhookPayload = {
            id: job.id,
            status: 'succeeded',
            output: job.output,
            metrics: job.metrics,
            completed_at: job.completed_at
          }

          // Process webhook manually
          const webhookResponse = await fetch('http://localhost:3000/api/webhooks/generation', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(webhookPayload)
          })

          if (webhookResponse.ok) {
            console.log(`   ✅ Webhook processed successfully`)
          } else {
            console.log(`   ❌ Webhook processing failed: ${webhookResponse.status}`)
            const errorText = await webhookResponse.text()
            console.log(`   Error: ${errorText}`)
          }

        } else if (job.status === 'failed') {
          console.log(`   ❌ Job failed: ${job.error || 'Unknown error'}`)
          
          // Update generation to failed
          await prisma.generation.update({
            where: { id: generation.id },
            data: {
              status: 'FAILED',
              errorMessage: job.error || 'Job failed in Replicate',
              completedAt: new Date()
            }
          })
          console.log(`   ✅ Updated generation status to FAILED`)

        } else if (job.status === 'canceled') {
          console.log(`   ⚠️ Job was canceled`)
          
          // Update generation to failed  
          await prisma.generation.update({
            where: { id: generation.id },
            data: {
              status: 'FAILED',
              errorMessage: 'Job was canceled',
              completedAt: new Date()
            }
          })
          console.log(`   ✅ Updated generation status to FAILED (canceled)`)

        } else {
          console.log(`   ⏳ Job still processing in Replicate: ${job.status}`)
        }

      } catch (error) {
        console.log(`   ❌ Error processing generation: ${error.message}`)
      }

      // Small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    console.log('\n✅ Finished processing stuck generations')

  } catch (error) {
    console.error('❌ Error in fixStuckGenerations:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixStuckGenerations()