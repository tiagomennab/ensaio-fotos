import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { getGenerationById, updateGenerationStatus } from '@/lib/db/generations'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const generation = await getGenerationById(id, session.user.id)
    
    if (!generation) {
      return NextResponse.json(
        { error: 'Generation not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ generation })

  } catch (error: any) {
    console.error('Error fetching generation:', error)
    return NextResponse.json(
      { error: 'Failed to fetch generation' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { status, imageUrls, thumbnailUrls, errorMessage, processingTime } = body

    const { id } = await params
    
    // Verify user owns the generation
    const existingGeneration = await getGenerationById(id, session.user.id)
    if (!existingGeneration) {
      return NextResponse.json(
        { error: 'Generation not found' },
        { status: 404 }
      )
    }

    const updatedGeneration = await updateGenerationStatus(
      id,
      status,
      imageUrls,
      thumbnailUrls,
      errorMessage,
      processingTime
    )

    return NextResponse.json({ 
      success: true,
      generation: updatedGeneration 
    })

  } catch (error: any) {
    console.error('Error updating generation:', error)
    return NextResponse.json(
      { error: 'Failed to update generation' },
      { status: 500 }
    )
  }
}