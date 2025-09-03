import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createGeneration } from '@/lib/db/generations'
import { canUserUseCredits, updateUserCredits } from '@/lib/db/users'
import { getModelById } from '@/lib/db/models'
import { getAIProvider } from '@/lib/ai'
import { prisma } from '@/lib/db'

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
      style = 'photographic'
    } = body

    // Validate required fields
    if (!modelId || !prompt) {
      return NextResponse.json(
        { error: 'Missing required fields: modelId and prompt' },
        { status: 400 }
      )
    }

    // Validate prompt length
    if (prompt.length > 500) {
      return NextResponse.json(
        { error: 'Prompt must be 500 characters or less' },
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

    // Check if user has enough credits
    const creditsNeeded = variations
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

      // Build generation request
      const generationRequest = {
        modelUrl: model.modelUrl!, // We know it's ready so modelUrl exists
        prompt,
        negativePrompt,
        params: {
          width,
          height,
          steps: 20, // Default FLUX steps
          guidance_scale: 7.5,
          num_outputs: variations,
          seed: seed || Math.floor(Math.random() * 1000000)
        },
        webhookUrl: `${process.env.NEXTAUTH_URL}/api/webhooks/generation`
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
      
      // Update generation status to failed
      await prisma.generation.update({
        where: { id: generation.id },
        data: {
          status: 'FAILED',
          errorMessage: generationError instanceof Error ? generationError.message : 'Generation failed to start'
        }
      })
      
      // Refund credits since generation failed
      await updateUserCredits(session.user.id, -creditsNeeded)
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