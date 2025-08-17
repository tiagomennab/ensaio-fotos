import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { WebhookPayload } from '@/lib/ai/base'

export async function POST(request: NextRequest) {
  try {
    const payload: WebhookPayload = await request.json()
    
    // Find the model that is currently training
    // Since trainingJobId is not in the schema, we'll find by status and recent activity
    const model = await prisma.aIModel.findFirst({
      where: {
        status: 'TRAINING',
        updatedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Within last 24 hours
        }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true
          }
        }
      }
    })

    if (!model) {
      console.log(`Training webhook: Model not found for job ${payload.id}`)
      return NextResponse.json({ success: false, error: 'Model not found' }, { status: 404 })
    }

    // Update model based on webhook status
    const updateData: any = {}

    switch (payload.status) {
      case 'starting':
        updateData.status = 'TRAINING'
        break

      case 'processing':
        updateData.status = 'TRAINING'
        // Could update progress here if provided
        break

      case 'succeeded':
        updateData.status = 'READY'
        updateData.trainingCompletedAt = new Date()
        
        if (payload.output?.weights) {
          updateData.modelUrl = payload.output.weights
        }
        
        // Calculate quality score based on training metrics
        updateData.qualityScore = calculateQualityScore(payload)
        
        break

      case 'failed':
        updateData.status = 'ERROR'
        updateData.trainingCompletedAt = new Date()
        
        if (payload.error) {
          updateData.errorMessage = payload.error
        }
        
        // Refund credits on failure
        await refundTrainingCredits(model.id, model.userId)
        break

      case 'canceled':
        updateData.status = 'DRAFT'
        // trainingJobId field doesn't exist in schema, skipping this update
        
        // Refund credits on cancellation
        await refundTrainingCredits(model.id, model.userId)
        break
    }

    // Update the model
    await prisma.aIModel.update({
      where: { id: model.id },
      data: updateData
    })

    // Send notification to user (if you have email setup)
    if (payload.status === 'succeeded' || payload.status === 'failed') {
      await sendTrainingNotification(model.user.email, model.name, payload.status)
    }

    console.log(`Training webhook processed for model ${model.id}: ${payload.status}`)

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Training webhook error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

async function refundTrainingCredits(modelId: string, userId: string) {
  try {
    // Find the original usage log for this training
    const originalUsage = await prisma.usageLog.findFirst({
      where: {
        userId,
        action: 'training',
        details: {
          path: ['modelId'],
          equals: modelId
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
            action: 'training_refund',
            details: {
              modelId,
              originalCreditsUsed: originalUsage.creditsUsed,
              reason: 'Training failed/cancelled'
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
    console.error('Failed to refund training credits:', error)
  }
}

function calculateQualityScore(payload: WebhookPayload): number {
  // Calculate quality score based on training metrics
  // This is a simplified version - in practice you'd use actual training metrics
  
  let score = 75 // Base score
  
  // Check if training completed successfully
  if (payload.status === 'succeeded') {
    score += 10
  }
  
  // Check training time (faster might indicate better optimization)
  if (payload.metrics?.total_time) {
    const trainingTimeMinutes = payload.metrics.total_time / 60
    if (trainingTimeMinutes < 30) {
      score += 5
    } else if (trainingTimeMinutes > 120) {
      score -= 5
    }
  }
  
  // Check for any errors in logs
  if (payload.logs && payload.logs.some(log => log.toLowerCase().includes('error'))) {
    score -= 5
  }
  
  return Math.max(10, Math.min(100, score))
}

async function sendTrainingNotification(email: string, modelName: string, status: string) {
  // Placeholder for email notification
  // You would integrate with your email service here (Resend, SendGrid, etc.)
  console.log(`Would send ${status} notification to ${email} for model ${modelName}`)
  
  // Example with Resend:
  // await resend.emails.send({
  //   from: 'noreply@ensaiofotos.com',
  //   to: email,
  //   subject: `Model Training ${status === 'succeeded' ? 'Completed' : 'Failed'}`,
  //   html: `Your model "${modelName}" training has ${status}.`
  // })
}