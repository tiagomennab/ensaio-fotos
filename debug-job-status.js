require('dotenv').config({ path: '.env.local' })
const { PrismaClient } = require('@prisma/client')
const Replicate = require('replicate')

const prisma = new PrismaClient()
const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN })

async function debugJobStatus() {
  try {
    const jobId = 'aqcyg3d3m5rm80cs7vhbay27cm'
    
    console.log('🔍 DEBUGGING JOB STATUS IN DETAIL')
    console.log('==================================')
    
    // Database status
    const generation = await prisma.generation.findFirst({
      where: { jobId }
    })
    
    console.log('\n📊 DATABASE STATUS:')
    console.log('ID:', generation?.id)
    console.log('Status:', generation?.status)
    console.log('Created:', generation?.createdAt)
    console.log('Completed:', generation?.completedAt)
    console.log('Error Message:', generation?.errorMessage)
    console.log('Image URLs:', generation?.imageUrls)
    console.log('Job ID:', generation?.jobId)
    
    // Replicate status
    const prediction = await replicate.predictions.get(jobId)
    
    console.log('\n🎯 REPLICATE STATUS:')
    console.log('ID:', prediction.id)
    console.log('Status:', prediction.status)
    console.log('Created:', prediction.created_at)
    console.log('Started:', prediction.started_at)
    console.log('Completed:', prediction.completed_at)
    console.log('Has Output:', !!prediction.output)
    console.log('Output Type:', typeof prediction.output)
    
    if (prediction.output) {
      console.log('\n🖼️ OUTPUT DETAILS:')
      if (Array.isArray(prediction.output)) {
        console.log('Array with', prediction.output.length, 'items:')
        prediction.output.forEach((url, i) => {
          console.log(`${i + 1}. ${url}`)
        })
      } else {
        console.log('Single output:', prediction.output)
      }
    }
    
    if (prediction.error) {
      console.log('\n❌ REPLICATE ERROR:')
      console.log(prediction.error)
    }
    
    if (prediction.logs) {
      console.log('\n📋 LOGS (last 200 chars):')
      console.log(prediction.logs.slice(-200))
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

debugJobStatus()