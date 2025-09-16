require('dotenv').config({ path: '.env.local' })
const Replicate = require('replicate')

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN })

async function checkReplicateOnly() {
  try {
    const jobId = '2vdyfzgbxdrma0cs7x6vqaayvm'
    
    console.log('🔍 CHECKING REPLICATE JOB:', jobId)
    console.log('====================================')
    
    const prediction = await replicate.predictions.get(jobId)
    
    console.log('📊 BASIC INFO:')
    console.log('ID:', prediction.id)
    console.log('Status:', prediction.status)
    console.log('Created:', prediction.created_at)
    console.log('Started:', prediction.started_at)
    console.log('Completed:', prediction.completed_at)
    console.log('Processing Time:', prediction.metrics?.total_time || 'Unknown')
    
    console.log('\n🎯 OUTPUT ANALYSIS:')
    console.log('Has Output:', !!prediction.output)
    console.log('Output Type:', typeof prediction.output)
    console.log('Output Value:', prediction.output)
    
    if (prediction.output) {
      if (Array.isArray(prediction.output)) {
        console.log('✅ Array with', prediction.output.length, 'items:')
        prediction.output.forEach((url, i) => {
          console.log(`  ${i + 1}. ${url}`)
        })
        
        // Test first URL
        if (prediction.output.length > 0 && typeof prediction.output[0] === 'string') {
          console.log('\n🌐 Testing first URL accessibility...')
          try {
            const response = await fetch(prediction.output[0], { method: 'HEAD' })
            console.log(`✅ URL Status: ${response.status}`)
            console.log(`Content-Type: ${response.headers.get('content-type')}`)
            console.log(`Content-Length: ${response.headers.get('content-length')} bytes`)
          } catch (error) {
            console.log('❌ URL Error:', error.message)
          }
        }
      } else if (typeof prediction.output === 'string') {
        console.log('✅ Single URL:', prediction.output)
        
        // Test URL
        console.log('\n🌐 Testing URL accessibility...')
        try {
          const response = await fetch(prediction.output, { method: 'HEAD' })
          console.log(`✅ URL Status: ${response.status}`)
          console.log(`Content-Type: ${response.headers.get('content-type')}`)
          console.log(`Content-Length: ${response.headers.get('content-length')} bytes`)
        } catch (error) {
          console.log('❌ URL Error:', error.message)
        }
      } else {
        console.log('📋 Complex output:', JSON.stringify(prediction.output, null, 2))
      }
    } else {
      console.log('❌ No output available')
    }
    
    if (prediction.error) {
      console.log('\n❌ REPLICATE ERROR:')
      console.log(prediction.error)
    }
    
    console.log('\n⚙️ INPUT PARAMETERS:')
    if (prediction.input && Object.keys(prediction.input).length > 0) {
      console.log('✅ Has input parameters')
      console.log('Keys:', Object.keys(prediction.input))
      if (prediction.input.prompt) {
        console.log('Prompt:', prediction.input.prompt.substring(0, 100) + '...')
      }
    } else {
      console.log('❌ No input parameters')
    }
    
    console.log('\n🤖 MODEL INFO:')
    console.log('Version:', prediction.version)
    console.log('Model:', prediction.model)
    
    // Summary
    console.log('\n📋 SUMMARY:')
    console.log('Status:', prediction.status)
    console.log('Has Valid Output:', !!prediction.output && (Array.isArray(prediction.output) ? prediction.output.length > 0 : true))
    console.log('Ready for Recovery:', prediction.status === 'succeeded' && !!prediction.output)
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    if (error.message.includes('404')) {
      console.log('💡 Job not found - may have been deleted or never existed')
    }
  }
}

checkReplicateOnly()