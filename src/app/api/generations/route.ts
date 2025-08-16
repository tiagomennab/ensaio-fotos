import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { createGeneration } from '@/lib/db/generations'
import { canUserUseCredits, updateUserCredits } from '@/lib/db/users'
import { getModelById } from '@/lib/db/models'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
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

    // Here you would typically:
    // 1. Queue the generation job
    // 2. Call AI service API (Replicate, RunPod, etc.)
    // 3. Update generation status asynchronously
    
    // For now, we'll simulate the process
    setTimeout(async () => {
      try {
        // Simulate generation completion after 30 seconds
        // In a real implementation, this would be handled by webhooks
        // or a background job processor
        
        // Mock generated image URLs
        const mockImageUrls = Array.from({ length: variations }, (_, i) => 
          `https://picsum.photos/512/512?random=${Date.now() + i}`
        )
        
        const mockThumbnailUrls = mockImageUrls.map(url => url.replace('512', '256'))
        
        // Update generation with results (this would be in a separate API endpoint)
        // await updateGenerationStatus(
        //   generation.id,
        //   'COMPLETED',
        //   mockImageUrls,
        //   mockThumbnailUrls,
        //   undefined,
        //   30000 // 30 seconds processing time
        // )
      } catch (error) {
        console.error('Error completing generation:', error)
      }
    }, 30000)

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