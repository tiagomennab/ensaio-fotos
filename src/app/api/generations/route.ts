import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createGeneration } from '@/lib/db/generations'
import { canUserUseCredits, updateUserCredits } from '@/lib/db/users'
import { getModelById } from '@/lib/db/models'
import { getAIProvider } from '@/lib/ai'
import { prisma } from '@/lib/db'

// Helper functions for optimal generation parameters
function calculateOptimalSteps(userPlan: string, megapixels: number, modelType: 'custom' | 'base'): number {
  // Base steps by plan for quality (temporarily max quality for STARTER testing)
  const planSteps = {
    'STARTER': 40,  // Temporarily max quality for testing
    'PREMIUM': 20,  // FLUX Dev - balanced
    'GOLD': 28      // FLUX Pro - highest quality
  }
  
  let baseSteps = planSteps[userPlan as keyof typeof planSteps] || 40
  
  // Increase steps for higher resolutions
  if (megapixels > 2.25) {
    baseSteps = Math.min(baseSteps + 12, 50) // Higher cap for very high res
  } else if (megapixels > 1.5) {
    baseSteps = Math.min(baseSteps + 8, 40) // Cap at 40 steps max
  }
  
  // Custom models may need more steps for quality
  if (modelType === 'custom') {
    baseSteps = Math.min(baseSteps + 4, 35)
  }
  
  return baseSteps
}

