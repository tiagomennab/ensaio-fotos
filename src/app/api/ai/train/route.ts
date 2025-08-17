import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAIProvider, calculateTrainingCost } from '@/lib/ai'
import { ContentModerator } from '@/lib/security/content-moderator'
import { RateLimiter } from '@/lib/security/rate-limiter'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const trainModelSchema = z.object({
  modelId: z.string(),
  triggerWord: z.string().optional(),
  classWord: z.string().optional(),
  trainingParams: z.object({
    steps: z.number().min(100).max(2000).default(1000),
    learningRate: z.number().min(1e-6).max(1e-2).default(1e-4),
    batchSize: z.number().min(1).max(8).default(1),
    resolution: z.number().min(512).max(1536).default(1024),
    seed: z.number().optional()
  }).optional()
})

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const validationResult = trainModelSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const { modelId, triggerWord, classWord, trainingParams } = validationResult.data
    const userId = session.user.id
    const userPlan = session.user.plan || 'FREE'

    // Check rate limits for training
    const trainingLimit = await RateLimiter.checkLimit(userId, 'training', userPlan)
    if (!trainingLimit.allowed) {
      return NextResponse.json(
        { 
          error: 'Training rate limit exceeded',
          resetTime: trainingLimit.resetTime,
          retryAfter: trainingLimit.retryAfter
        },
        { status: 429 }
      )
    }

    // Moderate trigger word and class word if provided
    if (triggerWord) {
      const triggerModeration = await ContentModerator.moderateContent(triggerWord, userId)
      if (!triggerModeration.isAllowed) {
        return NextResponse.json(
          { 
            error: 'Trigger word violates content policy',
            reason: triggerModeration.reason
          },
          { status: 400 }
        )
      }
    }

    if (classWord) {
      const classModeration = await ContentModerator.moderateContent(classWord, userId)
      if (!classModeration.isAllowed) {
        return NextResponse.json(
          { 
            error: 'Class word violates content policy',
            reason: classModeration.reason
          },
          { status: 400 }
        )
      }
    }

    // Get model from database
    const model = await prisma.aIModel.findUnique({
      where: { 
        id: modelId,
        userId: session.user.id
      },
      include: {
        trainingPhotos: true,
        user: {
          select: {
            id: true,
            plan: true,
            creditsUsed: true,
            creditsLimit: true
          }
        }
      }
    })

    if (!model) {
      return NextResponse.json(
        { error: 'Model not found or access denied' },
        { status: 404 }
      )
    }

    // Check if model is ready for training
    if (model.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Model is not ready for training' },
        { status: 400 }
      )
    }

    if (model.trainingPhotos.length < 3) {
      return NextResponse.json(
        { error: 'At least 3 training photos are required' },
        { status: 400 }
      )
    }

    // Calculate training cost
    const finalParams = {
      steps: trainingParams?.steps || 1000,
      learningRate: trainingParams?.learningRate || 1e-4,
      batchSize: trainingParams?.batchSize || 1,
      resolution: trainingParams?.resolution || 1024,
      seed: trainingParams?.seed
    }

    const cost = calculateTrainingCost(finalParams.steps, finalParams.resolution)

    // Check user credits
    if (model.user.credits < cost) {
      return NextResponse.json(
        { 
          error: 'Insufficient credits',
          required: cost,
          available: model.user.credits
        },
        { status: 402 }
      )
    }

    // Get AI provider
    const aiProvider = getAIProvider()

    // Prepare training request
    const trainingRequest = {
      modelId: model.id,
      modelName: model.name,
      triggerWord: triggerWord || model.triggerWord || 'TOK',
      classWord: classWord || model.class.toLowerCase(),
      imageUrls: model.trainingPhotos.map(photo => photo.url),
      params: finalParams,
      webhookUrl: `${process.env.NEXTAUTH_URL}/api/webhooks/training`
    }

    // Start training
    const trainingResponse = await aiProvider.startTraining(trainingRequest)

    // Record the training attempt
    await RateLimiter.recordAttempt(userId, 'training', {
      modelId: model.id,
      cost,
      trainingId: trainingResponse.id
    })

    // Update model in database
    await prisma.$transaction(async (tx) => {
      // Update model status and training info
      await tx.aIModel.update({
        where: { id: model.id },
        data: {
          status: 'TRAINING',
          triggerWord: trainingRequest.triggerWord,
          trainingJobId: trainingResponse.id,
          trainingStartedAt: new Date(),
          estimatedCompletionTime: trainingResponse.estimatedTime ? 
            new Date(Date.now() + trainingResponse.estimatedTime * 60 * 1000) : null,
          trainingParams: finalParams as any
        }
      })

      // Deduct credits from user
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          credits: {
            decrement: cost
          }
        }
      })

      // Log the transaction
      await tx.creditTransaction.create({
        data: {
          userId: session.user.id,
          type: 'DEBIT',
          amount: cost,
          description: `Model training: ${model.name}`,
          modelId: model.id
        }
      })
    })

    return NextResponse.json({
      success: true,
      data: {
        trainingId: trainingResponse.id,
        estimatedTime: trainingResponse.estimatedTime,
        cost,
        status: trainingResponse.status
      }
    })

  } catch (error) {
    console.error('Training start error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to start training',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Get training status
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const trainingId = searchParams.get('trainingId')

    if (!trainingId) {
      return NextResponse.json(
        { error: 'Training ID is required' },
        { status: 400 }
      )
    }

    // Find model with this training ID
    const model = await prisma.aIModel.findFirst({
      where: {
        trainingJobId: trainingId,
        userId: session.user.id
      }
    })

    if (!model) {
      return NextResponse.json(
        { error: 'Training job not found or access denied' },
        { status: 404 }
      )
    }

    // Get training status from AI provider
    const aiProvider = getAIProvider()
    const trainingStatus = await aiProvider.getTrainingStatus(trainingId)

    // Update model status if needed
    if (trainingStatus.status === 'succeeded' && model.status === 'TRAINING') {
      await prisma.aIModel.update({
        where: { id: model.id },
        data: {
          status: 'READY',
          modelUrl: trainingStatus.model?.url,
          trainingCompletedAt: new Date(),
          qualityScore: 85 // Calculate based on training results
        }
      })
    } else if (trainingStatus.status === 'failed' && model.status === 'TRAINING') {
      await prisma.aIModel.update({
        where: { id: model.id },
        data: {
          status: 'ERROR',
          trainingCompletedAt: new Date()
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: trainingStatus
    })

  } catch (error) {
    console.error('Training status error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to get training status',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}