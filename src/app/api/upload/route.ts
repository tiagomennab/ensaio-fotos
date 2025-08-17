import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getStorageProvider, UPLOAD_PATHS, STORAGE_CONFIG } from '@/lib/storage'
import { z } from 'zod'

const uploadSchema = z.object({
  type: z.enum(['face', 'body', 'generated']),
  modelId: z.string().optional(),
  generateThumbnail: z.boolean().optional().default(false)
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

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string
    const modelId = formData.get('modelId') as string | null
    const generateThumbnail = formData.get('generateThumbnail') === 'true'

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate input
    const validationResult = uploadSchema.safeParse({
      type,
      modelId: modelId || undefined,
      generateThumbnail
    })

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const { type: uploadType, generateThumbnail: shouldGenerateThumbnail } = validationResult.data

    // Get storage provider
    const storage = getStorageProvider()

    // Validate file
    const validation = storage.validateFile(file)
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Determine upload path and processing options
    let uploadPath: string
    let processingOptions: any = {
      generateThumbnail: shouldGenerateThumbnail
    }

    switch (uploadType) {
      case 'face':
        uploadPath = `${session.user.id}/${UPLOAD_PATHS.training.face}`
        processingOptions = {
          ...processingOptions,
          ...STORAGE_CONFIG.processing.face
        }
        break
      case 'body':
        uploadPath = `${session.user.id}/${UPLOAD_PATHS.training.body}`
        processingOptions = {
          ...processingOptions,
          ...STORAGE_CONFIG.processing.body
        }
        break
      case 'generated':
        uploadPath = `${session.user.id}/${UPLOAD_PATHS.generated}`
        processingOptions = {
          ...processingOptions,
          ...STORAGE_CONFIG.processing.generated
        }
        break
      default:
        return NextResponse.json(
          { error: 'Invalid upload type' },
          { status: 400 }
        )
    }

    // Upload file
    const result = await storage.upload(file, uploadPath, processingOptions)

    // Log upload activity (you might want to store this in database)
    console.log(`File uploaded by user ${session.user.id}:`, {
      type: uploadType,
      filename: result.originalName,
      size: result.size,
      url: result.url
    })

    return NextResponse.json({
      success: true,
      data: {
        url: result.url,
        key: result.key,
        thumbnailUrl: result.thumbnailUrl,
        originalName: result.originalName,
        size: result.size,
        mimeType: result.mimeType
      }
    })

  } catch (error) {
    console.error('Upload error:', error)
    
    return NextResponse.json(
      { 
        error: 'Upload failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Handle file deletion
export async function DELETE(request: NextRequest) {
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
    const key = searchParams.get('key')

    if (!key) {
      return NextResponse.json(
        { error: 'File key is required' },
        { status: 400 }
      )
    }

    // Verify the file belongs to the user (basic security check)
    if (!key.startsWith(session.user.id)) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this file' },
        { status: 403 }
      )
    }

    // Get storage provider and delete file
    const storage = getStorageProvider()
    const result = await storage.delete(key)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to delete file', message: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    })

  } catch (error) {
    console.error('Delete error:', error)
    
    return NextResponse.json(
      { 
        error: 'Delete failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}