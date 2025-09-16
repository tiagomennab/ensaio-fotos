require('dotenv').config({ path: '.env.local' })
const Replicate = require('replicate')

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN })

async function checkReplicateOutput() {
  try {
    const jobId = 'aqcyg3d3m5rm80cs7vhbay27cm'
    
    console.log('🔍 CHECKING REPLICATE OUTPUT IN DETAIL')
    console.log('=====================================')
    
    const prediction = await replicate.predictions.get(jobId)
    
    console.log('📊 Basic Info:')
    console.log('Status:', prediction.status)
    console.log('Completed:', prediction.completed_at)
    console.log('Processing Time:', prediction.metrics?.total_time || 'Unknown')
    
    console.log('\n🎯 Output Analysis:')
    console.log('Has Output:', !!prediction.output)
    console.log('Output Type:', typeof prediction.output)
    console.log('Output Value:', prediction.output)
    
    if (prediction.output === null) {
      console.log('❌ Output is NULL')
    } else if (prediction.output === undefined) {
      console.log('❌ Output is UNDEFINED')
    } else if (Array.isArray(prediction.output) && prediction.output.length === 0) {
      console.log('❌ Output is EMPTY ARRAY')
    } else if (typeof prediction.output === 'object') {
      console.log('📋 Output Object Keys:', Object.keys(prediction.output))
      console.log('📋 Output Object:', JSON.stringify(prediction.output, null, 2))
    }
    
    if (prediction.error) {
      console.log('\n❌ ERROR:', prediction.error)
    }
    
    if (prediction.logs) {
      console.log('\n📋 LOGS:')
      console.log(prediction.logs)
    }
    
    // Check model info
    console.log('\n🤖 Model Info:')
    console.log('Version:', prediction.version)
    console.log('Model:', prediction.model)
    
    // Check input parameters
    console.log('\n⚙️ Input Parameters:')
    console.log(JSON.stringify(prediction.input, null, 2))
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

checkReplicateOutput()