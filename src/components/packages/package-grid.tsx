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
  prompts: string[]
  previewImages: string[]
  price: number
  isPremium: boolean
  estimatedTime: string
  popularity: number
  rating: number
  uses: number
  tags: string[]
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
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No packages found</h3>
        <p className="text-gray-600">
          Try adjusting your search or filters to find what you're looking for
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {packages.map((pkg) => (
        <Card key={pkg.id} className="group hover:shadow-lg transition-shadow cursor-pointer relative overflow-hidden">
          {/* Premium Badge */}
          {pkg.isPremium && (
            <div className="absolute top-3 right-3 z-10">
              <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900">
                <Crown className="w-3 h-3 mr-1" />
                Premium
              </Badge>
            </div>
          )}

          {/* Preview Images Grid */}
          <div className="aspect-[4/3] overflow-hidden bg-gray-100">
            <div className="grid grid-cols-2 h-full">
              {pkg.previewImages.slice(0, 4).map((image, index) => (
                <div key={index} className="relative overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <span className="text-2xl opacity-50">
                      {getCategoryIcon(pkg.category)}
                    </span>
                  </div>
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />
                </div>
              ))}
            </div>
            
            {/* View overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
              <Button
                variant="secondary"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onPackageSelect(pkg)}
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview Package
              </Button>
            </div>
          </div>

          <CardContent className="p-4">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                    {pkg.name}
                  </h3>
                  <Badge variant="secondary" className={getCategoryColor(pkg.category)}>
                    {pkg.category.toLowerCase()}
                  </Badge>
                </div>
                
                <p className="text-sm text-gray-600 line-clamp-2">
                  {pkg.description}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
              <div className="flex items-center">
                <Star className="w-3 h-3 mr-1 text-yellow-500" />
                {pkg.rating}
              </div>
              <div className="flex items-center">
                <Users className="w-3 h-3 mr-1" />
                {pkg.uses.toLocaleString()}
              </div>
              <div className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {pkg.estimatedTime}
              </div>
              {pkg.popularity > 90 && (
                <div className="flex items-center text-orange-500">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Hot
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 mb-4">
              {pkg.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
              {pkg.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{pkg.tags.length - 3}
                </Badge>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-lg font-bold text-gray-900">
                  ${pkg.price}
                </span>
                <span className="text-sm text-gray-500 ml-1">
                  {pkg.prompts.length} prompts
                </span>
              </div>
              
              <Button
                size="sm"
                onClick={() => onPackageSelect(pkg)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {pkg.isPremium ? 'Unlock' : 'Use Now'}
              </Button>
            </div>

            {/* Progress indicator for popular packages */}
            {pkg.popularity > 85 && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>Popularity</span>
                  <span>{pkg.popularity}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-1 rounded-full transition-all duration-300"
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