require('dotenv').config({ path: '.env.local' })
const Replicate = require('replicate')

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

async function checkReplicateJob() {
  try {
    const jobId = '4dhqtrw1q5rj40cs7tk83jkgmr' // From our stale generation
    
    console.log(`🔍 Checking Replicate job: ${jobId}`)
    
    // Get prediction details
    const prediction = await replicate.predictions.get(jobId)
    
    console.log('\n📊 Replicate Job Status:')
    console.log(`ID: ${prediction.id}`)
    console.log(`Status: ${prediction.status}`)
    console.log(`Created: ${prediction.created_at}`)
    console.log(`Started: ${prediction.started_at || 'Not started'}`)
    console.log(`Completed: ${prediction.completed_at || 'Not completed'}`)
    console.log(`Version: ${prediction.version}`)
    
    if (prediction.input) {
      console.log('\n📝 Input:')
      console.log(JSON.stringify(prediction.input, null, 2))
    }
    
    if (prediction.output) {
      console.log('\n🎨 Output:')
      console.log(Array.isArray(prediction.output) ? 
        prediction.output.map((url, i) => `${i + 1}. ${url}`) : 
        prediction.output
      )
    }
    
    if (prediction.error) {
      console.log('\n❌ Error:')
      console.log(prediction.error)
    }
    
    if (prediction.logs) {
      console.log('\n📋 Logs (last 500 chars):')
      console.log(prediction.logs.slice(-500))
    }
    
    // Check webhook configuration
    console.log('\n🔗 Webhook Info:')
    console.log(`Webhook URL: ${prediction.webhook || 'None configured'}`)
    console.log(`Events Filter: ${JSON.stringify(prediction.webhook_events_filter) || 'None'}`)
    
  } catch (error) {
    console.error('❌ Error checking Replicate job:', error.message)
    
    if (error.message.includes('404')) {
      console.log('💡 Job not found - it may have been deleted or never existed')
    }
  }
}

checkReplicateJob()