import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { getGenerationsByUserId, searchGenerations } from '@/lib/db/generations'
import { getModelsByUserId } from '@/lib/db/models'
import { getEditHistoryByUserId, searchEditHistory } from '@/lib/db/edit-history'
import { getVideoGenerationsByUserId, searchVideoGenerations } from '@/lib/db/videos'
import { VideoStatus, GenerationStatus } from '@prisma/client'
import { prisma } from '@/lib/db'

/**
 * API endpoint para buscar dados da galeria
 * Usado pela interface AutoSyncGalleryInterface para atualizações automáticas
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()
    const userId = session.user.id

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 20
    const modelFilter = searchParams.get('model') || undefined
    const searchQuery = searchParams.get('search') || undefined
    const sortBy = searchParams.get('sort') || 'newest'
    const tab = searchParams.get('tab') || 'generated'

    // Get user's models
    let models = []
    try {
      models = await getModelsByUserId(userId)
    } catch (error) {
      console.error('Error fetching models for gallery API:', error)
      models = []
    }

    // Get data based on tab
    let generationsData = { generations: [], totalCount: 0 }
    let editHistoryData = { editHistory: [], totalCount: 0 }
    let videosData = { videos: [], totalCount: 0 }

    if (tab === 'edited') {
      // Get edited images from edit_history table
      try {
        if (searchQuery) {
          editHistoryData = await searchEditHistory(userId, searchQuery, page, limit)
        } else {
          editHistoryData = await getEditHistoryByUserId(userId, page, limit)
        }
      } catch (error) {
        console.error('Error fetching edit history for gallery API:', error)
        editHistoryData = { editHistory: [], totalCount: 0 }
      }
    } else if (tab === 'videos') {
      // Get videos from video_generations table - only show completed ones
      try {
        if (searchQuery) {
          videosData = await searchVideoGenerations(userId, searchQuery, page, limit)
        } else {
          videosData = await getVideoGenerationsByUserId(userId, page, limit, VideoStatus.COMPLETED)
        }
      } catch (error) {
        console.error('Error fetching videos for gallery API:', error)
        videosData = { videos: [], totalCount: 0 }
      }
    } else {
      // Get generations (default tab) - only show completed ones
      try {
        if (searchQuery) {
          generationsData = await searchGenerations(userId, searchQuery, page, limit, GenerationStatus.COMPLETED)
        } else {
          generationsData = await getGenerationsByUserId(userId, page, limit, modelFilter, GenerationStatus.COMPLETED)
        }
      } catch (error) {
        console.error('Error fetching generations for gallery API:', error)
        generationsData = { generations: [], totalCount: 0 }
      }
    }

    // Get updated stats based on tab
    let totalCount = 0
    let completedCount = 0
    let currentData = []
    let currentTotalCount = 0

    if (tab === 'edited') {
      currentData = editHistoryData.editHistory
      currentTotalCount = editHistoryData.totalCount
      // For edited images, count from edit_history table
      try {
        totalCount = await prisma.editHistory.count({ where: { userId } })
        completedCount = totalCount // All edit history entries are "completed"
      } catch (error) {
        console.error('Error fetching edit history stats:', error)
        totalCount = editHistoryData.editHistory?.length || 0
        completedCount = totalCount
      }
    } else if (tab === 'videos') {
      currentData = videosData.videos
      currentTotalCount = videosData.totalCount
      // For videos, count only completed ones
      try {
        const completedVideosCount = await prisma.videoGeneration.count({
          where: { userId, status: VideoStatus.COMPLETED }
        })
        totalCount = completedVideosCount
        completedCount = completedVideosCount
      } catch (error) {
        console.error('Error fetching video stats:', error)
        totalCount = videosData.videos?.filter(v => v.status === 'COMPLETED').length || 0
        completedCount = totalCount
      }
    } else {
      currentData = generationsData.generations
      currentTotalCount = generationsData.totalCount
      // For generations, count only completed ones
      try {
        const completedGenerationsCount = await prisma.generation.count({
          where: { userId, status: GenerationStatus.COMPLETED }
        })
        totalCount = completedGenerationsCount
        completedCount = completedGenerationsCount
      } catch (error) {
        console.error('Error fetching generation stats:', error)
        totalCount = generationsData.generations?.filter(g => g.status === 'COMPLETED').length || 0
        completedCount = totalCount
      }
    }

    const stats = {
      totalGenerations: totalCount,
      completedGenerations: completedCount,
      totalImages: completedCount,
      favoriteImages: 0,
      collections: 0
    }

    const pagination = {
      page,
      limit,
      total: currentTotalCount,
      pages: Math.ceil(currentTotalCount / limit)
    }

    // Transform edit history data to match generations format
    const transformedEditHistory = editHistoryData.editHistory.map(edit => ({
      id: edit.id,
      userId: edit.userId,
      status: 'COMPLETED', // All edit history entries are completed
      prompt: `[EDITED] ${edit.prompt}`,
      imageUrls: [edit.editedImageUrl], // Transform single URL to array
      thumbnailUrls: [edit.thumbnailUrl || edit.editedImageUrl], // Use thumbnail or fallback to main image
      createdAt: edit.createdAt,
      updatedAt: edit.updatedAt,
      metadata: edit.metadata,
      operation: edit.operation,
      originalImageUrl: edit.originalImageUrl,
      // Add fields expected by gallery components
      model: { name: `Editor IA - ${edit.operation}` },
      parameters: {
        prompt: edit.prompt,
        operation: edit.operation
      }
    }))

    return NextResponse.json({
      generations: tab === 'generated' ? generationsData.generations :
                  tab === 'edited' ? transformedEditHistory : [],
      editHistory: [], // Keep empty to avoid confusion
      videos: tab === 'videos' ? videosData.videos : [],
      models,
      stats,
      pagination,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Gallery data API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch gallery data' },
      { status: 500 }
    )
  }
}