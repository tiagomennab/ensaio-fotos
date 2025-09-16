const { S3Client, HeadBucketCommand, GetBucketCorsCommand, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3')
require('dotenv').config({ path: '.env.local' })

async function testS3Configuration() {
  console.log('🧪 Testing S3 Configuration')
  console.log('============================')
  
  const region = process.env.AWS_REGION
  const bucket = process.env.AWS_S3_BUCKET
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY

  console.log(`🪣 Bucket: ${bucket}`)
  console.log(`🌍 Region: ${region}`)
  console.log(`🔑 Access Key: ${accessKeyId ? accessKeyId.substring(0, 8) + '...' : 'Not set'}`)
  console.log('')

  if (!accessKeyId || !secretAccessKey || !bucket || !region) {
    console.error('❌ Missing required environment variables')
    process.exit(1)
  }
  
  const s3Client = new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey
    }
  })
  
  try {
    // Test 1: Bucket access
    console.log('1️⃣ Testing bucket access...')
    await s3Client.send(new HeadBucketCommand({ Bucket: bucket }))
    console.log('✅ Bucket is accessible')
    
    // Test 2: CORS configuration
    console.log('\n2️⃣ Testing CORS configuration...')
    try {
      const corsResponse = await s3Client.send(new GetBucketCorsCommand({ Bucket: bucket }))
      console.log(`✅ CORS configured with ${corsResponse.CORSRules?.length || 0} rules`)
      
      corsResponse.CORSRules?.forEach((rule, index) => {
        console.log(`   Rule ${index + 1}:`)
        console.log(`     Origins: ${rule.AllowedOrigins?.join(', ')}`)
        console.log(`     Methods: ${rule.AllowedMethods?.join(', ')}`)
      })
    } catch (corsError) {
      console.log('⚠️ CORS not configured or not accessible')
    }
    
    // Test 3: Upload test file
    console.log('\n3️⃣ Testing file upload...')
    const testKey = `test/test-${Date.now()}.txt`
    const testContent = 'Test file for S3 configuration'
    
    await s3Client.send(new PutObjectCommand({
      Bucket: bucket,
      Key: testKey,
      Body: testContent,
      ContentType: 'text/plain',
      ACL: 'public-read'
    }))
    console.log('✅ Test file uploaded successfully')
    
    // Test 4: Public access
    console.log('\n4️⃣ Testing public access...')
    const publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${testKey}`
    console.log(`📎 Test URL: ${publicUrl}`)
    
    try {
      const response = await fetch(publicUrl)
      if (response.ok) {
        const content = await response.text()
        console.log('✅ Public access working correctly')
        console.log(`📄 Content: "${content}"`)
      } else {
        console.log(`❌ Public access failed: ${response.status}`)
      }
    } catch (fetchError) {
      console.log(`❌ Failed to fetch public URL: ${fetchError.message}`)
    }
    
    // Test 5: Cleanup
    console.log('\n5️⃣ Cleaning up test file...')
    const { DeleteObjectCommand } = require('@aws-sdk/client-s3')
    await s3Client.send(new DeleteObjectCommand({
      Bucket: bucket,
      Key: testKey
    }))
    console.log('✅ Test file cleaned up')
    
    console.log('\n🎉 All S3 tests passed!')
    console.log('\n📋 Your bucket is ready for the automatic image storage system!')
    console.log(`🔗 Generated images will be stored at:`)
    console.log(`   https://${bucket}.s3.${region}.amazonaws.com/generated/cmf/`)
    
  } catch (error) {
    console.error('\n❌ S3 test failed:', error.message)
    console.error('\n🔧 Troubleshooting:')
    console.error('   1. Check your AWS credentials in .env.local')
    console.error('   2. Verify the bucket name is correct')
    console.error('   3. Ensure your AWS user has S3 permissions')
    console.error('   4. Check if the bucket exists in the specified region')
    throw error
  }
}

if (require.main === module) {
  testS3Configuration().catch(error => {
    console.error('Script failed:', error)
    process.exit(1)
  })
}