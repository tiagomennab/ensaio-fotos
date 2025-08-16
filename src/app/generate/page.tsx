import { requireAuth } from '@/lib/auth'
import { getReadyModelsByUserId } from '@/lib/db/models'
import { canUserUseCredits } from '@/lib/db/users'
import { redirect } from 'next/navigation'
import { GenerationInterface } from '@/components/generation/generation-interface'

interface GeneratePageProps {
  searchParams: {
    model?: string
  }
}

export default async function GeneratePage({ searchParams }: GeneratePageProps) {
  const session = await requireAuth()
  const userId = session.user.id

  // Get user's ready models
  const models = await getReadyModelsByUserId(userId)

  // Check if user has any ready models
  if (models.length === 0) {
    redirect('/models?error=no-ready-models')
  }

  // Check if user has enough credits
  const canUseCredits = await canUserUseCredits(userId, 1)
  
  // Select model (from URL param or first available)
  const selectedModelId = searchParams.model && models.find(m => m.id === searchParams.model) 
    ? searchParams.model 
    : models[0].id

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Generate AI Photos</h1>
              <p className="text-gray-600 mt-1">
                Create stunning photos with your custom AI models
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {session.user.creditsUsed}/{session.user.creditsLimit} credits used
              </div>
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full"
                  style={{ 
                    width: `${Math.min((session.user.creditsUsed / session.user.creditsLimit) * 100, 100)}%` 
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <GenerationInterface
          models={models}
          selectedModelId={selectedModelId}
          user={session.user}
          canUseCredits={canUseCredits}
        />
      </div>
    </div>
  )
}