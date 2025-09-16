require('dotenv').config({ path: '.env.local' })
const { PrismaClient } = require('@prisma/client')
const Replicate = require('replicate')

const prisma = new PrismaClient()
const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN })

async function checkNewJob() {
  try {
    const jobId = '2vdyfzgbxdrma0cs7x6vqaayvm'
    
    console.log('🔍 CHECKING NEW JOB:', jobId)
    console.log('================================')
    
    // Check database first
    const generation = await prisma.generation.findFirst({
      where: { jobId },
      select: { id: true, userId: true, status: true, imageUrls: true, prompt: true, createdAt: true }
    })
    
    if (generation) {
      console.log('📊 DATABASE STATUS:')
      console.log('Generation ID:', generation.id)
      console.log('Status:', generation.status)
      console.log('Created:', generation.createdAt)
      console.log('Image URLs:', generation.imageUrls?.length || 0)
      console.log('Prompt preview:', generation.prompt?.substring(0, 100) + '...')
    } else {
      console.log('❌ No generation found in database for this job ID')
    }
    
    // Check Replicate status
    const prediction = await replicate.predictions.get(jobId)
    
    console.log('\n🎯 REPLICATE STATUS:')
    console.log('ID:', prediction.id)
    console.log('Status:', prediction.status)
    console.log('Created:', prediction.created_at)
    console.log('Completed:', prediction.completed_at)
    console.log('Has Output:', !!prediction.output)
    console.log('Output Type:', typeof prediction.output)
    
    if (prediction.output) {
      console.log('\n🖼️ OUTPUT ANALYSIS:')
      if (Array.isArray(prediction.output)) {
        console.log('✅ Array with', prediction.output.length, 'items:')
        prediction.output.forEach((url, i) => {
          console.log(`  ${i + 1}. ${url}`)
        })
      } else if (typeof prediction.output === 'string') {
        console.log('✅ Single URL:', prediction.output)
      } else {
        console.log('📋 Object output:', JSON.stringify(prediction.output, null, 2))
      }
      
      // Test URL accessibility
      const testUrl = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output
      if (typeof testUrl === 'string' && testUrl.startsWith('http')) {
        console.log('\n🌐 Testing URL accessibility...')
        try {
          const response = await fetch(testUrl, { method: 'HEAD' })
          console.log(`✅ URL accessible: ${response.status} ${response.statusText}`)
          console.log(`Content-Type: ${response.headers.get('content-type')}`)
          console.log(`Content-Length: ${response.headers.get('content-length')}`)
        } catch (error) {
          console.log('❌ URL not accessible:', error.message)
        }
      }
    } else {
      console.log('❌ No output available')
    }
    
    if (prediction.error) {
      console.log('\n❌ ERROR:', prediction.error)
    }
    
    // Check input parameters
    console.log('\n⚙️ INPUT PARAMETERS:')
    if (prediction.input && Object.keys(prediction.input).length > 0) {
      console.log('✅ Has input parameters:')
      console.log(JSON.stringify(prediction.input, null, 2))
    } else {
      console.log('❌ No input parameters')
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkNewJob()