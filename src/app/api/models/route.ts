import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { getModelsByUserId, canUserCreateModel } from '@/lib/db/models'

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
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const models = await getModelsByUserId(session.user.id)
    
    // Filter by status if provided
    const filteredModels = status 
      ? models.filter(model => model.status === status)
      : models

    // Apply pagination
    const paginatedModels = filteredModels.slice(offset, offset + limit)

    return NextResponse.json({
      models: paginatedModels,
      total: filteredModels.length,
      pagination: {
        limit,
        offset,
        hasMore: (offset + limit) < filteredModels.length
      }
    })

  } catch (error: any) {
    console.error('Error fetching models:', error)
    return NextResponse.json(
      { error: 'Failed to fetch models' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user can create more models
    const canCreate = await canUserCreateModel(session.user.id)
    if (!canCreate) {
      return NextResponse.json(
        { error: 'Model limit reached for your plan' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, class: modelClass, facePhotos, halfBodyPhotos, fullBodyPhotos } = body

    // Validate required fields
    if (!name || !modelClass || !facePhotos || !halfBodyPhotos || !fullBodyPhotos) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate photo counts
    if (facePhotos.length < 4 || facePhotos.length > 8) {
      return NextResponse.json(
        { error: 'Face photos must be between 4-8 images' },
        { status: 400 }
      )
    }

    if (halfBodyPhotos.length < 5 || halfBodyPhotos.length > 10) {
      return NextResponse.json(
        { error: 'Half body photos must be between 5-10 images' },
        { status: 400 }
      )
    }

    if (fullBodyPhotos.length < 10 || fullBodyPhotos.length > 15) {
      return NextResponse.json(
        { error: 'Full body photos must be between 10-15 images' },
        { status: 400 }
      )
    }

    // Here you would typically:
    // 1. Save photos to storage (S3/Cloudinary)
    // 2. Create model in database
    // 3. Queue training job
    // 4. Return model info

    // For now, we'll just return a placeholder response
    return NextResponse.json({
      success: true,
      message: 'Model creation started',
      modelId: 'placeholder-id'
    })

  } catch (error: any) {
    console.error('Error creating model:', error)
    return NextResponse.json(
      { error: 'Failed to create model' },
      { status: 500 }
    )
  }
}