'use client'

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
  Check,
  Image,
  Calendar,
  User
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface GalleryListProps {
  generations: any[]
  bulkSelectMode: boolean
  selectedImages: string[]
  onImageSelect: (imageUrl: string) => void
  onImageClick: (imageUrl: string) => void
}

export function GalleryList({ 
  generations, 
  bulkSelectMode, 
  selectedImages, 
  onImageSelect, 
  onImageClick 
}: GalleryListProps) {
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
        console.log('Favorite:', imageUrl)
        break
    }
  }

  return (
    <div className="space-y-4">
      {generations.map((generation) => (
        <Card key={generation.id} className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              {/* Thumbnail Preview */}
              <div className="flex-shrink-0">
                {generation.status === 'COMPLETED' && generation.imageUrls.length > 0 ? (
                  <div className="relative group">
                    <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={generation.thumbnailUrls?.[0] || generation.imageUrls[0]}
                        alt="Generation preview"
                        className="w-full h-full object-cover cursor-pointer transition-transform group-hover:scale-105"
                        onClick={() => onImageClick(generation.imageUrls[0])}
                      />
                    </div>
                    
                    {generation.imageUrls.length > 1 && (
                      <Badge variant="secondary" className="absolute -bottom-1 -right-1 text-xs">
                        +{generation.imageUrls.length - 1}
                      </Badge>
                    )}
                    
                    {bulkSelectMode && (
                      <button
                        onClick={() => onImageSelect(generation.imageUrls[0])}
                        className={`absolute top-1 left-1 w-5 h-5 rounded border flex items-center justify-center ${
                          selectedImages.includes(generation.imageUrls[0])
                            ? 'bg-purple-600 border-purple-600 text-white'
                            : 'bg-white border-gray-300'
                        }`}
                      >
                        {selectedImages.includes(generation.imageUrls[0]) && (
                          <Check className="w-3 h-3" />
                        )}
                      </button>
                    )}
                  </div>
                ) : generation.status === 'PROCESSING' ? (
                  <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-gray-400 animate-pulse" />
                  </div>
                ) : (
                  <div className="w-24 h-24 bg-red-50 border border-red-200 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-red-400" />
                  </div>
                )}
              </div>

              {/* Generation Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(generation.status)}
                    <Badge variant="secondary" className={getStatusColor(generation.status)}>
                      {generation.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      {formatDate(generation.createdAt)}
                    </span>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                  {generation.prompt}
                </h3>

                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                  {generation.model && (
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {generation.model.name}
                    </div>
                  )}
                  
                  {generation.imageUrls && (
                    <div className="flex items-center">
                      <Image className="w-4 h-4 mr-1" />
                      {generation.imageUrls.length} image{generation.imageUrls.length !== 1 ? 's' : ''}
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(generation.createdAt)}
                  </div>
                  
                  {generation.processingTime && (
                    <span>
                      {(generation.processingTime / 1000).toFixed(1)}s
                    </span>
                  )}
                </div>

                {/* Generation Settings */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="outline" className="text-xs">
                    {generation.resolution}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {generation.aspectRatio}
                  </Badge>
                  {generation.style && (
                    <Badge variant="outline" className="text-xs">
                      {generation.style}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {generation.variations} var{generation.variations !== 1 ? 's' : ''}
                  </Badge>
                </div>

                {/* Actions */}
                {generation.status === 'COMPLETED' && generation.imageUrls.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onImageClick(generation.imageUrls[0])}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View All ({generation.imageUrls.length})
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleImageAction('download', generation.imageUrls[0], generation)}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleImageAction('favorite', generation.imageUrls[0], generation)}
                    >
                      <Heart className="w-4 h-4 mr-1" />
                      Save
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleImageAction('share', generation.imageUrls[0], generation)}
                    >
                      <Share2 className="w-4 h-4 mr-1" />
                      Share
                    </Button>
                  </div>
                )}

                {generation.status === 'PROCESSING' && (
                  <div className="flex items-center text-yellow-600">
                    <Clock className="w-4 h-4 mr-2 animate-pulse" />
                    <span className="text-sm">Generating... (~30 seconds remaining)</span>
                  </div>
                )}

                {generation.status === 'FAILED' && (
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center text-red-600">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      <span className="text-sm">Generation failed</span>
                    </div>
                    <Button size="sm" variant="outline">
                      Retry
                    </Button>
                  </div>
                )}
              </div>

              {/* Image Grid */}
              {generation.status === 'COMPLETED' && generation.imageUrls.length > 1 && (
                <div className="flex-shrink-0 hidden md:block">
                  <div className="grid grid-cols-2 gap-1 w-20">
                    {generation.imageUrls.slice(1, 5).map((imageUrl: string, index: number) => (
                      <div
                        key={index}
                        className="aspect-square bg-gray-100 rounded overflow-hidden cursor-pointer"
                        onClick={() => onImageClick(imageUrl)}
                      >
                        <img
                          src={generation.thumbnailUrls?.[index + 1] || imageUrl}
                          alt={`Image ${index + 2}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}