'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Download, 
  Heart, 
  Share2, 
  Eye, 
  MoreHorizontal,
  Clock,
  CheckCircle,
  AlertCircle,
  Check
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface GalleryGridProps {
  generations: any[]
  bulkSelectMode: boolean
  selectedImages: string[]
  onImageSelect: (imageUrl: string) => void
  onImageClick: (imageUrl: string) => void
}

export function GalleryGrid({ 
  generations, 
  bulkSelectMode, 
  selectedImages, 
  onImageSelect, 
  onImageClick 
}: GalleryGridProps) {
  const [hoveredImage, setHoveredImage] = useState<string | null>(null)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'PROCESSING':
        return <Clock className="w-4 h-4 text-yellow-500 animate-pulse" />
      case 'FAILED':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'PROCESSING':
        return 'bg-yellow-100 text-yellow-800'
      case 'FAILED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleImageAction = (action: string, imageUrl: string, generation: any) => {
    switch (action) {
      case 'download':
        const link = document.createElement('a')
        link.href = imageUrl
        link.download = `generated-${generation.prompt.slice(0, 20).replace(/[^a-zA-Z0-9]/g, '_')}.jpg`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        break
      case 'share':
        if (navigator.share) {
          navigator.share({
            title: 'AI Generated Photo',
            text: generation.prompt,
            url: imageUrl
          })
        } else {
          navigator.clipboard.writeText(imageUrl)
          alert('Image URL copied to clipboard!')
        }
        break
      case 'favorite':
        // Implement favorite functionality
        console.log('Favorite:', imageUrl)
        break
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {generations.map((generation) => (
        <div key={generation.id}>
          {/* Generation Header */}
          <div className="mb-3 p-3 bg-white rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                {getStatusIcon(generation.status)}
                <Badge variant="secondary" className={getStatusColor(generation.status)}>
                  {generation.status}
                </Badge>
              </div>
              <span className="text-xs text-gray-500">
                {formatDate(generation.createdAt)}
              </span>
            </div>
            
            <p className="text-sm text-gray-700 truncate" title={generation.prompt}>
              {generation.prompt}
            </p>
            
            {generation.model && (
              <p className="text-xs text-gray-500 mt-1">
                Model: {generation.model.name}
              </p>
            )}
          </div>

          {/* Images Grid */}
          {generation.status === 'COMPLETED' && generation.imageUrls.length > 0 ? (
            <div className={`grid gap-2 ${
              generation.imageUrls.length === 1 ? 'grid-cols-1' :
              generation.imageUrls.length === 2 ? 'grid-cols-2' :
              generation.imageUrls.length === 3 ? 'grid-cols-2' :
              'grid-cols-2'
            }`}>
              {generation.imageUrls.map((imageUrl: string, index: number) => (
                <div
                  key={index}
                  className={`relative group cursor-pointer ${
                    generation.imageUrls.length === 3 && index === 0 ? 'col-span-2' : ''
                  }`}
                  onMouseEnter={() => setHoveredImage(imageUrl)}
                  onMouseLeave={() => setHoveredImage(null)}
                >
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={generation.thumbnailUrls?.[index] || imageUrl}
                      alt={`Generated image ${index + 1}`}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      onClick={() => bulkSelectMode ? onImageSelect(imageUrl) : onImageClick(imageUrl)}
                    />
                  </div>

                  {/* Bulk Select Checkbox */}
                  {bulkSelectMode && (
                    <div className="absolute top-2 left-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onImageSelect(imageUrl)
                        }}
                        className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                          selectedImages.includes(imageUrl)
                            ? 'bg-purple-600 border-purple-600 text-white'
                            : 'bg-white border-gray-300'
                        }`}
                      >
                        {selectedImages.includes(imageUrl) && (
                          <Check className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  )}

                  {/* Hover Actions */}
                  {!bulkSelectMode && hoveredImage === imageUrl && (
                    <div className="absolute inset-0 bg-black bg-opacity-30 rounded-lg flex items-center justify-center">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            onImageClick(imageUrl)
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleImageAction('download', imageUrl, generation)
                          }}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleImageAction('favorite', imageUrl, generation)
                          }}
                        >
                          <Heart className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleImageAction('share', imageUrl, generation)
                          }}
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Image Number Badge */}
                  {generation.imageUrls.length > 1 && (
                    <div className="absolute bottom-2 right-2">
                      <Badge variant="secondary" className="text-xs">
                        {index + 1}/{generation.imageUrls.length}
                      </Badge>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : generation.status === 'PROCESSING' ? (
            <Card className="aspect-square">
              <CardContent className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-pulse" />
                  <p className="text-sm text-gray-600">Generating...</p>
                  <p className="text-xs text-gray-500">~30 seconds</p>
                </div>
              </CardContent>
            </Card>
          ) : generation.status === 'FAILED' ? (
            <Card className="aspect-square border-red-200 bg-red-50">
              <CardContent className="flex items-center justify-center h-full">
                <div className="text-center">
                  <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                  <p className="text-sm text-red-600">Failed</p>
                  <p className="text-xs text-red-500">Try again</p>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      ))}
    </div>
  )
}