import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { WebhookPayload } from '@/lib/ai/base'

export async function POST(request: NextRequest) {
  try {
    const payload: WebhookPayload = await request.json()
    
    // Find the generation with this job ID
    const generation = await prisma.generation.findFirst({
      where: {
        jobId: payload.id
      },
      include: {
        user: {
          select: {
            id: true,
            email: true
          }
        },
        model: {
          select: {
            name: true
          }
        }
      }
    })

    if (!generation) {
      console.log(`Generation webhook: Generation not found for job ${payload.id}`)
      return NextResponse.json({ success: false, error: 'Generation not found' }, { status: 404 })
    }

    // Update generation based on webhook status
    const updateData: any = {}

    switch (payload.status) {
      case 'starting':
        updateData.status = 'PROCESSING'
        break

      case 'processing':
        updateData.status = 'PROCESSING'
        // Could update progress here if provided
        break

      case 'succeeded':
        updateData.status = 'COMPLETED'
        updateData.completedAt = new Date()
        
        if (payload.output) {
          // Handle different output formats
          let imageUrls: string[] = []
          
          if (Array.isArray(payload.output)) {
            imageUrls = payload.output
          } else if (typeof payload.output === 'string') {
            imageUrls = [payload.output]
          } else if (payload.output.images) {
            imageUrls = payload.output.images
          }
          
          updateData.imageUrls = imageUrls
          
          // Generate thumbnails if needed
          updateData.thumbnailUrls = await generateThumbnails(imageUrls)
        }
        
        // Calculate processing time
        if (payload.metrics?.total_time) {
          updateData.processingTime = Math.round(payload.metrics.total_time * 1000) // Convert to milliseconds
        } else {
          updateData.processingTime = new Date().getTime() - new Date(generation.createdAt).getTime()
        }
        
        break

      case 'failed':
        updateData.status = 'FAILED'
        updateData.completedAt = new Date()
        
        if (payload.error) {
          updateData.errorMessage = payload.error
        }
        
        // Refund credits on failure
        await refundGenerationCredits(generation.id, generation.userId)
        break

      case 'canceled':
        updateData.status = 'CANCELLED'
        updateData.completedAt = new Date()
        
        // Refund credits on cancellation
        await refundGenerationCredits(generation.id, generation.userId)
        break
    }

    // Update the generation
    await prisma.generation.update({
      where: { id: generation.id },
      data: updateData
    })

    // Send notification to user for completed generations
    if (payload.status === 'succeeded') {
      await sendGenerationNotification(
        generation.user.email, 
        generation.model.name, 
        updateData.imageUrls?.length || 0
      )
    }

    console.log(`Generation webhook processed for generation ${generation.id}: ${payload.status}`)

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Generation webhook error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

async function refundGenerationCredits(generationId: string, userId: string) {
  try {
    // Find the original usage log for this generation
    const originalUsage = await prisma.usageLog.findFirst({
      where: {
        userId,
        action: 'generation',
        details: {
          path: ['generationId'],
          equals: generationId
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (originalUsage && originalUsage.creditsUsed > 0) {
      // Create refund transaction
      await prisma.$transaction(async (tx) => {
        await tx.usageLog.create({
          data: {
            userId,
            action: 'generation_refund',
            details: {
              generationId,
              originalCreditsUsed: originalUsage.creditsUsed,
              reason: 'Generation failed/cancelled'
            },
            creditsUsed: -originalUsage.creditsUsed // Negative to indicate refund
          }
        })

        // Reduce credits used from user (effectively adding credits back)
        await tx.user.update({
          where: { id: userId },
          data: {
            creditsUsed: {
              decrement: originalUsage.creditsUsed
            }
          }
        })
      })

      console.log(`Refunded ${originalUsage.creditsUsed} credits to user ${userId}`)
    }
  } catch (error) {
    console.error('Failed to refund generation credits:', error)
  }
}

async function generateThumbnails(imageUrls: string[]): Promise<string[]> {
  // Placeholder for thumbnail generation
  // In practice, you would:
  // 1. Download the original images
  // 2. Resize them to thumbnail size (e.g., 300x300)
  // 3. Upload thumbnails to your storage
  // 4. Return thumbnail URLs
  
  // For now, return the same URLs (many AI providers already provide optimized images)
  return imageUrls
}

async function sendGenerationNotification(email: string, modelName: string, imageCount: number) {
  // Placeholder for email notification
  console.log(`Would send generation complete notification to ${email}: ${imageCount} images generated with ${modelName}`)
  
  // Example with Resend:
  // await resend.emails.send({
  //   from: 'noreply@ensaiofotos.com',
  //   to: email,
  //   subject: 'Your AI Photos are Ready!',
  //   html: `
  //     <h2>Your photos are ready!</h2>
  //     <p>We've successfully generated ${imageCount} image${imageCount > 1 ? 's' : ''} using your "${modelName}" model.</p>
  //     <p><a href="${process.env.NEXTAUTH_URL}/gallery">View your photos</a></p>
  //   `
  // })
}