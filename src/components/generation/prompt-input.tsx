'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Lightbulb, Copy, RefreshCw, Sparkles, Wand2, Type, ToggleLeft, ToggleRight } from 'lucide-react'
import { PromptBuilder } from './prompt-builder'

interface PromptInputProps {
  prompt: string
  negativePrompt: string
  onPromptChange: (prompt: string) => void
  onNegativePromptChange: (negativePrompt: string) => void
  isGenerating: boolean
  modelClass?: string
}

export function PromptInput({
  prompt,
  negativePrompt,
  onPromptChange,
  onNegativePromptChange,
  isGenerating,
  modelClass = 'MAN'
}: PromptInputProps) {
  const [showNegativePrompt, setShowNegativePrompt] = useState(false)
  const [isGuidedMode, setIsGuidedMode] = useState(false)

  const promptSuggestions = [
    'professional headshot',
    'casual outdoor photo',
    'elegant portrait',
    'business attire',
    'smiling warmly',
    'natural lighting',
    'studio photography',
    'artistic portrait',
    'cinematic style',
    'editorial look',
    'lifestyle shot',
    'vintage film',
    'black & white',
    'creative pose'
  ]

  const negativePromptSuggestions = [
    'blurry',
    'low quality',
    'distorted',
    'bad anatomy',
    'extra limbs',
    'duplicate',
    'watermark',
    'text',
    'cartoon',
    'cgi',
    '3d render',  
    'unrealistic eyes',
    'plastic skin',
    'distorted hands',
    'extra limbs',
    'anime',
    'wax',
    'smooth'
  ]

  const enhancePrompt = () => {
    if (!prompt.trim()) return
    
    const enhancements = [
      'high quality',
      'detailed',
      'professional photography',
      'natural lighting',
      'sharp focus'
    ]
    
    const randomEnhancements = enhancements
      .sort(() => 0.5 - Math.random())
      .slice(0, 2)
    
    const enhancedPrompt = `${prompt}, ${randomEnhancements.join(', ')}`
    onPromptChange(enhancedPrompt)
  }

  const addSuggestion = (suggestion: string, isNegative = false) => {
    if (isNegative) {
      const current = negativePrompt.trim()
      const newPrompt = current ? `${current}, ${suggestion}` : suggestion
      onNegativePromptChange(newPrompt)
    } else {
      const current = prompt.trim()
      const newPrompt = current ? `${current}, ${suggestion}` : suggestion
      onPromptChange(newPrompt)
    }
  }

  const copyPrompt = () => {
    navigator.clipboard.writeText(prompt)
  }

  const toggleMode = () => {
    setIsGuidedMode(!isGuidedMode)
  }

  const handleGuidedPrompt = (generatedPrompt: string) => {
    onPromptChange(generatedPrompt)
  }

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Type className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">Modo Livre</span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMode}
              className="p-1"
            >
              {isGuidedMode ? (
                <ToggleRight className="w-6 h-6 text-purple-600" />
              ) : (
                <ToggleLeft className="w-6 h-6 text-gray-400" />
              )}
            </Button>

            <div className="flex items-center space-x-2">
              <Wand2 className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-600">Modo Guiado</span>
            </div>
          </div>

          <Badge variant={isGuidedMode ? "default" : "secondary"} className="text-xs">
            {isGuidedMode ? "Blocos Modulares" : "Texto Livre"}
          </Badge>
        </div>

        <p className="text-xs text-gray-600 mt-2">
          {isGuidedMode
            ? "Use blocos pré-montados para construir seu prompt rapidamente"
            : "Digite seu prompt personalizado ou use as sugestões abaixo"
          }
        </p>
      </Card>

      {/* Guided Mode - Prompt Builder */}
      {isGuidedMode ? (
        <PromptBuilder
          onPromptGenerated={handleGuidedPrompt}
          modelClass={modelClass}
        />
      ) : (
        <>
          {/* Free Mode - Manual Input */}
          <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">
            Descrição da Imagem
          </label>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-xs">
              {prompt.length}/1500
            </Badge>
            {prompt && (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onPromptChange('')}
                  className="h-6 px-3 text-red-600 hover:text-red-700 hover:bg-red-50 text-xs"
                  title="Limpar prompt"
                >
                  Limpar
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={copyPrompt}
                  className="h-6 px-2"
                  title="Copiar prompt"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </>
            )}
          </div>
        </div>
        
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          disabled={isGenerating}
          className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          rows={3}
          maxLength={1500}
          placeholder="Descreva a foto que deseja criar... ex: 'professional headshot in business attire, smiling, natural lighting, high quality'"
        />
        
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={enhancePrompt}
              disabled={!prompt.trim() || isGenerating}
            >
              <Sparkles className="w-4 h-4 mr-1" />
              Melhorar
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowNegativePrompt(!showNegativePrompt)}
            >
              <Lightbulb className="w-4 h-4 mr-1" />
              {showNegativePrompt ? 'Ocultar' : 'Mostrar'} Prompt Negativo
            </Button>
          </div>
          
          <p className="text-xs text-gray-500">
            Seja específico para melhores resultados
          </p>
        </div>
      </div>

      {/* Prompt Suggestions */}
      <div>
        <p className="text-sm text-gray-600 mb-2">Sugestões rápidas:</p>
        <div className="flex flex-wrap gap-2">
          {promptSuggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => addSuggestion(suggestion)}
              disabled={isGenerating}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50"
            >
              + {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Negative Prompt */}
      {showNegativePrompt && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="negative-prompt" className="block text-sm font-medium text-gray-700">
              Prompt Negativo
            </label>
            <Badge variant="secondary" className="text-xs">
              {negativePrompt.length}/200
            </Badge>
          </div>
          
          <textarea
            id="negative-prompt"
            value={negativePrompt}
            onChange={(e) => onNegativePromptChange(e.target.value)}
            disabled={isGenerating}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            rows={2}
            maxLength={200}
            placeholder="Coisas a evitar na imagem... ex: 'blurry, low quality, distorted'"
          />
          
          <div className="mt-2">
            <p className="text-sm text-gray-600 mb-2">Exclusões comuns:</p>
            <div className="flex flex-wrap gap-2">
              {negativePromptSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => addSuggestion(suggestion, true)}
                  disabled={isGenerating}
                  className="px-3 py-1 text-sm bg-red-50 hover:bg-red-100 text-red-700 rounded-full transition-colors disabled:opacity-50"
                >
                  + {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
        </>
      )}

      {/* Current Prompt Display (both modes) */}
      {prompt && (
        <Card className="bg-gray-50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-700">Prompt Atual</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyPrompt}
                className="text-gray-500 hover:text-gray-700"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              {prompt}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2 flex items-center">
          <Lightbulb className="w-4 h-4 mr-1" />
          Dicas de Descrição
        </h4>
        <div className="text-sm text-blue-800 space-y-1">
          <p>• Seja específico sobre pose, iluminação, roupas e fundo</p>
          <p>• Use termos fotográficos como "portrait", "studio lighting", "shallow depth of field"</p>
          <p>• Mencione preferências de estilo: "professional", "casual", "artistic", "candid"</p>
          <p>• Adicione modificadores de qualidade: "high resolution", "detailed", "sharp focus"</p>
        </div>
      </div>
    </div>
  )
}