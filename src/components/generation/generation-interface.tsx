'use client'

import { useState, useEffect } from 'react'
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Play, 
  Sparkles, 
  Settings, 
  Image, 
  Zap,
  Clock,
  RefreshCw,
  Download,
  Heart,
  Share2,
  Copy,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { ModelSelector } from './model-selector'
import { PromptInput } from './prompt-input'
import { GenerationSettings } from './generation-settings'
import { ResultsGallery } from './results-gallery'
import { PromptExamples } from './prompt-examples'
import { ImageModal } from '@/components/gallery/image-modal'

interface GenerationInterfaceProps {
  models: Array<{
    id: string
    name: string
    class: string
    sampleImages: any[]
    qualityScore?: number
  }>
  selectedModelId: string
  user: {
    id: string
    plan: string
    creditsUsed: number
    creditsLimit: number
  }
  canUseCredits: boolean
}

export function GenerationInterface({ 
  models, 
  selectedModelId, 
  user, 
  canUseCredits 
}: GenerationInterfaceProps) {
  const [selectedModel, setSelectedModel] = useState(selectedModelId)
  const [prompt, setPrompt] = useState('')
  const [negativePrompt, setNegativePrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationResults, setGenerationResults] = useState<any[]>([])
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [currentGeneration, setCurrentGeneration] = useState<any>(null)
  
  // Success modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successImageUrl, setSuccessImageUrl] = useState<string | null>(null)
  
  // Toast notifications
  const { addToast } = useToast()

  // Real-time updates for generation status
  useRealtimeUpdates({
    onGenerationStatusChange: (generationId, status, data) => {
      console.log(`🔄 Real-time generation update: ${generationId} -> ${status}`)
      
      // Update current generation if it matches
      if (currentGeneration?.id === generationId) {
        setCurrentGeneration((prev: any) => ({
          ...prev,
          status,
          imageUrls: data.imageUrls || prev.imageUrls,
          thumbnailUrls: data.thumbnailUrls || prev.thumbnailUrls,
          processingTime: data.processingTime || prev.processingTime,
          errorMessage: data.errorMessage || prev.errorMessage
        }))

        // If completed successfully, add to results and show modal
        if (status === 'COMPLETED' && data.imageUrls && data.imageUrls.length > 0) {
          const completedGeneration = { ...currentGeneration, ...data, status }
          
          setGenerationResults(prevResults => [
            completedGeneration,
            ...prevResults
          ])
          
          // Show success toast
          addToast({
            type: 'success',
            title: 'Imagem gerada com sucesso!',
            description: `${data.imageUrls.length} imagem${data.imageUrls.length > 1 ? 's' : ''} criada${data.imageUrls.length > 1 ? 's' : ''} em ${Math.round((data.processingTime || 30000) / 1000)}s`,
            duration: 4000
          })
          
          // Automatically open success modal with first image
          setTimeout(() => {
            setSuccessImageUrl(data.imageUrls[0])
            setShowSuccessModal(true)
            console.log('🎉 Opening success modal for generated image')
          }, 500) // Small delay for better UX
        }

        // Show error message if failed
        if (status === 'FAILED') {
          const errorMessage = data.errorMessage || 'Erro desconhecido na geração'
          addToast({
            type: 'error',
            title: 'Falha na geração de imagem',
            description: errorMessage,
            duration: 6000
          })
        }
      }
    },
    onConnect: () => {
      console.log('✅ Connected to real-time updates')
    },
    onDisconnect: () => {
      console.log('❌ Disconnected from real-time updates')
    }
  })
  
  const [settings, setSettings] = useState({
    aspectRatio: '1:1',
    resolution: '512x512',
    variations: 1,
    strength: 0.8,
    seed: undefined as number | undefined,
    style: 'photographic',
    // FLUX parameters
    steps: undefined as number | undefined,
    guidance_scale: undefined as number | undefined,
    raw_mode: false,
    output_quality: 95,
    safety_tolerance: 2,
    output_format: 'jpg'
  })

  const selectedModelData = models.find(m => m.id === selectedModel)

  const handleGenerate = async () => {
    if (!prompt.trim() || !canUseCredits) return

    setIsGenerating(true)
    setCurrentGeneration(null)

    try {
      const response = await fetch('/api/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          modelId: selectedModel,
          prompt: prompt.trim(),
          negativePrompt: negativePrompt.trim() || undefined,
          ...settings,
          // Ensure FLUX parameters are passed through
          steps: settings.steps,
          guidance_scale: settings.guidance_scale,
          raw_mode: settings.raw_mode,
          output_quality: settings.output_quality,
          safety_tolerance: settings.safety_tolerance,
          output_format: settings.output_format
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setCurrentGeneration(data.generation)
        // Real-time updates will handle status changes via SSE
        console.log('🚀 Generation started, waiting for real-time updates...')
      } else {
        // Display detailed error message
        const errorMessage = data.error || 'Falha ao iniciar geração'
        const errorDetails = data.details ? 
          `\n\nDetalhes: ${data.details.errorType}\nStatus do modelo: ${data.details.modelStatus}\nTem URL do modelo: ${data.details.hasModelUrl ? 'Sim' : 'Não'}` : ''
        
        console.error('Generation failed:', {
          error: data.error,
          details: data.details,
          modelId: selectedModel,
          prompt: prompt.substring(0, 100)
        })
        alert(errorMessage + errorDetails)
      }
    } catch (error) {
      console.error('Generation request error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      alert(`Erro ao iniciar geração: ${errorMessage}`)
    } finally {
      setIsGenerating(false)
    }
  }


  const handlePromptSelect = (selectedPrompt: string) => {
    setPrompt(selectedPrompt)
  }

  const handleManualSync = async (generationId: string) => {
    try {
      const response = await fetch(`/api/generations/${generationId}/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (data.success) {
        // Refresh the current generation status
        const statusResponse = await fetch(`/api/generations/${generationId}`)
        const statusData = await statusResponse.json()

        if (statusData.generation) {
          setCurrentGeneration(statusData.generation)
          
          // If completed, add to results gallery
          if (statusData.generation.status === 'COMPLETED') {
            setGenerationResults(prev => {
              // Avoid duplicates
              const exists = prev.find(g => g.id === statusData.generation.id)
              if (!exists) {
                return [statusData.generation, ...prev]
              }
              return prev
            })
          }
        }
      } else {
        alert(data.error || 'Falha ao sincronizar status da geração')
      }
    } catch (error) {
      console.error('Error syncing generation:', error)
      alert('Erro ao sincronizar status da geração')
    }
  }

  const creditsRemaining = user.creditsLimit - user.creditsUsed
  const canGenerate = prompt.trim() && canUseCredits && !isGenerating && creditsRemaining >= settings.variations

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column - Generation Controls */}
      <div className="lg:col-span-2 space-y-6">
        {/* Model Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sparkles className="w-5 h-5 mr-2" />
              Selecionar Modelo de IA
            </CardTitle>
            <CardDescription>
              Escolha qual modelo de IA usar para geração
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ModelSelector
              models={models}
              selectedModelId={selectedModel}
              onModelSelect={setSelectedModel}
            />
          </CardContent>
        </Card>

        {/* Prompt Input */}
        <Card>
          <CardHeader>
            <CardTitle>Descreva sua Foto</CardTitle>
            <CardDescription>
              Escreva uma descrição detalhada da foto que deseja criar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PromptInput
              prompt={prompt}
              negativePrompt={negativePrompt}
              onPromptChange={setPrompt}
              onNegativePromptChange={setNegativePrompt}
              isGenerating={isGenerating}
            />
          </CardContent>
        </Card>

        {/* Advanced Settings */}
        <Card>
          <CardHeader>
            <CardTitle 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <div className="flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Configurações Avançadas
              </div>
              {showAdvanced ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </CardTitle>
            {showAdvanced && (
              <CardDescription>
                Ajuste fino dos parâmetros de geração
              </CardDescription>
            )}
          </CardHeader>
          {showAdvanced && (
            <CardContent>
              <GenerationSettings
                settings={settings}
                onSettingsChange={setSettings}
                userPlan={user.plan}
              />
            </CardContent>
          )}
        </Card>

        {/* Generate Button */}
        <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              {!canUseCredits && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-800 font-medium">Limite de Créditos Atingido</p>
                  <p className="text-red-700 text-sm">
                    Você usou todos os seus créditos este mês. Faça upgrade do seu plano para continuar gerando.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-center space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{settings.variations}</div>
                  <div className="text-sm text-gray-600">variações</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{settings.variations}</div>
                  <div className="text-sm text-gray-600">créditos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{creditsRemaining}</div>
                  <div className="text-sm text-gray-600">restantes</div>
                </div>
              </div>

              <Button 
                onClick={handleGenerate}
                disabled={!canGenerate}
                size="lg"
                className="w-full max-w-md"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Gerar {settings.variations} Foto{settings.variations > 1 ? 's' : ''}
                  </>
                )}
              </Button>

              {!canGenerate && !isGenerating && (
                <p className="text-sm text-gray-600">
                  {!prompt.trim() 
                    ? 'Digite um prompt para gerar fotos'
                    : !canUseCredits 
                    ? 'Limite de créditos atingido'
                    : creditsRemaining < settings.variations
                    ? `Precisa de ${settings.variations} créditos (você tem ${creditsRemaining})`
                    : 'Pronto para gerar'
                  }
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Current Generation Status */}
        {currentGeneration && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-blue-900">
                    {currentGeneration.status === 'PROCESSING' ? 'Gerando Fotos...' : 'Geração Completa!'}
                  </h3>
                  <p className="text-blue-700 text-sm truncate max-w-md">
                    {currentGeneration.prompt}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {currentGeneration.status === 'PROCESSING' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleManualSync(currentGeneration.id)}
                      className="text-blue-600 border-blue-300 hover:bg-blue-50"
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Sincronizar
                    </Button>
                  )}
                  <div className="text-right">
                    {currentGeneration.status === 'PROCESSING' ? (
                      <div className="flex items-center text-blue-600">
                        <Clock className="w-4 h-4 mr-1 animate-pulse" />
                        <span className="text-sm">~30 segundos</span>
                      </div>
                    ) : (
                      <Badge variant="default">
                        {currentGeneration.imageUrls?.length || 0} imagens
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Right Column - Examples and Results */}
      <div className="space-y-6">

        {/* Prompt Examples */}
        <PromptExamples 
          modelClass={selectedModelData?.class || 'MAN'}
          onPromptSelect={handlePromptSelect}
        />

        {/* Recent Results */}
        {generationResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Image className="w-5 h-5 mr-2" />
                Resultados Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResultsGallery generations={generationResults.slice(0, 6)} />
            </CardContent>
          </Card>
        )}

      </div>

      {/* Success Modal */}
      {showSuccessModal && successImageUrl && (
        <ImageModal
          imageUrl={successImageUrl}
          onClose={() => {
            setShowSuccessModal(false)
            setSuccessImageUrl(null)
          }}
          generations={generationResults}
        />
      )}
    </div>
  )
}