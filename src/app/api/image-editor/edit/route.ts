import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { imageEditor } from '@/lib/ai/image-editor'
import { AIError } from '@/lib/ai/base'
import { createEditHistory } from '@/lib/db/edit-history'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse form data
    const formData = await request.formData()
    const image = formData.get('image') as File
    const prompt = formData.get('prompt') as string

    // Validate inputs
    if (!image) {
      return NextResponse.json(
        { error: 'Image file is required' },
        { status: 400 }
      )
    }

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    // Validate file type and size
    if (!imageEditor.isValidImageFile(image)) {
      return NextResponse.json(
        { error: 'Invalid image format. Supported formats: JPEG, PNG, WebP, GIF' },
        { status: 400 }
      )
    }

    if (image.size > imageEditor.getMaxFileSize()) {
      return NextResponse.json(
        { error: 'Image file too large. Maximum size: 10MB' },
        { status: 400 }
      )
    }

    console.log(`🎨 Image edit request from ${session.user.email}:`, {
      filename: image.name,
      size: image.size,
      type: image.type,
      prompt: prompt.substring(0, 100) + '...'
    })

    // Process image edit
    const result = await imageEditor.editImageWithPrompt(image, prompt)

    // Save to edit history database
    let editHistoryEntry = null
    try {
      // Get original image URL from form data or create a placeholder
      const originalImageUrl = formData.get('originalUrl') as string || `data:${image.type};base64,original`

      editHistoryEntry = await createEditHistory({
        userId: session.user.id,
        originalImageUrl: originalImageUrl,
        editedImageUrl: result.resultImage!,
        thumbnailUrl: result.resultImage, // Use the same image as thumbnail
        operation: 'nano_banana_edit',
        prompt: prompt,
        metadata: {
          ...result.metadata,
          originalFileName: image.name,
          fileSize: image.size,
          fileType: image.type,
          processingTime: result.metadata?.processingTime,
          replicateId: result.id
        }
      })

      console.log('✅ Edit history saved:', editHistoryEntry.id)
    } catch (dbError) {
      console.error('❌ Failed to save edit history:', dbError)
      // Don't fail the whole request if DB save fails
    }

    return NextResponse.json({
      success: true,
      data: {
        id: result.id,
        status: result.status,
        resultImage: result.resultImage,
        metadata: result.metadata,
        editHistoryId: editHistoryEntry?.id
      }
    })

  } catch (error) {
    console.error('❌ Image edit API error:', error)

    if (error instanceof AIError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: 'Image Edit API',
    description: 'Edit images using AI with text prompts',
    methods: ['POST'],
    parameters: {
      image: 'File - Image file to edit (max 10MB)',
      prompt: 'String - Text description of desired edit'
    },
    supportedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  })
}