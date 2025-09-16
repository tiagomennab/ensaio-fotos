'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Crown, 
  Star, 
  Users, 
  Clock, 
  Eye,
  Sparkles,
  TrendingUp
} from 'lucide-react'

interface Package {
  id: string
  name: string
  category: string
  description: string
  promptCount: number
  previewImages: string[]
  price: number
  isPremium: boolean
  estimatedTime: string
  popularity: number
  rating: number
  uses: number
  tags: string[]
  features?: string[]
}

interface PackageGridProps {
  packages: Package[]
  onPackageSelect: (pkg: Package) => void
}

export function PackageGrid({ packages, onPackageSelect }: PackageGridProps) {
  const getCategoryColor = (category: string) => {
    const colors = {
      PROFESSIONAL: 'bg-blue-100 text-blue-800',
      SOCIAL: 'bg-pink-100 text-pink-800',
      FANTASY: 'bg-purple-100 text-purple-800',
      ARTISTIC: 'bg-green-100 text-green-800'
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'PROFESSIONAL':
        return '👔'
      case 'SOCIAL':
        return '📱'
      case 'FANTASY':
        return '🏰'
      case 'ARTISTIC':
        return '🎨'
      default:
        return '📦'
    }
  }

  if (packages.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Nenhum pacote encontrado</h3>
        <p className="text-gray-400">
          Tente ajustar sua busca ou filtros para encontrar o que você está procurando
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {packages.map((pkg) => (
        <Card key={pkg.id} className="group bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer relative overflow-hidden backdrop-blur-sm">
          {/* Premium Badge */}
          {pkg.isPremium && (
            <div className="absolute top-3 right-3 z-10">
              <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 text-yellow-900 shadow-lg">
                <Crown className="w-3 h-3 mr-1" />
                Premium
              </Badge>
            </div>
          )}

          {/* Preview Images Grid */}
          <div className="aspect-[4/3] overflow-hidden bg-gray-900">
            <div className="grid grid-cols-2 h-full">
              {pkg.previewImages.slice(0, 4).map((image, index) => (
                <div key={index} className="relative overflow-hidden">
                  <img
                    src={image}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      e.currentTarget.nextElementSibling?.classList.remove('hidden')
                    }}
                  />
                  <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center hidden">
                    <span className="text-2xl opacity-50">
                      {getCategoryIcon(pkg.category)}
                    </span>
                  </div>
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent group-hover:from-black/60 transition-all duration-300" />
                </div>
              ))}
            </div>
            
            {/* View overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
              <Button
                variant="secondary"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/90 text-gray-900 hover:bg-white hover:scale-105"
                onClick={() => onPackageSelect(pkg)}
              >
                <Eye className="w-4 h-4 mr-2" />
                Ver Pacote
              </Button>
            </div>
          </div>

          <CardContent className="p-4">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-white group-hover:text-blue-300 transition-colors">
                    {pkg.name}
                  </h3>
                  <Badge variant="secondary" className={`${getCategoryColor(pkg.category)} bg-opacity-20 border border-current`}>
                    {pkg.category.toLowerCase()}
                  </Badge>
                </div>
                
                <p className="text-sm text-gray-300 line-clamp-2">
                  {pkg.description}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
              <div className="flex items-center">
                <Star className="w-3 h-3 mr-1 text-yellow-400" />
                <span className="text-gray-300">{pkg.rating}</span>
              </div>
              <div className="flex items-center">
                <Users className="w-3 h-3 mr-1 text-gray-400" />
                <span className="text-gray-300">{pkg.uses.toLocaleString()}</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-3 h-3 mr-1 text-gray-400" />
                <span className="text-gray-300">{pkg.estimatedTime}</span>
              </div>
              {pkg.popularity > 90 && (
                <div className="flex items-center text-orange-400">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  <span>Popular</span>
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 mb-4">
              {pkg.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600/50">
                  #{tag}
                </Badge>
              ))}
              {pkg.tags.length > 3 && (
                <Badge variant="outline" className="text-xs bg-gray-700/50 border-gray-600 text-gray-300">
                  +{pkg.tags.length - 3}
                </Badge>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-lg font-bold text-white">
                  R$ {pkg.price}
                </span>
                {pkg.features && (
                  <div className="text-xs text-gray-400 mt-1">
                    {pkg.features[0]} {/* Show first feature which is '20 fotos geradas' */}
                  </div>
                )}
              </div>
              
              <Button
                size="sm"
                onClick={() => onPackageSelect(pkg)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
              >
                Comprar Agora
              </Button>
            </div>

            {/* Progress indicator for popular packages */}
            {pkg.popularity > 85 && (
              <div className="mt-3 pt-3 border-t border-gray-700">
                <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                  <span>Popularidade</span>
                  <span className="text-gray-300">{pkg.popularity}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-1 rounded-full transition-all duration-300 shadow-sm"
                    style={{ width: `${pkg.popularity}%` }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}