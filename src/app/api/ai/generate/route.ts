import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAIProvider, calculateGenerationCost, validatePrompt, sanitizePrompt } from '@/lib/ai'
import { ContentModerator } from '@/lib/security/content-moderator'
import { RateLimiter } from '@/lib/security/rate-limiter'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const generateImageSchema = z.object({
  modelId: z.string(),
  prompt: z.string().min(1).max(1000),
  negativePrompt: z.string().optional(),
  generationParams: z.object({
    width: z.number().min(512).max(1536).default(1024),
    height: z.number().min(512).max(1536).default(1024),
    steps: z.number().min(10).max(100).default(20),
    guidance_scale: z.number().min(1).max(20).default(7.5),
    scheduler: z.string().optional().default('DPMSolverMultistep'),
    seed: z.number().optional(),
    num_outputs: z.number().min(1).max(4).default(1),
    safety_checker: z.boolean().default(true)
  }).optional(),
  aspectRatio: z.string().optional().default('1:1'),
  style: z.string().optional(),
  variations: z.number().min(1).max(4).default(1)
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
    const validationResult = generateImageSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const { 
      modelId, 
      prompt, 
      negativePrompt, 
      generationParams, 
      aspectRatio, 
      style, 
      variations 
    } = validationResult.data
    const userId = session.user.id
    const userPlan = session.user.plan || 'FREE'

    // Check rate limits for generation
    const generationLimit = await RateLimiter.checkLimit(userId, 'generation', userPlan)
    if (!generationLimit.allowed) {
      return NextResponse.json(
        { 
          error: 'Generation rate limit exceeded',
          resetTime: generationLimit.resetTime,
          retryAfter: generationLimit.retryAfter
        },
        { status: 429 }
      )
    }

    // Content moderation for prompt
    const promptModeration = await ContentModerator.moderateContent(prompt, userId)
    if (!promptModeration.isAllowed) {
      return NextResponse.json(
        { 
          error: 'Prompt violates content policy',
          reason: promptModeration.reason,
          severity: promptModeration.severity
        },
        { status: 400 }
      )
    }

    // Content moderation for negative prompt if provided
    if (negativePrompt) {
      const negativeModeration = await ContentModerator.moderateContent(negativePrompt, userId)
      if (!negativeModeration.isAllowed) {
        return NextResponse.json(
          { 
            error: 'Negative prompt violates content policy',
            reason: negativeModeration.reason
          },
          { status: 400 }
        )
      }
    }

    // Validate prompt content (legacy validation)
    const promptValidation = validatePrompt(prompt)
    if (!promptValidation.isValid) {
      return NextResponse.json(
        { error: promptValidation.error },
        { status: 400 }
      )
    }

    // Get model from database
    const model = await prisma.aIModel.findUnique({
      where: { 
        id: modelId,
        userId: session.user.id
      },
      include: {
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

    // Check if model is ready for generation
    if (model.status !== 'READY') {
      return NextResponse.json(
        { error: 'Model is not ready for generation' },
        { status: 400 }
      )
    }

    // Prepare generation parameters
    const finalParams = {
      width: generationParams?.width || 1024,
      height: generationParams?.height || 1024,
      steps: generationParams?.steps || 20,
      guidance_scale: generationParams?.guidance_scale || 7.5,
      scheduler: generationParams?.scheduler || 'DPMSolverMultistep',
      seed: generationParams?.seed,
      num_outputs: variations,
      safety_checker: generationParams?.safety_checker ?? true
    }

    // Calculate generation cost
    const cost = calculateGenerationCost(finalParams.width, finalParams.height, finalParams.steps) * variations

    // Check user credits
    const availableCredits = model.user.creditsLimit - model.user.creditsUsed
    if (availableCredits < cost) {
      return NextResponse.json(
        { 
          error: 'Insufficient credits',
          required: cost,
          available: availableCredits
        },
        { status: 402 }
      )
    }

    // Sanitize prompt
    const finalPrompt = sanitizePrompt(prompt)

    // Get AI provider
    const aiProvider = getAIProvider()

    // Create generation record in database first
    const generation = await prisma.generation.create({
      data: {
        userId: session.user.id,
        modelId: model.id,
        prompt: finalPrompt,
        negativePrompt: negativePrompt || '',
        status: 'PROCESSING',
        aspectRatio,
        resolution: `${finalParams.width}x${finalParams.height}`,
        style: style || 'default',
        variations,
        seed: finalParams.seed
      }
    })

    // Prepare generation request
    const generationRequest = {
      modelUrl: model.modelUrl || undefined,
      prompt: finalPrompt,
      negativePrompt: negativePrompt,
      params: finalParams,
      webhookUrl: process.env.NODE_ENV === 'production' 
        ? `${process.env.NEXTAUTH_URL}/api/webhooks/generation`
        : undefined // No webhook in development - will use polling instead
    }

    // Start generation
    console.log(`🚀 About to call AI provider generateImage`)
    const generationResponse = await aiProvider.generateImage(generationRequest)
    console.log(`📋 AI provider response:`, {
      id: generationResponse.id,
      status: generationResponse.status,
      estimatedTime: generationResponse.estimatedTime
    })

    // Check if we have a valid webhook URL (requires HTTPS in production)
    const hasValidWebhook = generationRequest.webhookUrl !== undefined && (
      process.env.NODE_ENV === 'development' ||
      generationRequest.webhookUrl.startsWith('https://')
    )

    const shouldPoll = !hasValidWebhook || process.env.NODE_ENV === 'development'

    console.log(`🔍 Generation flow decision:`, {
      hasWebhookUrl: !!generationRequest.webhookUrl,
      webhookUrl: generationRequest.webhookUrl,
      hasValidWebhook,
      shouldPoll,
      environment: process.env.NODE_ENV,
      predictionId: generationResponse.id
    })

    // Always use polling in development, or when webhook is not available
    if (shouldPoll && generationResponse.id) {
      console.log(`🔄 Starting polling for prediction ${generationResponse.id} (webhook: ${hasValidWebhook ? 'yes' : 'no'})`)

      // Start polling in background with improved error handling
      try {
        const { startPolling } = await import('@/lib/services/polling-service')

        // Use setTimeout instead of setImmediate for better reliability
        setTimeout(async () => {
          try {
            await startPolling(generationResponse.id, generation.id, userId)
            console.log(`✅ Polling service started successfully for ${generationResponse.id}`)
          } catch (error) {
            console.error(`❌ Failed to start polling for ${generationResponse.id}:`, error)
          }
        }, 100) // Small delay to ensure transaction completion

        console.log(`📝 Polling startup scheduled for ${generationResponse.id}`)
      } catch (importError) {
        console.error(`❌ Failed to import polling service for ${generationResponse.id}:`, importError)
      }
    } else {
      console.log(`⚠️ Polling skipped for ${generationResponse.id}:`, { shouldPoll, hasGenerationId: !!generationResponse.id })
    }

    // Record the generation attempt
    await RateLimiter.recordAttempt(userId, 'generation', {
      modelId: model.id,
      generationId: generation.id,
      cost,
      variations,
      jobId: generationResponse.id
    })

    // Update generation with job ID and deduct credits
    console.log(`💾 About to update database with job ID: ${generationResponse.id}`)
    await prisma.$transaction(async (tx) => {
      // Update generation record
      await tx.generation.update({
        where: { id: generation.id },
        data: {
          jobId: generationResponse.id,
          estimatedCompletionTime: generationResponse.estimatedTime ? 
            new Date(Date.now() + generationResponse.estimatedTime * 1000) : null
        }
      })

      // Deduct credits from user
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          creditsUsed: {
            increment: cost
          }
        }
      })

      // Log the usage
      await tx.usageLog.create({
        data: {
          userId: session.user.id,
          action: 'generation',
          details: {
            generationId: generation.id,
            modelId: model.id,
            variations,
            cost
          },
          creditsUsed: cost
        }
      })
    })

    return NextResponse.json({
      success: true,
      data: {
        generationId: generation.id,
        jobId: generationResponse.id,
        estimatedTime: generationResponse.estimatedTime,
        cost,
        status: generationResponse.status
      }
    })

  } catch (error) {
    console.error('Generation start error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to start generation',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Get generation status
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
    const generationId = searchParams.get('generationId')
    const jobId = searchParams.get('jobId')

    if (!generationId && !jobId) {
      return NextResponse.json(
        { error: 'Generation ID or Job ID is required' },
        { status: 400 }
      )
    }

    // Find generation record
    const whereClause = generationId ? 
      { id: generationId, userId: session.user.id } :
      { jobId: jobId!, userId: session.user.id }

    const generation = await prisma.generation.findFirst({
      where: whereClause,
      include: {
        model: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!generation) {
      return NextResponse.json(
        { error: 'Generation not found or access denied' },
        { status: 404 }
      )
    }

    // Get generation status from AI provider if still processing
    if (generation.status === 'PROCESSING' && generation.jobId) {
      const aiProvider = getAIProvider()
      const generationStatus = await aiProvider.getGenerationStatus(generation.jobId)

      // Update generation status if completed
      if (generationStatus.status === 'succeeded' && generationStatus.urls) {
        await prisma.generation.update({
          where: { id: generation.id },
          data: {
            status: 'COMPLETED',
            imageUrls: generationStatus.urls,
            completedAt: new Date(),
            processingTime: generationStatus.completedAt ? 
              new Date(generationStatus.completedAt).getTime() - new Date(generation.createdAt).getTime() : null
          }
        })

        return NextResponse.json({
          success: true,
          data: {
            ...generationStatus,
            generationId: generation.id,
            prompt: generation.prompt,
            model: generation.model
          }
        })
      } else if (generationStatus.status === 'failed') {
        await prisma.generation.update({
          where: { id: generation.id },
          data: {
            status: 'FAILED',
            completedAt: new Date()
          }
        })
      }

      return NextResponse.json({
        success: true,
        data: {
          ...generationStatus,
          generationId: generation.id,
          prompt: generation.prompt,
          model: generation.model
        }
      })
    }

    // Return stored generation data
    return NextResponse.json({
      success: true,
      data: {
        id: generation.jobId || generation.id,
        status: generation.status.toLowerCase(),
        urls: generation.imageUrls,
        generationId: generation.id,
        prompt: generation.prompt,
        model: generation.model,
        createdAt: generation.createdAt.toISOString(),
        completedAt: generation.completedAt?.toISOString()
      }
    })

  } catch (error) {
    console.error('Generation status error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to get generation status',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}