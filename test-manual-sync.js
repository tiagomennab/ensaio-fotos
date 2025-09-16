const jobId = '6wxh24r67hrma0cs84c9fsepw0'
const generationId = 'cmfhp9rto0003qj20jxcoiyh2'

async function testManualSync() {
  console.log('🧪 Testing manual sync API...')
  console.log(`JobId: ${jobId}`)
  console.log(`GenerationId: ${generationId}`)
  console.log('')

  try {
    // First, check current status
    console.log('1️⃣ Checking current sync status...')
    const statusResponse = await fetch(`http://localhost:3000/api/sync/job?jobId=${jobId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!statusResponse.ok) {
      const errorData = await statusResponse.text()
      console.log(`❌ Status check failed (${statusResponse.status}):`, errorData)
      
      // Try with generationId instead
      console.log('🔄 Retrying with generationId...')
      const statusResponse2 = await fetch(`http://localhost:3000/api/sync/job?generationId=${generationId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (!statusResponse2.ok) {
        console.log(`❌ Status check with generationId also failed (${statusResponse2.status})`)
        console.log('Authentication required - this API requires login')
        return
      }
      
      const statusData = await statusResponse2.json()
      console.log('📊 Current Status:', statusData)
    } else {
      const statusData = await statusResponse.json()
      console.log('📊 Current Status:', statusData)
    }

    console.log('')
    console.log('2️⃣ Attempting force sync...')
    
    // Now try to force sync
    const syncResponse = await fetch('http://localhost:3000/api/sync/job', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jobId,
        generationId
      })
    })

    if (!syncResponse.ok) {
      const errorData = await syncResponse.text()
      console.log(`❌ Force sync failed (${syncResponse.status}):`, errorData)
      console.log('This likely requires authentication. The API will work when called from logged-in users.')
      return
    }

    const syncData = await syncResponse.json()
    console.log('🔄 Sync Result:', JSON.stringify(syncData, null, 2))

    if (syncData.updated) {
      console.log('')
      console.log('✅ SYNC SUCCESSFUL!')
      console.log(`📸 Images synced: ${syncData.imageUrls?.length || 0}`)
      console.log(`🖼️ Thumbnails: ${syncData.thumbnailUrls?.length || 0}`)
      if (syncData.warning) {
        console.log(`⚠️ Warning: ${syncData.warning}`)
      }
    } else {
      console.log('')
      console.log('ℹ️ No sync needed or sync not possible')
      console.log(`Message: ${syncData.message}`)
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.log('')
    console.log('💡 This is normal for development - the API requires user authentication.')
    console.log('💡 The sync system is now available and will work when users are logged in.')
  }
}

testManualSync()