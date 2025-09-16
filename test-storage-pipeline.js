const { downloadAndStoreImages } = require('./src/lib/storage/utils')

async function testStoragePipeline() {
  try {
    console.log('🧪 Testing storage pipeline with Replicate URLs...')
    
    // URLs from the completed generations
    const testUrls = [
      'https://replicate.delivery/xezq/rKQ3REO7XQJXJNkeOzTfelDEwb8mJxtMThX9ReCFGJdGncRVB/out-0.png',
      'https://replicate.delivery/xezq/ZfG7YXVxpeoooEpZ5HUutCQOaiKdzlpZ8pssOoVyjYowEXUVA/out-0.jpg'
    ]
    
    // Test generation details
    const testGenerationId = 'test-storage-pipeline-' + Date.now()
    const testUserId = 'test-user-' + Date.now()
    
    console.log(`📋 Test generation ID: ${testGenerationId}`)
    console.log(`👤 Test user ID: ${testUserId}`)
    console.log(`🖼️ URLs to test: ${testUrls.length}`)
    
    testUrls.forEach((url, index) => {
      console.log(`   ${index + 1}. ${url.substring(0, 80)}...`)
    })
    
    console.log('\n🚀 Starting storage process...')
    
    const result = await downloadAndStoreImages(
      testUrls,
      testGenerationId,
      testUserId
    )
    
    console.log('\n📊 Storage Results:')
    console.log(`✅ Success: ${result.success}`)
    console.log(`🔗 Permanent URLs: ${result.permanentUrls?.length || 0}`)
    console.log(`🖼️ Thumbnail URLs: ${result.thumbnailUrls?.length || 0}`)
    
    if (result.permanentUrls && result.permanentUrls.length > 0) {
      console.log('\n🎯 Permanent URLs generated:')
      result.permanentUrls.forEach((url, index) => {
        console.log(`   ${index + 1}. ${url}`)
      })
    }
    
    if (result.error) {
      console.log(`❌ Error: ${result.error}`)
    }
    
    // Test if URLs are accessible
    if (result.permanentUrls && result.permanentUrls.length > 0) {
      console.log('\n🔍 Testing URL accessibility...')
      
      for (const url of result.permanentUrls) {
        try {
          const response = await fetch(url, { method: 'HEAD' })
          console.log(`   ${url}: ${response.ok ? '✅ Accessible' : '❌ Not accessible'} (${response.status})`)
        } catch (error) {
          console.log(`   ${url}: ❌ Error - ${error.message}`)
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing storage pipeline:', error)
    console.error('Stack trace:', error.stack)
  }
}

testStoragePipeline()