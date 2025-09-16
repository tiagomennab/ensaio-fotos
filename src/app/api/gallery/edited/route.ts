import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getEditHistoryByUserId, searchEditHistory } from '@/lib/db/edit-history'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const { searchParams } = new URL(request.url)

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search')
    const operation = searchParams.get('operation')

    let result

    if (search) {
      result = await searchEditHistory(userId, search, page, limit)
    } else {
      const filters = operation ? { operation } : undefined
      result = await getEditHistoryByUserId(userId, page, limit, filters)
    }

    return NextResponse.json({
      success: true,
      data: result.editHistory.map(item => ({
        id: item.id,
        imageUrl: item.editedImageUrl,
        thumbnailUrl: item.thumbnailUrl || item.editedImageUrl,
        prompt: item.prompt,
        operation: item.operation,
        originalImageUrl: item.originalImageUrl,
        createdAt: item.createdAt,
        metadata: item.metadata
      })),
      pagination: result.pagination,
      totalCount: result.totalCount
    })

  } catch (error) {
    console.error('❌ Error fetching edited images:', error)
    return NextResponse.json(
      { error: 'Failed to fetch edited images' },
      { status: 500 }
    )
  }
}