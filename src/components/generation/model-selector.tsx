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
    const iconClass = "w-3 h-3"
    
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
      MAN: 'Homem',
      WOMAN: 'Mulher',
      BOY: 'Menino',
      GIRL: 'Menina',
      ANIMAL: 'Animal'
    }
    return labels[modelClass as keyof typeof labels] || modelClass
  }

  return (
    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
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
          <CardContent className="p-2">
            <div className="space-y-1.5">
              {/* Model Preview */}
              <div className="aspect-square bg-gray-100 rounded-md overflow-hidden relative">
                {model.sampleImages.length > 0 ? (
                  <img
                    src={model.sampleImages[0]}
                    alt={`${model.name} sample`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {getClassIcon(model.class)}
                  </div>
                )}
                
                {/* Selected Indicator Badge */}
                {selectedModelId === model.id && (
                  <div className="absolute top-1 right-1">
                    <CheckCircle className="w-4 h-4 text-purple-600 bg-white rounded-full" />
                  </div>
                )}
              </div>

              {/* Model Info */}
              <div className="space-y-0.5">
                <h3 className="font-medium text-xs text-gray-900 truncate">
                  {model.name}
                </h3>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-0.5">
                    {getClassIcon(model.class)}
                    <span className="text-xs text-gray-600">
                      {getClassLabel(model.class)}
                    </span>
                  </div>

                  {/* Quality Score */}
                  {model.qualityScore && (
                    <Badge variant="secondary" className="text-xs px-1 py-0 h-4 text-xs">
                      {Math.round(model.qualityScore * 100)}%
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}