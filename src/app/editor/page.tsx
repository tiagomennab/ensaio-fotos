import { requireActiveSubscription } from '@/lib/subscription'
import { canUserUseCredits } from '@/lib/db/users'
import { ImageEditorInterface } from '@/components/image-editor/image-editor-interface'
import { imageEditor } from '@/lib/ai/image-editor'

interface ImageEditorPageProps {
  searchParams: Promise<{
    image?: string
  }>
}

export default async function ImageEditorPage({ searchParams }: ImageEditorPageProps) {
  const session = await requireActiveSubscription()
  const userId = session.user.id
  
  const params = await searchParams
  const preloadedImageUrl = params.image ? decodeURIComponent(params.image) : undefined

  // Check if user has enough credits for image editing
  const canUseCredits = await canUserUseCredits(userId, 1)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center">
                ✨ Editor IA VibePhoto
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Edite suas fotos com inteligência artificial de última geração
              </p>
              <div className="flex items-center space-x-4 mt-3">
                <div className="flex items-center space-x-2 text-sm text-blue-600">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span>Editor IA Avançado</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-purple-600">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  <span>Qualidade Profissional</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-green-600">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span>Resultados Instantâneos</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Credits Display */}
              <div className="flex items-center space-x-3 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 px-6 py-3 rounded-full border border-orange-500/20">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-gray-700">
                    {session.user.creditsLimit - session.user.creditsUsed} créditos disponíveis
                  </span>
                </div>
                <div className="w-px h-4 bg-gray-300"></div>
                <div className="text-xs text-gray-500 font-medium">
                  {session.user.creditsUsed}/{session.user.creditsLimit} usado
                </div>
              </div>
              
              {/* Plan Badge */}
              <div className="px-3 py-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-semibold rounded-full">
                {session.user.plan}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!canUseCredits ? (
          <div className="bg-white rounded-lg border border-red-200 p-8 text-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚠️</span>
              </div>
              <h2 className="text-xl font-semibold text-red-800 mb-2">
                Créditos Insuficientes
              </h2>
              <p className="text-red-600 mb-4">
                Você precisa de pelo menos 1 crédito para usar o Editor IA.
              </p>
              <a 
                href="/credits" 
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                Comprar Créditos
              </a>
            </div>
          </div>
        ) : (
          <>
            {/* Features Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 mb-8 text-white">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl mb-2">✨</div>
                  <h3 className="font-semibold">Edição Avançada</h3>
                  <p className="text-sm opacity-90">Modifique elementos com precisão</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-2">🎨</div>
                  <h3 className="font-semibold">Blend Inteligente</h3>
                  <p className="text-sm opacity-90">Combine até 3 imagens perfeitamente</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-2">🚀</div>
                  <h3 className="font-semibold">Qualidade Superior</h3>
                  <p className="text-sm opacity-90">Preserva identidade e qualidade</p>
                </div>
              </div>
            </div>

            {/* Image Editor Interface */}
            <ImageEditorInterface preloadedImageUrl={preloadedImageUrl} />
          </>
        )}
      </main>

      {/* Footer Info */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Sobre o Editor IA</h4>
              <p>
                Nossa tecnologia de inteligência artificial permite edições precisas e profissionais.
                Preserve a identidade dos personagens e mantenha consistência em diferentes cenários
                com qualidade superior e resultados naturais.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Operações Suportadas</h4>
              <ul className="space-y-1">
                <li>• Edição com prompts de texto</li>
                <li>• Adição de elementos</li>
                <li>• Remoção inteligente</li>
                <li>• Transferência de estilo</li>
                <li>• Blend avançado (2-3 imagens)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Formatos Suportados</h4>
              <ul className="space-y-1">
                <li>• JPEG / JPG</li>
                <li>• PNG (recomendado)</li>
                <li>• WebP</li>
                <li>• Tamanho máximo: 10MB</li>
                <li>• Processamento na nuvem</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export const metadata = {
  title: 'Editor IA | VibePhoto',
  description: 'Edite suas fotos com inteligência artificial de última geração. VibePhoto oferece edição precisa, blend inteligente e qualidade superior.',
  keywords: ['editor de imagem', 'inteligência artificial', 'IA', 'edição de fotos', 'blend de imagens', 'vibephoto']
}