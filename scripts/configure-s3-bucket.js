const { 
  S3Client, 
  PutBucketCorsCommand, 
  PutBucketPolicyCommand,
  GetBucketCorsCommand,
  GetBucketPolicyCommand,
  PutBucketLifecycleConfigurationCommand
} = require('@aws-sdk/client-s3')

require('dotenv').config({ path: '.env.local' })

async function configureS3Bucket() {
  const region = process.env.AWS_REGION || 'us-east-1'
  const bucket = process.env.AWS_S3_BUCKET || 'ensaio-fotos-prod'
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY

  if (!accessKeyId || !secretAccessKey) {
    console.error('❌ AWS credentials not found. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env.local')
    process.exit(1)
  }

  console.log(`🔧 Configuring S3 bucket: ${bucket}`)
  console.log(`🌍 Region: ${region}`)

  const s3Client = new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey
    }
  })

  try {
    // 1. Configure CORS for public access
    console.log('\n📡 Configuring CORS...')
    const corsConfiguration = {
      CORSRules: [
        {
          // Rule for public image access (GET requests)
          AllowedHeaders: ['Accept', 'Content-Type', 'Origin'],
          AllowedMethods: ['GET', 'HEAD'],
          AllowedOrigins: [
            'http://localhost:3000',
            'https://*.vercel.app',
            'https://ensaio-fotos.vercel.app',
            'https://ensaio-fotos.com' // Add actual domain if different
          ],
          ExposeHeaders: ['ETag', 'Content-Type', 'Content-Length'],
          MaxAgeSeconds: 86400 // 24 hours for better caching
        },
        {
          // Rule for uploads (PUT/POST requests)
          AllowedHeaders: ['Content-Type', 'x-amz-meta-*', 'x-amz-acl', 'Content-Length'],
          AllowedMethods: ['PUT', 'POST'],
          AllowedOrigins: [
            'http://localhost:3000',
            'https://*.vercel.app',
            'https://ensaio-fotos.vercel.app'
          ],
          ExposeHeaders: ['ETag'],
          MaxAgeSeconds: 3600
        }
      ]
    }

    await s3Client.send(new PutBucketCorsCommand({
      Bucket: bucket,
      CORSConfiguration: corsConfiguration
    }))
    console.log('✅ CORS configured successfully')

    // 2. Configure bucket policy for public read access
    console.log('\n🔒 Configuring bucket policy...')
    const bucketPolicy = {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'PublicReadGetObject',
          Effect: 'Allow',
          Principal: '*',
          Action: 's3:GetObject',
          Resource: `arn:aws:s3:::${bucket}/generated/*`
        },
        {
          Sid: 'PublicReadGetObject2',
          Effect: 'Allow',
          Principal: '*',
          Action: 's3:GetObject',
          Resource: `arn:aws:s3:::${bucket}/training/*`
        }
      ]
    }

    await s3Client.send(new PutBucketPolicyCommand({
      Bucket: bucket,
      Policy: JSON.stringify(bucketPolicy)
    }))
    console.log('✅ Bucket policy configured successfully')

    // 3. Configure lifecycle policy for cost optimization
    console.log('\n♻️ Configuring lifecycle policy...')
    const lifecycleConfiguration = {
      Rules: [
        {
          ID: 'DeleteIncompleteMultipartUploads',
          Status: 'Enabled',
          Filter: {},
          AbortIncompleteMultipartUpload: {
            DaysAfterInitiation: 1
          }
        },
        {
          ID: 'ArchiveOldGeneratedImages',
          Status: 'Enabled',
          Filter: {
            Prefix: 'generated/'
          },
          Transitions: [
            {
              Days: 90,
              StorageClass: 'STANDARD_IA'
            },
            {
              Days: 365,
              StorageClass: 'GLACIER'
            }
          ]
        }
      ]
    }

    await s3Client.send(new PutBucketLifecycleConfigurationCommand({
      Bucket: bucket,
      LifecycleConfiguration: lifecycleConfiguration
    }))
    console.log('✅ Lifecycle policy configured successfully')

    // 4. Verify configuration
    console.log('\n🔍 Verifying configuration...')
    
    try {
      const corsResponse = await s3Client.send(new GetBucketCorsCommand({ Bucket: bucket }))
      console.log('✅ CORS verified:', corsResponse.CORSRules?.length, 'rules')
    } catch (error) {
      console.error('❌ CORS verification failed:', error.message)
    }

    try {
      const policyResponse = await s3Client.send(new GetBucketPolicyCommand({ Bucket: bucket }))
      console.log('✅ Bucket policy verified')
    } catch (error) {
      console.error('❌ Bucket policy verification failed:', error.message)
    }

    console.log('\n🎉 S3 bucket configuration completed successfully!')
    console.log('\n📋 Configuration Summary:')
    console.log(`   • Bucket: ${bucket}`)
    console.log(`   • Region: ${region}`)
    console.log(`   • Public read access: enabled for generated/* and training/*`)
    console.log(`   • CORS: configured for web access`)
    console.log(`   • Lifecycle: cleanup and archiving rules applied`)
    console.log('\n🔗 Test URL format:')
    console.log(`   https://${bucket}.s3.${region}.amazonaws.com/generated/cmf/test-image.jpg`)

  } catch (error) {
    console.error('\n❌ Configuration failed:', error.message)
    process.exit(1)
  }
}

// Run configuration
if (require.main === module) {
  configureS3Bucket().catch(error => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })
}

module.exports = { configureS3Bucket }