function calculateOptimalGuidance(userPlan: string, megapixels: number): number {
  // Base guidance by plan (optimized for FLUX - max 5.0 to prevent over-saturation)
  const planGuidance = {
    'STARTER': 4.0,   // Optimized for FLUX - reduced from 5.5 to prevent artifacts
    'PREMIUM': 4.0,   // FLUX Dev optimal - consistent with config
    'GOLD': 4.5       // FLUX Pro for highest quality - capped at safe value
  }
  
  let baseGuidance = planGuidance[userPlan as keyof typeof planGuidance] || 4.0
  
  // Slightly increase guidance for higher resolutions but cap at FLUX maximum (5.0)
  if (megapixels > 1.5) {
    baseGuidance = Math.min(baseGuidance + 0.5, 5.0) // FLUX maximum for quality
  }
  
  return baseGuidance
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      modelId,
      prompt,
      negativePrompt,
      aspectRatio = '1:1',
      resolution = '512x512',
      variations = 1,
      strength = 0.8,
      seed,
      style = 'photographic',
      // FLUX-specific parameters
      steps,
      guidance_scale,
      safety_tolerance,
      raw_mode,
      output_format,
      output_quality
    } = body

    // Validate required fields
    if (!modelId || !prompt) {
      return NextResponse.json(
        { error: 'Missing required fields: modelId and prompt' },
        { status: 400 }
      )
    }

    // Validate prompt length
    if (prompt.length > 1500) {
      return NextResponse.json(
        { error: 'Prompt must be 1500 characters or less' },
        { status: 400 }
      )
    }

    // Validate variations
    if (variations < 1 || variations > 4) {
      return NextResponse.json(
        { error: 'Variations must be between 1 and 4' },
        { status: 400 }
      )
    }

    // Check if user owns the model
    const model = await getModelById(modelId, session.user.id)
    if (!model) {
      return NextResponse.json(
        { error: 'Model not found or access denied' },
        { status: 404 }
      )
    }

    // Check if model is ready
    if (model.status !== 'READY') {
      return NextResponse.json(
        { error: `Model is not ready for generation. Current status: ${model.status}` },
        { status: 400 }
      )
    }

    // Check if user has enough credits (10 credits per image generated)
    const creditsNeeded = variations * 10
    const canUseCredits = await canUserUseCredits(session.user.id, creditsNeeded)
    
    if (!canUseCredits) {
      return NextResponse.json(
        { error: 'Insufficient credits. Upgrade your plan or wait for monthly reset.' },
        { status: 403 }
      )
    }

    // Create generation record
    const generation = await createGeneration({
      userId: session.user.id,
      modelId,
      prompt,
      negativePrompt,
      aspectRatio,
      resolution,
      variations,
      strength,
      seed,
      style
    })

    // Update user credits
    await updateUserCredits(session.user.id, creditsNeeded)

    try {
      // Get AI provider and start real generation
      console.log(`🎨 Starting generation for model ${model.name} (${model.id})`)
      const aiProvider = getAIProvider()

      // Parse resolution
      const [width, height] = resolution.split('x').map(Number)

      // Get user plan from session for quality optimization
      const userPlan = (session.user as any).plan || 'FREE'
      
      // Calculate optimal parameters based on resolution and user plan
      const megapixels = (width * height) / (1024 * 1024)
      const optimalSteps = calculateOptimalSteps(userPlan, megapixels, model.modelUrl ? 'custom' : 'base')
      const optimalGuidance = calculateOptimalGuidance(userPlan, megapixels)
      
      // Build generation request with all FLUX parameters
      const generationRequest = {
        modelUrl: model.modelUrl!, // We know it's ready so modelUrl exists
        prompt,
        negativePrompt,
        params: {
          width,
          height,
          // Core parameters (will be mapped based on model type)
          steps: steps || optimalSteps,
          guidance_scale: guidance_scale || optimalGuidance,
          num_outputs: variations,
          seed: seed || Math.floor(Math.random() * 1000000),
          // FLUX-specific parameters
          safety_tolerance: safety_tolerance || 2,
          raw_mode: raw_mode || false,
          output_format: output_format || 'png',
          output_quality: output_quality || 95
        },
        webhookUrl: `${process.env.NEXTAUTH_URL}/api/webhooks/replicate?type=generation&id=${generation.id}&userId=${session.user.id}`,
        userPlan // Pass user plan for model selection
      }

      console.log(`🚀 Sending generation request to AI provider...`)
      const generationResponse = await aiProvider.generateImage(generationRequest)
      
      console.log(`✅ Generation started with job ID: ${generationResponse.id}`)
      
      // Update generation with job ID and status
      await prisma.generation.update({
        where: { id: generation.id },
        data: {
          jobId: generationResponse.id,
          status: 'PROCESSING'
          // Note: estimatedCompletionTime is a DateTime field, not Int
          // We'll store completion time estimates in a different way if needed
        }
      })

    } catch (generationError) {
      console.error('❌ Error starting generation:', generationError)
      
      // Detailed error logging for debugging
      if (generationError instanceof Error) {
        console.error('Error details:', {
          message: generationError.message,
          stack: generationError.stack,
          modelId: model.id,
          modelUrl: model.modelUrl,
          userId: session.user.id,
          prompt: prompt.substring(0, 100)
        })
      }
      
      // Update generation status to failed with detailed error
      const errorMessage = generationError instanceof Error 
        ? generationError.message 
        : 'Unknown error occurred during generation startup'
      
      await prisma.generation.update({
        where: { id: generation.id },
        data: {
          status: 'FAILED',
          errorMessage,
          completedAt: new Date()
        }
      })
      
      // Refund credits since generation failed
      await updateUserCredits(session.user.id, -creditsNeeded)
      
      // Return specific error instead of generic one
      return NextResponse.json({
        success: false,
        error: `Generation failed: ${errorMessage}`,
        details: {
          errorType: 'GENERATION_START_ERROR',
          modelStatus: model.status,
          hasModelUrl: !!model.modelUrl
        }
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      generation: {
        id: generation.id,
        status: generation.status,
        prompt: generation.prompt,
        variations: generation.variations,
        createdAt: generation.createdAt
      }
    })

  } catch (error: any) {
    console.error('Error creating generation:', error)
    return NextResponse.json(
      { error: 'Failed to create generation' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const modelId = searchParams.get('modelId')

    // This would use the getGenerationsByUserId function
    // For now, return a placeholder response
    return NextResponse.json({
      generations: [],
      pagination: {
        page,
        limit,
        total: 0,
        pages: 0
      }
    })

  } catch (error: any) {
    console.error('Error fetching generations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch generations' },
      { status: 500 }
    )
  }
}