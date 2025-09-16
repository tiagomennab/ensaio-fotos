import { requireAuth } from '@/lib/auth'
import { getGenerationsByUserId, searchGenerations } from '@/lib/db/generations'
import { getModelsByUserId } from '@/lib/db/models'
import { getVideoGenerationsByUserId, getVideoGenerationStats } from '@/lib/db/videos'
import { AutoSyncGalleryInterface } from '@/components/gallery/auto-sync-gallery-interface'
import { prisma } from '@/lib/db'

interface GalleryPageProps {
  searchParams: Promise<{
    model?: string
    generation?: string
    search?: string
    page?: string
    limit?: string
    sort?: string
    view?: string
    tab?: string
    status?: string
    quality?: string
  }>
}

export default async function GalleryPage({ searchParams }: GalleryPageProps) {
  const session = await requireAuth()
  const userId = session.user.id

  const params = await searchParams
  const page = parseInt(params.page || '1')
  const limit = parseInt(params.limit || '20')
  const modelFilter = params.model
  const searchQuery = params.search
  const sortBy = params.sort || 'newest'
  const viewMode = params.view || 'grid'
  const activeTab = params.tab || 'generated'
  const videoStatus = params.status
  const videoQuality = params.quality

  // Get user's models for filtering with error handling
  let models = []
  try {
    models = await getModelsByUserId(userId)
  } catch (error) {
    console.error('Database error fetching models:', error)
    models = []
  }

  // Get generations based on filters with error handling
  let generationsData = { generations: [], totalCount: 0 }
  try {
    if (searchQuery) {
      generationsData = await searchGenerations(userId, searchQuery, page, limit)
    } else {
      generationsData = await getGenerationsByUserId(userId, page, limit, modelFilter)
    }
  } catch (error) {
    console.error('Database error fetching generations:', error)
    generationsData = { generations: [], totalCount: 0 }
  }

  // Get video data if on videos tab
  let videosData = { videos: [], totalCount: 0 }
  let videoStats = null
  
  if (activeTab === 'videos') {
    try {
      if (searchQuery) {
        // Search videos by prompt
        const { searchVideoGenerations } = await import('@/lib/db/videos')
        videosData = await searchVideoGenerations(userId, searchQuery, page, limit)
      } else {
        // Get videos with status and quality filters
        videosData = await getVideoGenerationsByUserId(
          userId, 
          page, 
          limit, 
          videoStatus as any,
          videoQuality as any
        )
      }
      
      // Get video stats
      videoStats = await getVideoGenerationStats(userId)
    } catch (error) {
      console.error('Database error fetching videos:', error)
      videosData = { videos: [], totalCount: 0 }
      videoStats = {
        totalVideos: 0,
        completedVideos: 0,
        processingVideos: 0,
        failedVideos: 0,
        totalCreditsUsed: 0,
      }
    }
  }

  // Get stats using efficient database queries instead of fetching all data
  let totalCount = 0
  let completedCount = 0
  
  try {
    const results = await Promise.all([
      prisma.generation.count({ where: { userId } }),
      prisma.generation.count({ where: { userId, status: 'COMPLETED' } })
    ])
    totalCount = results[0]
    completedCount = results[1]
  } catch (error) {
    console.error('Database error in gallery stats:', error)
    // Use fallback stats from generationsData
    totalCount = generationsData?.generations?.length || 0
    completedCount = generationsData?.generations?.filter(g => g.status === 'COMPLETED').length || 0
  }
  
  const stats = {
    totalGenerations: totalCount,
    completedGenerations: completedCount,
    totalImages: completedCount, // Simplified - assume 1 image per generation
    favoriteImages: 0, // This would come from a favorites table
    collections: 0 // This would come from collections
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {activeTab === 'videos' ? 'Galeria de Vídeos' : 'Galeria de Fotos'}
              </h1>
              <p className="text-gray-600 mt-1">
                {activeTab === 'videos' 
                  ? 'Navegue e gerencie seus vídeos gerados por IA'
                  : 'Navegue e gerencie suas fotos geradas por IA'
                }
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <a 
                href="/generate" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                🎨 Gerar Nova Foto
              </a>
              <a 
                href="/editor" 
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                ✨ Editor IA
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AutoSyncGalleryInterface
          initialGenerations={generationsData.generations}
          initialVideos={videosData.videos}
          pagination={{
            page,
            limit,
            total: generationsData.totalCount,
            pages: Math.ceil(generationsData.totalCount / limit)
          }}
          videoPagination={{
            page,
            limit,
            total: videosData.totalCount,
            pages: Math.ceil(videosData.totalCount / limit)
          }}
          models={models}
          stats={stats}
          videoStats={videoStats}
          filters={{
            model: modelFilter,
            search: searchQuery,
            sort: sortBy,
            view: viewMode,
            page,
            tab: activeTab
          }}
        />
      </div>
    </div>
  )
}