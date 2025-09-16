const { PrismaClient } = require('@prisma/client')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const prisma = new PrismaClient()

const USER_ID = 'cmf3555br0004qjk80pe9dhqr'
const BUCKET_NAME = process.env.AWS_S3_BUCKET
const REGION = process.env.AWS_REGION

async function fixDatabaseUrls() {
  try {
    console.log('🔧 Starting database URL fixes...')

    // 1. Fix video URLs
    console.log('\n📹 Fixing video URLs...')
    const videoUrls = [
      '73kgazx2q9rm80cs7fk9ygsdsg.mp4',
      'eggcys5sk5rme0cs8e5v8ckr34.mp4',
      'y5a5npeprdrma0cs80atz2fser.mp4'
    ]

    for (const filename of videoUrls) {
      const oldUrl = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/generated/videos/${filename}`
      const newUrl = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/generated/${USER_ID}/videos/${filename}`

      try {
        const updated = await prisma.videoGeneration.updateMany({
          where: {
            videoUrl: oldUrl
          },
          data: {
            videoUrl: newUrl
          }
        })

        if (updated.count > 0) {
          console.log(`✅ Updated ${updated.count} video URL: ${filename}`)
        } else {
          console.log(`⏭️ No records found for video: ${filename}`)
        }
      } catch (error) {
        console.error(`❌ Error updating video ${filename}:`, error.message)
      }
    }

    // 2. Fix upscaled image URLs (these are in generation table)
    console.log('\n⬆️ Fixing upscaled image URLs...')
    const upscaledFiles = [
      'cmfemit1s0001qj34bcq956wp/image_0_1757547720232.png',
      'cmfemit1s0001qj34bcq956wp/image_0_1757547724541.png',
      'cmfemit1s0001qj34bcq956wp/image_0_1757547732188.png',
      'cmfemit1s0001qj34bcq956wp/thumb_0_1757547720232.png',
      'cmfemit1s0001qj34bcq956wp/thumb_0_1757547724541.png',
      'cmfemit1s0001qj34bcq956wp/thumb_0_1757547732188.png'
    ]

    for (const filepath of upscaledFiles) {
      const oldUrl = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/generated/upscaled/${filepath}`
      const newUrl = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/generated/${USER_ID}/upscaled/${filepath}`

      try {
        // Update imageUrls array
        const updatedImages = await prisma.generation.updateMany({
          where: {
            imageUrls: {
              has: oldUrl
            }
          },
          data: {
            imageUrls: [newUrl]
          }
        })

        // Update thumbnailUrls array
        const updatedThumbs = await prisma.generation.updateMany({
          where: {
            thumbnailUrls: {
              has: oldUrl
            }
          },
          data: {
            thumbnailUrls: [newUrl]
          }
        })

        if (updatedImages.count > 0 || updatedThumbs.count > 0) {
          console.log(`✅ Updated URLs for: ${filepath} (images: ${updatedImages.count}, thumbs: ${updatedThumbs.count})`)
        } else {
          console.log(`⏭️ No records found for: ${filepath}`)
        }
      } catch (error) {
        console.error(`❌ Error updating upscaled ${filepath}:`, error.message)
      }
    }

    // 3. Fix thumbnail URLs (video frames)
    console.log('\n🖼️ Fixing thumbnail URLs...')
    const thumbnailFiles = [
      'videoframe_0 (1).png',
      'videoframe_0.png',
      'videoframe_5041.png'
    ]

    for (const filename of thumbnailFiles) {
      const oldUrl = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/generated/thumbnails/${filename}`
      const newUrl = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/generated/${USER_ID}/thumbnails/${filename}`

      try {
        const updated = await prisma.videoGeneration.updateMany({
          where: {
            thumbnailUrl: oldUrl
          },
          data: {
            thumbnailUrl: newUrl
          }
        })

        if (updated.count > 0) {
          console.log(`✅ Updated ${updated.count} thumbnail URL: ${filename}`)
        } else {
          console.log(`⏭️ No records found for thumbnail: ${filename}`)
        }
      } catch (error) {
        console.error(`❌ Error updating thumbnail ${filename}:`, error.message)
      }
    }

    console.log('\n🎉 Database URL fixes completed!')

  } catch (error) {
    console.error('❌ Error during URL fixes:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the fix
fixDatabaseUrls()