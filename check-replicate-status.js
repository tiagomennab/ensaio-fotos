const fetch = require('node-fetch')
require('dotenv').config({ path: '.env.local' })

async function checkReplicateJobs() {
  const token = process.env.REPLICATE_API_TOKEN
  
  if (!token) {
    console.log('❌ REPLICATE_API_TOKEN not found')
    return
  }

  console.log('🔍 Checking recent Replicate jobs...')

  // Job IDs from our recent generations
  const jobIds = [
    '2w0z33mrbhrmc0cs7jksktt0d4', // PROCESSING
    'ag9zg4nhn9rmc0cs7jh8q57ya8', // PROCESSING  
    'zj9t9shw15rma0cs7jbv67scb8', // COMPLETED but no URLs
    'fd34wpe5xdrme0cs7j8s30mk8w', // COMPLETED but no URLs
    'xqgg87rsxsrm80cs7j3r61eft4', // FAILED
    '9esjmcmbexrm80cs7htamy1e9m'  // FAILED
  ]

  for (const jobId of jobIds) {
    try {
      console.log(`\n📋 Checking job: ${jobId}`)
      
      const response = await fetch(`https://api.replicate.com/v1/predictions/${jobId}`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        console.log(`   ❌ HTTP ${response.status}: ${response.statusText}`)
        continue
      }

      const job = await response.json()
      
      console.log(`   Status: ${job.status}`)
      console.log(`   Created: ${job.created_at}`)
      console.log(`   Started: ${job.started_at || 'null'}`)
      console.log(`   Completed: ${job.completed_at || 'null'}`)
      
      if (job.urls?.webhook) {
        console.log(`   Webhook URL: ${job.urls.webhook}`)
      }
      
      if (job.error) {
        console.log(`   Error: ${job.error}`)
      }
      
      if (job.output && Array.isArray(job.output)) {
        console.log(`   Output URLs: ${job.output.length} images`)
        job.output.forEach((url, index) => {
          console.log(`     ${index + 1}. ${url.substring(0, 80)}...`)
        })
      } else if (job.output) {
        console.log(`   Output: ${typeof job.output} - ${JSON.stringify(job.output).substring(0, 100)}`)
      } else {
        console.log(`   Output: null`)
      }

    } catch (error) {
      console.log(`   ❌ Error checking job: ${error.message}`)
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  console.log('\n🔍 Checking webhook endpoint status...')
  try {
    // Check if webhook endpoint is reachable
    const webhookUrl = process.env.NEXTAUTH_URL ? 
      `${process.env.NEXTAUTH_URL}/api/webhooks/generation` : 
      'http://localhost:3000/api/webhooks/generation'
    
    console.log(`Webhook endpoint: ${webhookUrl}`)
    
    const testResponse = await fetch(webhookUrl, {
      method: 'GET'
    })
    
    console.log(`Webhook endpoint status: ${testResponse.status}`)
    
  } catch (error) {
    console.log(`❌ Error checking webhook endpoint: ${error.message}`)
  }
}

checkReplicateJobs().catch(console.error)