'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Lightbulb, Copy, RefreshCw, Sparkles } from 'lucide-react'

interface PromptInputProps {
  prompt: string
  negativePrompt: string
  onPromptChange: (prompt: string) => void
  onNegativePromptChange: (negativePrompt: string) => void
  isGenerating: boolean
}

export function PromptInput({ 
  prompt, 
  negativePrompt, 
  onPromptChange, 
  onNegativePromptChange,
  isGenerating 
}: PromptInputProps) {
  const [showNegativePrompt, setShowNegativePrompt] = useState(false)

  const promptSuggestions = [
    'professional headshot',
    'casual outdoor photo',
    'elegant portrait',
    'business attire',
    'smiling warmly',
    'natural lighting',
    'studio photography',
    'artistic portrait'
  ]

  const negativePromptSuggestions = [
    'blurry',
    'low quality',
    'distorted',
    'bad anatomy',
    'extra limbs',
    'duplicate',
    'watermark',
    'text'
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

  return (
    <div className="space-y-4">
      {/* Main Prompt */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">
            Prompt
          </label>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-xs">
              {prompt.length}/500
            </Badge>
            {prompt && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={copyPrompt}
                className="h-6 px-2"
              >
                <Copy className="w-3 h-3" />
              </Button>
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
          maxLength={500}
          placeholder="Describe the photo you want to create... e.g., 'professional headshot in business attire, smiling, natural lighting, high quality'"
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
              Enhance
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowNegativePrompt(!showNegativePrompt)}
            >
              <Lightbulb className="w-4 h-4 mr-1" />
              {showNegativePrompt ? 'Hide' : 'Show'} Negative Prompt
            </Button>
          </div>
          
          <p className="text-xs text-gray-500">
            Be specific for better results
          </p>
        </div>
      </div>

      {/* Prompt Suggestions */}
      <div>
        <p className="text-sm text-gray-600 mb-2">Quick suggestions:</p>
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
              Negative Prompt
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
            placeholder="Things to avoid in the image... e.g., 'blurry, low quality, distorted'"
          />
          
          <div className="mt-2">
            <p className="text-sm text-gray-600 mb-2">Common exclusions:</p>
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

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2 flex items-center">
          <Lightbulb className="w-4 h-4 mr-1" />
          Prompt Tips
        </h4>
        <div className="text-sm text-blue-800 space-y-1">
          <p>• Be specific about pose, lighting, clothing, and background</p>
          <p>• Use photography terms like "portrait", "studio lighting", "shallow depth of field"</p>
          <p>• Mention style preferences: "professional", "casual", "artistic", "candid"</p>
          <p>• Add quality modifiers: "high resolution", "detailed", "sharp focus"</p>
        </div>
      </div>
    </div>
  )
}