'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Wand2,
  Eye,
  Camera,
  Lightbulb,
  Palette,
  MapPin,
  RotateCcw,
  Copy,
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { PromptBlock, PromptCategory, BuiltPrompt } from '@/types'

interface PromptBuilderProps {
  onPromptGenerated: (prompt: string) => void
  modelClass?: string
}

export function PromptBuilder({ onPromptGenerated, modelClass = 'MAN' }: PromptBuilderProps) {
  const [selectedBlocks, setSelectedBlocks] = useState<PromptBlock[]>([])
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['style', 'quality'])
  const [copiedBlocks, setCopiedBlocks] = useState<string[]>([])

  // Prompt building blocks organized by category
  const promptCategories: PromptCategory[] = [
    {
      name: 'style',
      blocks: [
        { id: 'prof', name: 'Profissional', value: 'professional business headshot, confident expression, office background', category: 'style', isSelected: false },
        { id: 'casual', name: 'Casual', value: 'casual outdoor portrait, natural relaxed pose, comfortable clothing', category: 'style', isSelected: false },
        { id: 'artistic', name: 'Artístico', value: 'artistic portrait, creative composition, expressive mood', category: 'style', isSelected: false },
        { id: 'fashion', name: 'Fashion', value: 'high fashion portrait, stylish outfit, elegant pose', category: 'style', isSelected: false },
        { id: 'lifestyle', name: 'Lifestyle', value: 'lifestyle photography, candid moment, everyday setting', category: 'style', isSelected: false },
      ],
      allowMultiple: false
    },
    {
      name: 'lighting',
      blocks: [
        { id: 'natural', name: 'Natural', value: 'natural daylight, soft window light', category: 'lighting', isSelected: false },
        { id: 'studio', name: 'Studio', value: 'professional studio lighting, controlled illumination', category: 'lighting', isSelected: false },
        { id: 'golden', name: 'Golden Hour', value: 'golden hour sunlight, warm atmospheric light', category: 'lighting', isSelected: false },
        { id: 'dramatic', name: 'Dramática', value: 'dramatic lighting, strong shadows, high contrast', category: 'lighting', isSelected: false },
        { id: 'soft', name: 'Suave', value: 'soft diffused lighting, gentle shadows', category: 'lighting', isSelected: false },
      ],
      allowMultiple: false
    },
    {
      name: 'camera',
      blocks: [
        { id: '85mm', name: '85mm Portrait', value: 'shot on 85mm lens, portrait photography', category: 'camera', isSelected: false },
        { id: '50mm', name: '50mm Standard', value: 'shot on 50mm lens, natural perspective', category: 'camera', isSelected: false },
        { id: '35mm', name: '35mm Wide', value: 'shot on 35mm lens, environmental portrait', category: 'camera', isSelected: false },
        { id: 'macro', name: 'Macro', value: 'macro photography, detailed close-up', category: 'camera', isSelected: false },
      ],
      allowMultiple: false
    },
    {
      name: 'quality',
      blocks: [
        { id: 'ultra', name: 'Ultra Realista', value: 'ultra realistic, photorealistic', category: 'quality', isSelected: false },
        { id: 'sharp', name: 'Sharp Focus', value: 'sharp focus, crisp details', category: 'quality', isSelected: false },
        { id: 'raw', name: 'RAW Photo', value: 'RAW photo style, professional quality', category: 'quality', isSelected: false },
        { id: 'hires', name: 'Alta Resolução', value: 'high resolution, detailed', category: 'quality', isSelected: false },
      ],
      allowMultiple: true
    },
    {
      name: 'mood',
      blocks: [
        { id: 'confident', name: 'Confiante', value: 'confident expression, strong presence', category: 'mood', isSelected: false },
        { id: 'friendly', name: 'Amigável', value: 'warm smile, approachable demeanor', category: 'mood', isSelected: false },
        { id: 'serious', name: 'Sério', value: 'serious expression, professional demeanor', category: 'mood', isSelected: false },
        { id: 'contemplative', name: 'Contemplativo', value: 'thoughtful expression, introspective mood', category: 'mood', isSelected: false },
        { id: 'energetic', name: 'Energético', value: 'energetic pose, dynamic expression', category: 'mood', isSelected: false },
      ],
      allowMultiple: false
    },
    {
      name: 'environment',
      blocks: [
        { id: 'office', name: 'Escritório', value: 'modern office environment, corporate setting', category: 'environment', isSelected: false },
        { id: 'outdoor', name: 'Ar Livre', value: 'outdoor setting, natural background', category: 'environment', isSelected: false },
        { id: 'home', name: 'Casa', value: 'home environment, cozy interior', category: 'environment', isSelected: false },
        { id: 'studio', name: 'Estúdio', value: 'photography studio, neutral background', category: 'environment', isSelected: false },
        { id: 'urban', name: 'Urbano', value: 'urban setting, city background', category: 'environment', isSelected: false },
      ],
      allowMultiple: false
    },
  ]

  const getCategoryIcon = (categoryName: string) => {
    switch (categoryName) {
      case 'style': return <Wand2 className="w-4 h-4" />
      case 'lighting': return <Lightbulb className="w-4 h-4" />
      case 'camera': return <Camera className="w-4 h-4" />
      case 'quality': return <Eye className="w-4 h-4" />
      case 'mood': return <Palette className="w-4 h-4" />
      case 'environment': return <MapPin className="w-4 h-4" />
      default: return <Wand2 className="w-4 h-4" />
    }
  }

  const toggleBlock = (block: PromptBlock) => {
    const category = promptCategories.find(cat => cat.name === block.category)
    if (!category) return

    setSelectedBlocks(prev => {
      if (!category.allowMultiple) {
        // Remove other blocks from the same category
        const filtered = prev.filter(b => b.category !== block.category)
        const isAlreadySelected = prev.some(b => b.id === block.id)

        if (isAlreadySelected) {
          return filtered // Remove this block
        } else {
          return [...filtered, { ...block, isSelected: true }] // Add this block
        }
      } else {
        // Allow multiple selections
        const isAlreadySelected = prev.some(b => b.id === block.id)

        if (isAlreadySelected) {
          return prev.filter(b => b.id !== block.id) // Remove this block
        } else {
          return [...prev, { ...block, isSelected: true }] // Add this block
        }
      }
    })
  }

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryName)
        ? prev.filter(cat => cat !== categoryName)
        : [...prev, categoryName]
    )
  }

  const generatePrompt = () => {
    if (selectedBlocks.length === 0) return ''

    // Add gender prefix based on model class
    const genderPrefix = modelClass.toLowerCase().includes('woman') || modelClass.toLowerCase().includes('girl')
      ? 'Beautiful woman, '
      : 'Handsome man, '

    // Combine selected block values
    const combinedPrompt = selectedBlocks
      .map(block => block.value)
      .join(', ')

    const fullPrompt = genderPrefix + combinedPrompt

    return fullPrompt
  }

  const handleGeneratePrompt = () => {
    const prompt = generatePrompt()
    if (prompt) {
      onPromptGenerated(prompt)

      // Show feedback
      setCopiedBlocks(selectedBlocks.map(b => b.id))
      setTimeout(() => setCopiedBlocks([]), 2000)
    }
  }

  const handleCopyPrompt = () => {
    const prompt = generatePrompt()
    if (prompt) {
      navigator.clipboard.writeText(prompt)
      setCopiedBlocks(selectedBlocks.map(b => b.id))
      setTimeout(() => setCopiedBlocks([]), 2000)
    }
  }

  const clearAll = () => {
    setSelectedBlocks([])
  }

  const currentPrompt = generatePrompt()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Prompt Builder</h3>
          <p className="text-sm text-gray-600">Construa seu prompt selecionando blocos pré-montados</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={clearAll}
            disabled={selectedBlocks.length === 0}
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Limpar
          </Button>
        </div>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {promptCategories.map((category) => (
          <Card key={category.name} className="relative">
            <CardHeader
              className="cursor-pointer pb-3"
              onClick={() => toggleCategory(category.name)}
            >
              <CardTitle className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  {getCategoryIcon(category.name)}
                  <span className="capitalize">{category.name}</span>
                  {!category.allowMultiple && (
                    <Badge variant="outline" className="text-xs">
                      Único
                    </Badge>
                  )}
                </div>
                {expandedCategories.includes(category.name) ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </CardTitle>
            </CardHeader>

            {expandedCategories.includes(category.name) && (
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {category.blocks.map((block) => {
                    const isSelected = selectedBlocks.some(b => b.id === block.id)
                    const isCopied = copiedBlocks.includes(block.id)

                    return (
                      <Button
                        key={block.id}
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleBlock(block)}
                        className={`w-full justify-start text-left h-auto py-2 px-3 ${
                          isSelected ? 'bg-purple-600 hover:bg-purple-700' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-sm">{block.name}</span>
                          {isCopied && <Check className="w-3 h-3 text-green-500" />}
                        </div>
                      </Button>
                    )
                  })}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Selected Blocks Preview */}
      {selectedBlocks.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Blocos Selecionados ({selectedBlocks.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedBlocks.map((block) => (
                <Badge
                  key={block.id}
                  variant="secondary"
                  className="cursor-pointer hover:bg-red-100 hover:text-red-800"
                  onClick={() => toggleBlock(block)}
                >
                  {block.name} ×
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated Prompt Preview */}
      {currentPrompt && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Prompt Gerado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-800 leading-relaxed">
                {currentPrompt}
              </p>
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={handleGeneratePrompt}
                className="flex-1"
                disabled={selectedBlocks.length === 0}
              >
                <Wand2 className="w-4 h-4 mr-2" />
                Usar Este Prompt
              </Button>

              <Button
                variant="outline"
                onClick={handleCopyPrompt}
                disabled={selectedBlocks.length === 0}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4">
          <div className="text-sm text-blue-800">
            <h4 className="font-semibold mb-2">Como usar:</h4>
            <ul className="space-y-1 text-xs">
              <li>• Selecione um bloco de cada categoria (exceto "Quality" que permite múltiplos)</li>
              <li>• O prompt será gerado automaticamente combinando suas seleções</li>
              <li>• Clique em "Usar Este Prompt" para aplicar no campo de prompt</li>
              <li>• Use "Limpar" para recomeçar a seleção</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}