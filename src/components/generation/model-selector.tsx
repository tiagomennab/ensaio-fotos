'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, Users, Heart, CheckCircle } from 'lucide-react'

interface ModelSelectorProps {
  models: Array<{
    id: string
    name: string
    class: string
    sampleImages: any[]
    qualityScore?: number
  }>
  selectedModelId: string
  onModelSelect: (modelId: string) => void
}

export function ModelSelector({ models, selectedModelId, onModelSelect }: ModelSelectorProps) {
  const getClassIcon = (modelClass: string) => {
    const iconClass = "w-5 h-5"
    
    switch (modelClass) {
      case 'MAN':
      case 'WOMAN':
        return <User className={iconClass} />
      case 'BOY':
      case 'GIRL':
        return <Users className={iconClass} />
      case 'ANIMAL':
        return <Heart className={iconClass} />
      default:
        return <User className={iconClass} />
    }
  }

  const getClassLabel = (modelClass: string) => {
    const labels = {
      MAN: 'Man',
      WOMAN: 'Woman',
      BOY: 'Boy',
      GIRL: 'Girl',
      ANIMAL: 'Animal'
    }
    return labels[modelClass as keyof typeof labels] || modelClass
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {models.map((model) => (
        <Card
          key={model.id}
          className={`cursor-pointer transition-all hover:shadow-md ${
            selectedModelId === model.id
              ? 'ring-2 ring-purple-500 border-purple-200 bg-purple-50'
              : 'hover:border-gray-300'
          }`}
          onClick={() => onModelSelect(model.id)}
        >
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              {/* Model Preview */}
              <div className="flex-shrink-0">
                {model.sampleImages.length > 0 ? (
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={model.sampleImages[0]}
                      alt={`${model.name} sample`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    {getClassIcon(model.class)}
                  </div>
                )}
              </div>

              {/* Model Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {model.name}
                  </h3>
                  {selectedModelId === model.id && (
                    <CheckCircle className="w-4 h-4 text-purple-600 flex-shrink-0" />
                  )}
                </div>
                
                <div className="flex items-center space-x-2 mb-2">
                  {getClassIcon(model.class)}
                  <span className="text-sm text-gray-600">
                    {getClassLabel(model.class)}
                  </span>
                </div>

                {/* Quality Score */}
                {model.qualityScore && (
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">Quality:</span>
                    <Badge variant="secondary" className="text-xs">
                      {Math.round(model.qualityScore * 100)}%
                    </Badge>
                  </div>
                )}

                {/* Sample Images Grid */}
                {model.sampleImages.length > 1 && (
                  <div className="grid grid-cols-3 gap-1 mt-2">
                    {model.sampleImages.slice(1, 4).map((image: string, index: number) => (
                      <div key={index} className="aspect-square bg-gray-100 rounded overflow-hidden">
                        <img
                          src={image}
                          alt={`Sample ${index + 2}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Selected Indicator */}
            {selectedModelId === model.id && (
              <div className="mt-3 pt-3 border-t border-purple-200">
                <div className="flex items-center text-purple-600 text-sm">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Selected for generation
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}