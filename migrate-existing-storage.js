require('dotenv').config({ path: '.env.local' })
const { S3Client, ListObjectsV2Command, CopyObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3')

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
})

const bucket = process.env.AWS_S3_BUCKET

async function migrateStorageStructure() {
  try {
    console.log('🔄 Migrating storage to new organized structure...')
    
    // List all objects in the bucket
    const listCommand = new ListObjectsV2Command({
      Bucket: bucket,
      MaxKeys: 1000
    })
    
    const response = await s3Client.send(listCommand)
    console.log(`📊 Found ${response.Contents?.length || 0} objects in bucket`)
    
    if (!response.Contents || response.Contents.length === 0) {
      console.log('✅ No objects to migrate')
      return
    }
    
    let migratedCount = 0
    
    for (const object of response.Contents) {
      const key = object.Key
      
      // Skip if already in new structure
      if (key.startsWith('generated/') || key.startsWith('edited/') || key.startsWith('upscaled/') || key.startsWith('videos/') || key.startsWith('thumbnails/')) {
        console.log(`⏭️ Skipping already organized: ${key}`)
        continue
      }
      
      // Migrate old 'images/' folder to 'generated/'
      if (key.startsWith('images/')) {
        const newKey = key.replace('images/', 'generated/')
        
        console.log(`📁 Migrating: ${key} → ${newKey}`)
        
        // Copy to new location
        await s3Client.send(new CopyObjectCommand({
          Bucket: bucket,
          CopySource: `${bucket}/${key}`,
          Key: newKey
        }))
        
        // Delete old file
        await s3Client.send(new DeleteObjectCommand({
          Bucket: bucket,
          Key: key
        }))
        
        migratedCount++
        
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      
      // Create thumbnails folder structure if needed
      if (key.includes('thumb_') && !key.startsWith('thumbnails/')) {
        const parts = key.split('/')
        if (parts.length >= 3) {
          const userId = parts[1]
          const filename = parts[2]
          const newKey = `thumbnails/generated/${userId}/${filename}`
          
          console.log(`🖼️ Moving thumbnail: ${key} → ${newKey}`)
          
          await s3Client.send(new CopyObjectCommand({
            Bucket: bucket,
            CopySource: `${bucket}/${key}`,
            Key: newKey
          }))
          
          await s3Client.send(new DeleteObjectCommand({
            Bucket: bucket,
            Key: key
          }))
          
          migratedCount++
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }
    }
    
    console.log(`✅ Migration completed! Moved ${migratedCount} files to new structure`)
    console.log(`📁 New structure:`)
    console.log(`   ├── generated/userId/`)
    console.log(`   ├── edited/userId/`)  
    console.log(`   ├── upscaled/userId/`)
    console.log(`   ├── videos/userId/`)
    console.log(`   └── thumbnails/[type]/userId/`)
    
  } catch (error) {
    console.error('❌ Migration error:', error)
  }
}

migrateStorageStructure()