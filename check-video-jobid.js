const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkVideoGeneration() {
  try {
    console.log('🔍 Checking video generation with jobId: 6wxh24r67hrma0cs84c9fsepw0')
    
    // Find the video generation by jobId
    const video = await prisma.videoGeneration.findUnique({
      where: {
        jobId: '6wxh24r67hrma0cs84c9fsepw0'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!video) {
      console.log('❌ Video generation not found with that jobId')
      return
    }

    console.log('📋 Video Generation Details:')
    console.log('  ID:', video.id)
    console.log('  User:', video.user.name || video.user.email)
    console.log('  Status:', video.status)
    console.log('  Prompt:', video.prompt)
    console.log('  Duration:', video.duration, 'seconds')
    console.log('  Quality:', video.quality)
    console.log('  Aspect Ratio:', video.aspectRatio)
    console.log('  Created At:', video.createdAt)
    console.log('  Updated At:', video.updatedAt)
    console.log('')

    console.log('📁 Storage URLs:')
    console.log('  Source Image URL:', video.sourceImageUrl || 'None (text-to-video)')
    console.log('  Video URL:', video.videoUrl || 'NOT SET ❌')
    console.log('  Thumbnail URL:', video.thumbnailUrl || 'NOT SET ❌')
    console.log('')

    console.log('⚙️ Processing Info:')
    console.log('  Job ID:', video.jobId)
    console.log('  Progress:', video.progress, '%')
    console.log('  Processing Started:', video.processingStartedAt)
    console.log('  Processing Completed:', video.processingCompletedAt)
    console.log('  Error Message:', video.errorMessage || 'None')
    console.log('  Credits Used:', video.creditsUsed)
    console.log('')

    // Check if URLs are accessible
    if (video.videoUrl) {
      console.log('🔗 Testing video URL accessibility...')
      try {
        const response = await fetch(video.videoUrl, { method: 'HEAD' })
        console.log('  Video URL Status:', response.status, response.ok ? '✅' : '❌')
        console.log('  Content-Type:', response.headers.get('content-type'))
        console.log('  Content-Length:', response.headers.get('content-length'), 'bytes')
      } catch (error) {
        console.log('  Video URL Error:', error.message, '❌')
      }
    }

    if (video.thumbnailUrl) {
      console.log('🖼️ Testing thumbnail URL accessibility...')
      try {
        const response = await fetch(video.thumbnailUrl, { method: 'HEAD' })
        console.log('  Thumbnail URL Status:', response.status, response.ok ? '✅' : '❌')
        console.log('  Content-Type:', response.headers.get('content-type'))
      } catch (error) {
        console.log('  Thumbnail URL Error:', error.message, '❌')
      }
    }

    if (video.sourceImageUrl) {
      console.log('🖼️ Testing source image URL accessibility...')
      try {
        const response = await fetch(video.sourceImageUrl, { method: 'HEAD' })
        console.log('  Source Image URL Status:', response.status, response.ok ? '✅' : '❌')
        console.log('  Content-Type:', response.headers.get('content-type'))
      } catch (error) {
        console.log('  Source Image URL Error:', error.message, '❌')
      }
    }

    console.log('')
    console.log('📊 Summary:')
    console.log('  Status:', video.status)
    console.log('  Has Video URL:', !!video.videoUrl ? '✅' : '❌')
    console.log('  Has Thumbnail URL:', !!video.thumbnailUrl ? '✅' : '❌')
    console.log('  Video Type:', video.sourceImageUrl ? 'image-to-video' : 'text-to-video')

  } catch (error) {
    console.error('❌ Error checking video generation:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkVideoGeneration()