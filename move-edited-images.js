const AWS = require('aws-sdk')
const { PrismaClient } = require('@prisma/client')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const prisma = new PrismaClient()

// Configure AWS
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET

async function moveEditedImages() {
  try {
    console.log('🔍 Finding edited images in S3...')

    // List all objects with "edited/" prefix
    const listParams = {
      Bucket: BUCKET_NAME,
      Prefix: 'edited/'
    }

    const objects = await s3.listObjectsV2(listParams).promise()

    if (!objects.Contents || objects.Contents.length === 0) {
      console.log('📁 No edited images found in bucket')
      return
    }

    console.log(`📊 Found ${objects.Contents.length} edited images to move`)

    for (const object of objects.Contents) {
      const oldKey = object.Key
      console.log(`📁 Processing: ${oldKey}`)

      // Extract userId from path: edited/userId/...
      const pathParts = oldKey.split('/')
      if (pathParts.length < 3) {
        console.log(`⚠️ Skipping ${oldKey} - invalid path structure`)
        continue
      }

      const userId = pathParts[1]
      const restOfPath = pathParts.slice(2).join('/')

      // New structure: generated/userId/edited/...
      const newKey = `generated/${userId}/edited/${restOfPath}`

      console.log(`📦 Moving ${oldKey} → ${newKey}`)

      try {
        // Copy object to new location
        await s3.copyObject({
          Bucket: BUCKET_NAME,
          CopySource: `${BUCKET_NAME}/${oldKey}`,
          Key: newKey
        }).promise()

        // Delete old object
        await s3.deleteObject({
          Bucket: BUCKET_NAME,
          Key: oldKey
        }).promise()

        console.log(`✅ Moved successfully: ${newKey}`)

        // Update database URLs if this is an image file
        if (oldKey.includes('image_') && !oldKey.includes('thumb_')) {
          const oldUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${oldKey}`
          const newUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${newKey}`

          await prisma.generation.updateMany({
            where: {
              imageUrls: {
                has: oldUrl
              }
            },
            data: {
              imageUrls: [newUrl]
            }
          })

          console.log(`🔄 Updated database URL: ${oldUrl} → ${newUrl}`)
        }

        // Update thumbnail URLs
        if (oldKey.includes('thumb_')) {
          const oldUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${oldKey}`
          const newUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${newKey}`

          await prisma.generation.updateMany({
            where: {
              thumbnailUrls: {
                has: oldUrl
              }
            },
            data: {
              thumbnailUrls: [newUrl]
            }
          })

          console.log(`🖼️ Updated thumbnail URL: ${oldUrl} → ${newUrl}`)
        }

      } catch (moveError) {
        console.error(`❌ Failed to move ${oldKey}:`, moveError.message)
      }
    }

    console.log('🎉 Migration completed!')

  } catch (error) {
    console.error('❌ Error during migration:', error)
  } finally {
    await prisma.$disconnect()
  }
}

moveEditedImages()