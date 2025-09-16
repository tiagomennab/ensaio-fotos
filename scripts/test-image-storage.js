const { processAndStoreReplicateImages } = require('../src/lib/services/auto-image-storage')
require('dotenv').config({ path: '.env.local' })

// Test URLs - these are example Replicate image URLs (replace with real ones)
const TEST_URLS = [
  'https://replicate.delivery/pbxt/sample1.jpg',
  'https://replicate.delivery/pbxt/sample2.jpg'
]

async function testImageStorage() {
  const testGenerationId = `test-${Date.now()}`
  
  console.log('🧪 Testing Image Storage System')
  console.log('================================')
  console.log(`📋 Generation ID: ${testGenerationId}`)
  console.log(`📥 Test URLs: ${TEST_URLS.length}`)
  console.log(`🌍 AWS Region: ${process.env.AWS_REGION}`)
  console.log(`🪣 AWS Bucket: ${process.env.AWS_S3_BUCKET}`)
  console.log('')

  try {
    console.log('⏳ Processing images...')
    const results = await processAndStoreReplicateImages(TEST_URLS, testGenerationId)
    
    console.log('✅ Processing completed!')
    console.log(`📊 Results: ${results.length}/${TEST_URLS.length} images processed`)
    console.log('')
    
    results.forEach((result, index) => {
      console.log(`📸 Image ${index + 1}:`)
      console.log(`   Original: ${result.originalUrl}`)
      console.log(`   Stored:   ${result.url}`)
      console.log(`   S3 Key:   ${result.key}`)
      console.log('')
    })
    
    // Test image accessibility
    console.log('🔍 Testing image accessibility...')
    for (let i = 0; i < results.length; i++) {
      const result = results[i]
      try {
        const response = await fetch(result.url, { method: 'HEAD' })
        if (response.ok) {
          console.log(`✅ Image ${i + 1} is accessible (${response.status})`)
        } else {
          console.log(`❌ Image ${i + 1} not accessible (${response.status})`)
        }
      } catch (error) {
        console.log(`❌ Image ${i + 1} fetch error: ${error.message}`)
      }
    }
    
    console.log('')
    console.log('🎉 Test completed successfully!')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.error('📋 Error details:', {
      name: error.name,
      stack: error.stack
    })
    process.exit(1)
  }
}

async function testS3Configuration() {
  console.log('🔧 Testing S3 Configuration')
  console.log('============================')
  
  const { S3Client, HeadBucketCommand, GetBucketCorsCommand } = require('@aws-sdk/client-s3')
  
  const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  })
  
  const bucket = process.env.AWS_S3_BUCKET
  
  try {
    // Test bucket access
    console.log(`🪣 Testing bucket access: ${bucket}`)
    await s3Client.send(new HeadBucketCommand({ Bucket: bucket }))
    console.log('✅ Bucket is accessible')
    
    // Test CORS configuration
    console.log('📡 Testing CORS configuration...')
    try {
      const corsResponse = await s3Client.send(new GetBucketCorsCommand({ Bucket: bucket }))
      console.log(`✅ CORS configured with ${corsResponse.CORSRules?.length || 0} rules`)
      
      corsResponse.CORSRules?.forEach((rule, index) => {
        console.log(`   Rule ${index + 1}:`)
        console.log(`     Origins: ${rule.AllowedOrigins?.join(', ')}`)
        console.log(`     Methods: ${rule.AllowedMethods?.join(', ')}`)
        console.log(`     Headers: ${rule.AllowedHeaders?.join(', ')}`)
      })
    } catch (corsError) {
      console.log('⚠️ CORS not configured or not accessible')
    }
    
    console.log('✅ S3 configuration test passed')
    
  } catch (error) {
    console.error('❌ S3 configuration test failed:', error.message)
    throw error
  }
}

async function main() {
  try {
    console.log('🚀 Starting Image Storage Tests')
    console.log('================================\n')
    
    // Check environment variables
    const requiredEnvs = [
      'AWS_ACCESS_KEY_ID',
      'AWS_SECRET_ACCESS_KEY', 
      'AWS_S3_BUCKET',
      'AWS_REGION'
    ]
    
    const missingEnvs = requiredEnvs.filter(env => !process.env[env])
    
    if (missingEnvs.length > 0) {
      console.error('❌ Missing required environment variables:')
      missingEnvs.forEach(env => console.error(`   - ${env}`))
      console.error('\nPlease configure these in .env.local')
      process.exit(1)
    }
    
    console.log('✅ Environment variables configured')
    console.log('')
    
    // Test S3 configuration first
    await testS3Configuration()
    console.log('')
    
    // Test image storage (commented out for now since we don't have real test URLs)
    console.log('⚠️ Image storage test skipped - replace TEST_URLS with real Replicate URLs to test')
    console.log('📝 To test with real URLs:')
    console.log('   1. Generate some images via the app')
    console.log('   2. Replace TEST_URLS in this script with the Replicate URLs')
    console.log('   3. Run the script again')
    
    // await testImageStorage()
    
  } catch (error) {
    console.error('❌ Tests failed:', error.message)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}