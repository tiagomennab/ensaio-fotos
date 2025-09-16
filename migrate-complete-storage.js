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
const USER_ID = 'cmf3555br0004qjk80pe9dhqr' // ID do usuário único

async function migrateCompleteStorage() {
  try {
    console.log('🚀 Starting complete storage migration...')
    console.log(`📦 Bucket: ${BUCKET_NAME}`)
    console.log(`👤 User ID: ${USER_ID}`)

    // List all objects with "generated/" prefix
    const listParams = {
      Bucket: BUCKET_NAME,
      Prefix: 'generated/'
    }

    const objects = await s3.listObjectsV2(listParams).promise()

    if (!objects.Contents || objects.Contents.length === 0) {
      console.log('📁 No objects found in generated/ folder')
      return
    }

    console.log(`📊 Found ${objects.Contents.length} objects to analyze`)

    // Categorize objects
    const migrations = {
      videos: [],
      thumbnails: [],
      upscaled: [],
      images: [],
      alreadyMigrated: []
    }

    for (const object of objects.Contents) {
      const key = object.Key
      console.log(`🔍 Analyzing: ${key}`)

      // Skip if already in user folder structure
      if (key.includes(`/${USER_ID}/`)) {
        migrations.alreadyMigrated.push(key)
        continue
      }

      // Categorize by path
      if (key.startsWith('generated/videos/')) {
        migrations.videos.push(key)
      } else if (key.startsWith('generated/thumbnails/')) {
        migrations.thumbnails.push(key)
      } else if (key.startsWith('generated/upscaled/')) {
        migrations.upscaled.push(key)
      } else if (key.startsWith('generated/images/')) {
        migrations.images.push(key)
      }
    }

    console.log('📋 Migration summary:')
    console.log(`  📹 Videos: ${migrations.videos.length}`)
    console.log(`  🖼️ Thumbnails: ${migrations.thumbnails.length}`)
    console.log(`  ⬆️ Upscaled: ${migrations.upscaled.length}`)
    console.log(`  🎨 Images: ${migrations.images.length}`)
    console.log(`  ✅ Already migrated: ${migrations.alreadyMigrated.length}`)

    // Migrate each category
    await migrateCategory('videos', migrations.videos, 'videos')
    await migrateCategory('thumbnails', migrations.thumbnails, 'thumbnails')
    await migrateCategory('upscaled', migrations.upscaled, 'upscaled')
    await migrateCategory('images', migrations.images, 'generations')

    console.log('🎉 Complete storage migration finished!')

  } catch (error) {
    console.error('❌ Error during migration:', error)
  } finally {
    await prisma.$disconnect()
  }
}

async function migrateCategory(categoryName, objects, newFolderName) {
  if (objects.length === 0) {
    console.log(`⏭️ Skipping ${categoryName} - no objects found`)
    return
  }

  console.log(`\n📂 Migrating ${categoryName} (${objects.length} objects)...`)

  for (const oldKey of objects) {
    try {
      // Calculate new key based on category
      let newKey

      if (categoryName === 'videos') {
        // generated/videos/filename.mp4 → generated/userId/videos/filename.mp4
        const filename = oldKey.replace('generated/videos/', '')
        newKey = `generated/${USER_ID}/videos/${filename}`
      } else if (categoryName === 'thumbnails') {
        // generated/thumbnails/filename.jpg → generated/userId/thumbnails/filename.jpg
        const filename = oldKey.replace('generated/thumbnails/', '')
        newKey = `generated/${USER_ID}/thumbnails/${filename}`
      } else if (categoryName === 'upscaled') {
        // generated/upscaled/filename.jpg → generated/userId/upscaled/filename.jpg
        const filename = oldKey.replace('generated/upscaled/', '')
        newKey = `generated/${USER_ID}/upscaled/${filename}`
      } else if (categoryName === 'images') {
        // generated/images/filename.jpg → generated/userId/generations/filename.jpg
        const filename = oldKey.replace('generated/images/', '')
        newKey = `generated/${USER_ID}/generations/${filename}`
      }

      console.log(`📦 Moving: ${oldKey} → ${newKey}`)

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

      // Update database URLs
      await updateDatabaseUrls(oldKey, newKey, categoryName)

    } catch (moveError) {
      console.error(`❌ Failed to move ${oldKey}:`, moveError.message)
    }
  }

  console.log(`✅ Finished migrating ${categoryName}`)
}

async function updateDatabaseUrls(oldKey, newKey, categoryName) {
  try {
    const oldUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${oldKey}`
    const newUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${newKey}`

    // Update based on category
    if (categoryName === 'videos') {
      // Update video_generation table
      const updatedVideos = await prisma.videoGeneration.updateMany({
        where: {
          OR: [
            { videoUrl: oldUrl },
            { thumbnailUrl: oldUrl }
          ]
        },
        data: {
          videoUrl: { equals: oldUrl } ? newUrl : undefined,
          thumbnailUrl: { equals: oldUrl } ? newUrl : undefined
        }
      })

      if (updatedVideos.count > 0) {
        console.log(`🔄 Updated ${updatedVideos.count} video URLs`)
      }

    } else if (categoryName === 'images' || categoryName === 'upscaled') {
      // Update generation table for images and upscaled
      const updatedGenerations = await prisma.generation.updateMany({
        where: {
          OR: [
            { imageUrls: { has: oldUrl } },
            { thumbnailUrls: { has: oldUrl } }
          ]
        },
        data: {
          imageUrls: { has: oldUrl } ? [newUrl] : undefined,
          thumbnailUrls: { has: oldUrl } ? [newUrl] : undefined
        }
      })

      if (updatedGenerations.count > 0) {
        console.log(`🔄 Updated ${updatedGenerations.count} generation URLs`)
      }

    } else if (categoryName === 'thumbnails') {
      // Update thumbnail URLs in generation table
      const updatedThumbnails = await prisma.generation.updateMany({
        where: {
          thumbnailUrls: { has: oldUrl }
        },
        data: {
          thumbnailUrls: [newUrl]
        }
      })

      if (updatedThumbnails.count > 0) {
        console.log(`🔄 Updated ${updatedThumbnails.count} thumbnail URLs`)
      }
    }

  } catch (dbError) {
    console.warn(`⚠️ Failed to update database URLs for ${oldKey}:`, dbError.message)
  }
}

// Run the migration
migrateCompleteStorage()