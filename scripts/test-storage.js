const { downloadAndStoreImages } = require('../src/lib/storage/utils')

async function testStorage() {
  console.log('🧪 Testing storage system...')
  
  // Use a sample image URL from Replicate
  const testImageUrl = 'https://replicate.delivery/xezq/W7hdXQjq6F7fMiPDcwr6sZOZwLRF8JrqPvBJuFcT5BBfO5nlB/out-0.png'
  const testGenerationId = 'test-generation-' + Date.now()
  const testUserId = 'test-user'
  
  try {
    console.log('📥 Downloading and storing test image...')
    console.log(`Image URL: ${testImageUrl}`)
    console.log(`Generation ID: ${testGenerationId}`)
    console.log(`User ID: ${testUserId}`)
    
    const result = await downloadAndStoreImages(
      [testImageUrl],
      testGenerationId,
      testUserId
    )
    
    console.log('\n📊 Result:', result)
    
    if (result.success) {
      console.log('\n✅ Storage test PASSED!')
      console.log(`📁 Permanent URL: ${result.permanentUrls?.[0]}`)
      console.log(`🖼️ Thumbnail URL: ${result.thumbnailUrls?.[0]}`)
    } else {
      console.log('\n❌ Storage test FAILED!')
      console.log(`Error: ${result.error}`)
    }
    
  } catch (error) {
    console.error('\n💥 Storage test ERROR:', error)
  }
}

testStorage()