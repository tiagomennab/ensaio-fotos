const { AutoStorageService } = require('./src/lib/services/auto-storage-service.ts')

const generationId = 'cmfhp9rto0003qj20jxcoiyh2'

async function forceSyncSpecific() {
  console.log('🔄 Force syncing specific generation...')
  console.log(`Generation ID: ${generationId}`)
  console.log('')

  try {
    const autoStorage = AutoStorageService.getInstance()
    
    console.log('📞 Calling forceCheckGeneration...')
    const result = await autoStorage.forceCheckGeneration(generationId)
    
    if (result) {
      console.log('✅ SUCCESS! Generation has been force synced.')
      console.log('🎉 The image should now appear in the gallery!')
    } else {
      console.log('⚠️ Sync attempted but no changes made.')
      console.log('This could mean:')
      console.log('  - Generation is still processing on Replicate')
      console.log('  - Generation failed on Replicate')
      console.log('  - jobId not found')
    }

  } catch (error) {
    console.error('❌ Force sync failed:', error.message)
    console.log('')
    console.log('Stack trace:', error.stack)
  }
}

forceSyncSpecific()