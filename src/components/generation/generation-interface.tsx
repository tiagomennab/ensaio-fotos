'use client'

import { useState, useEffect } from 'react'
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
  
  const [settings, setSettings] = useState({
    aspectRatio: '1:1',
    resolution: '512x512',
    variations: 1,
    strength: 0.8,
    seed: undefined as number | undefined,
    style: 'photographic'
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
          ...settings
        }),
      })

      const data = await response.json()

      if (data.success) {
        setCurrentGeneration(data.generation)
        // Poll for results
        pollGenerationStatus(data.generation.id)
      } else {
        alert(data.error || 'Failed to start generation')
      }
    } catch (error) {
      alert('Error starting generation')
    } finally {
      setIsGenerating(false)
    }
  }

  const pollGenerationStatus = async (generationId: string) => {
    const maxAttempts = 60 // 5 minutes
    let attempts = 0

    const poll = async () => {
      try {
        const response = await fetch(`/api/generations/${generationId}`)
        const data = await response.json()

        if (data.generation) {
          setCurrentGeneration(data.generation)

          if (data.generation.status === 'COMPLETED') {
            setGenerationResults(prev => [data.generation, ...prev])
            return
          }

          if (data.generation.status === 'FAILED') {
            alert('Generation failed: ' + (data.generation.errorMessage || 'Unknown error'))
            return
          }

          // Continue polling if still processing
          if (data.generation.status === 'PROCESSING' && attempts < maxAttempts) {
            attempts++
            setTimeout(poll, 5000) // Poll every 5 seconds
          }
        }
      } catch (error) {
        console.error('Error polling generation status:', error)
      }
    }

    poll()
  }

  const handlePromptSelect = (selectedPrompt: string) => {
    setPrompt(selectedPrompt)
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
              Select AI Model
            </CardTitle>
            <CardDescription>
              Choose which AI model to use for generation
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
            <CardTitle>Describe Your Photo</CardTitle>
            <CardDescription>
              Write a detailed description of the photo you want to create
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
                Advanced Settings
              </div>
              {showAdvanced ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </CardTitle>
            {showAdvanced && (
              <CardDescription>
                Fine-tune your generation parameters
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
                  <p className="text-red-800 font-medium">Credits Limit Reached</p>
                  <p className="text-red-700 text-sm">
                    You've used all your credits for this month. Upgrade your plan to continue generating.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-center space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{settings.variations}</div>
                  <div className="text-sm text-gray-600">variations</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{settings.variations}</div>
                  <div className="text-sm text-gray-600">credits</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{creditsRemaining}</div>
                  <div className="text-sm text-gray-600">remaining</div>
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
                    Generating...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Generate {settings.variations} Photo{settings.variations > 1 ? 's' : ''}
                  </>
                )}
              </Button>

              {!canGenerate && !isGenerating && (
                <p className="text-sm text-gray-600">
                  {!prompt.trim() 
                    ? 'Enter a prompt to generate photos'
                    : !canUseCredits 
                    ? 'Credit limit reached'
                    : creditsRemaining < settings.variations
                    ? `Need ${settings.variations} credits (you have ${creditsRemaining})`
                    : 'Ready to generate'
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
                    {currentGeneration.status === 'PROCESSING' ? 'Generating Photos...' : 'Generation Complete!'}
                  </h3>
                  <p className="text-blue-700 text-sm truncate max-w-md">
                    {currentGeneration.prompt}
                  </p>
                </div>
                <div className="text-right">
                  {currentGeneration.status === 'PROCESSING' ? (
                    <div className="flex items-center text-blue-600">
                      <Clock className="w-4 h-4 mr-1 animate-pulse" />
                      <span className="text-sm">~30 seconds</span>
                    </div>
                  ) : (
                    <Badge variant="default">
                      {currentGeneration.imageUrls?.length || 0} images
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Right Column - Examples and Results */}
      <div className="space-y-6">
        {/* Model Info */}
        {selectedModelData && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{selectedModelData.name}</CardTitle>
              <CardDescription className="capitalize">
                {selectedModelData.class.toLowerCase()} model
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedModelData.qualityScore && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>Quality Score</span>
                    <span>{Math.round(selectedModelData.qualityScore * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${selectedModelData.qualityScore * 100}%` }}
                    />
                  </div>
                </div>
              )}
              
              {selectedModelData.sampleImages.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Sample Results</p>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedModelData.sampleImages.slice(0, 4).map((image: string, index: number) => (
                      <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={image}
                          alt={`Sample ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

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
                Recent Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResultsGallery generations={generationResults.slice(0, 6)} />
            </CardContent>
          </Card>
        )}

        {/* Credits Info */}
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-800">
              <Zap className="w-5 h-5 mr-2" />
              Credits Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-yellow-700">Used this month</span>
                <span className="font-semibold text-yellow-900">
                  {user.creditsUsed}/{user.creditsLimit}
                </span>
              </div>
              
              <div className="w-full bg-yellow-200 rounded-full h-2">
                <div
                  className="bg-yellow-600 h-2 rounded-full"
                  style={{ 
                    width: `${Math.min((user.creditsUsed / user.creditsLimit) * 100, 100)}%` 
                  }}
                />
              </div>

              <div className="text-sm text-yellow-700 space-y-1">
                <p>• Each generation costs 1 credit per variation</p>
                <p>• Credits reset monthly on your billing cycle</p>
                {user.plan === 'FREE' && (
                  <p>• Upgrade to Premium for 100 credits/month</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}