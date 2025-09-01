import { requireAuth } from '@/lib/auth'
import { getGenerationsByUserId, searchGenerations } from '@/lib/db/generations'
import { getModelsByUserId } from '@/lib/db/models'
import { GalleryInterface } from '@/components/gallery/gallery-interface'

interface GalleryPageProps {
  searchParams: Promise<{
    model?: string
    generation?: string
    search?: string
    page?: string
    sort?: string
    view?: string
  }>
}

export default async function GalleryPage({ searchParams }: GalleryPageProps) {
  const session = await requireAuth()
  const userId = session.user.id

  const params = await searchParams
  const page = parseInt(params.page || '1')
  const limit = 20
  const modelFilter = params.model
  const searchQuery = params.search
  const sortBy = params.sort || 'newest'
  const viewMode = params.view || 'grid'

  // Get user's models for filtering
  const models = await getModelsByUserId(userId)

  // Get generations based on filters
  let generationsData
  if (searchQuery) {
    generationsData = await searchGenerations(userId, searchQuery, page, limit)
  } else {
    generationsData = await getGenerationsByUserId(userId, page, limit, modelFilter)
  }

  // Get all successful generations for stats
  const allGenerations = await getGenerationsByUserId(userId, 1, 1000)
  const completedGenerations = allGenerations.generations.filter(g => g.status === 'COMPLETED')
  
  const stats = {
    totalGenerations: allGenerations.generations.length,
    completedGenerations: completedGenerations.length,
    totalImages: completedGenerations.reduce((acc, gen) => acc + gen.imageUrls.length, 0),
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
              <h1 className="text-3xl font-bold text-gray-900">Galeria de Fotos</h1>
              <p className="text-gray-600 mt-1">
                Navegue e gerencie suas fotos geradas por IA
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {stats.totalImages} fotos em {stats.completedGenerations} gerações
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <GalleryInterface
          generations={generationsData.generations}
          pagination={generationsData.pagination}
          models={models}
          stats={stats}
          filters={{
            model: modelFilter,
            search: searchQuery,
            sort: sortBy,
            view: viewMode,
            page
          }}
        />
      </div>
    </div>
  )
}