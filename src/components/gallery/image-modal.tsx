'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  X, 
  Download, 
  Heart, 
  Share2, 
  ChevronLeft, 
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Copy,
  ExternalLink,
  Info
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface ImageModalProps {
  imageUrl: string
  onClose: () => void
  generations: any[]
}

export function ImageModal({ imageUrl, onClose, generations }: ImageModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [currentGeneration, setCurrentGeneration] = useState<any>(null)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [showInfo, setShowInfo] = useState(false)
  const [allImages, setAllImages] = useState<Array<{url: string, generation: any, index: number}>>([])

  useEffect(() => {
    // Build array of all images from all generations
    const images: Array<{url: string, generation: any, index: number}> = []
    
    generations.forEach(generation => {
      if (generation.status === 'COMPLETED' && generation.imageUrls) {
        generation.imageUrls.forEach((url: string, index: number) => {
          images.push({ url, generation, index })
        })
      }
    })
    
    setAllImages(images)
    
    // Find current image index
    const currentIndex = images.findIndex(img => img.url === imageUrl)
    if (currentIndex >= 0) {
      setCurrentImageIndex(currentIndex)
      setCurrentGeneration(images[currentIndex].generation)
    }
  }, [imageUrl, generations])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          navigateImage(-1)
          break
        case 'ArrowRight':
          navigateImage(1)
          break
        case 'i':
        case 'I':
          setShowInfo(!showInfo)
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentImageIndex, showInfo])

  const navigateImage = (direction: number) => {
    if (allImages.length === 0) return
    
    const newIndex = (currentImageIndex + direction + allImages.length) % allImages.length
    setCurrentImageIndex(newIndex)
    setCurrentGeneration(allImages[newIndex].generation)
    setZoom(1)
    setRotation(0)
  }

  const handleDownload = () => {
    if (!allImages[currentImageIndex]) return
    
    const link = document.createElement('a')
    link.href = allImages[currentImageIndex].url
    link.download = `generated-${currentGeneration.prompt.slice(0, 20).replace(/[^a-zA-Z0-9]/g, '_')}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleShare = async () => {
    const currentImage = allImages[currentImageIndex]
    if (!currentImage) return

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AI Generated Photo',
          text: currentGeneration.prompt,
          url: currentImage.url
        })
      } catch (error) {
        navigator.clipboard.writeText(currentImage.url)
        alert('Image URL copied to clipboard!')
      }
    } else {
      navigator.clipboard.writeText(currentImage.url)
      alert('Image URL copied to clipboard!')
    }
  }

  const handleCopyPrompt = () => {
    if (currentGeneration) {
      navigator.clipboard.writeText(currentGeneration.prompt)
      alert('Prompt copied to clipboard!')
    }
  }

  const currentImage = allImages[currentImageIndex]
  
  if (!currentImage) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-black bg-opacity-50 p-4 z-10">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center space-x-4">
            <span className="text-sm">
              {currentImageIndex + 1} of {allImages.length}
            </span>
            {currentGeneration && (
              <Badge variant="secondary">
                {currentGeneration.model?.name || 'Unknown Model'}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowInfo(!showInfo)}
              className="text-white hover:bg-white hover:bg-opacity-20"
            >
              <Info className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      {allImages.length > 1 && (
        <>
          <button
            onClick={() => navigateImage(-1)}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-colors z-10"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button
            onClick={() => navigateImage(1)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-colors z-10"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Image */}
      <div 
        className="relative max-w-full max-h-full flex items-center justify-center cursor-move"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <img
          src={currentImage.url}
          alt="Generated image"
          className="max-w-full max-h-full object-contain transition-transform"
          style={{ 
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
            maxWidth: '90vw',
            maxHeight: '90vh'
          }}
        />
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-4 z-10">
        <div className="flex items-center justify-between text-white">
          {/* Zoom Controls */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
              className="text-white hover:bg-white hover:bg-opacity-20"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm min-w-16 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoom(Math.min(3, zoom + 0.25))}
              className="text-white hover:bg-white hover:bg-opacity-20"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRotation((rotation + 90) % 360)}
              className="text-white hover:bg-white hover:bg-opacity-20"
            >
              <RotateCw className="w-4 h-4" />
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className="text-white hover:bg-white hover:bg-opacity-20"
            >
              <Download className="w-4 h-4 mr-1" />
              Download
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => console.log('Toggle favorite')}
              className="text-white hover:bg-white hover:bg-opacity-20"
            >
              <Heart className="w-4 h-4 mr-1" />
              Save
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="text-white hover:bg-white hover:bg-opacity-20"
            >
              <Share2 className="w-4 h-4 mr-1" />
              Share
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(currentImage.url, '_blank')}
              className="text-white hover:bg-white hover:bg-opacity-20"
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Open
            </Button>
          </div>
        </div>
      </div>

      {/* Info Panel */}
      {showInfo && currentGeneration && (
        <div className="absolute top-16 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg max-w-sm z-10">
          <h3 className="font-semibold mb-3">Image Details</h3>
          
          <div className="space-y-3 text-sm">
            <div>
              <div className="text-gray-300">Prompt:</div>
              <div className="mt-1">
                {currentGeneration.prompt}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyPrompt}
                  className="ml-2 h-6 w-6 p-0 text-gray-300 hover:text-white"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {currentGeneration.negativePrompt && (
              <div>
                <div className="text-gray-300">Negative Prompt:</div>
                <div className="mt-1">{currentGeneration.negativePrompt}</div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-gray-300">Model:</div>
                <div>{currentGeneration.model?.name || 'Unknown'}</div>
              </div>
              <div>
                <div className="text-gray-300">Resolution:</div>
                <div>{currentGeneration.resolution}</div>
              </div>
              <div>
                <div className="text-gray-300">Aspect Ratio:</div>
                <div>{currentGeneration.aspectRatio}</div>
              </div>
              <div>
                <div className="text-gray-300">Style:</div>
                <div className="capitalize">{currentGeneration.style || 'Default'}</div>
              </div>
            </div>

            <div>
              <div className="text-gray-300">Created:</div>
              <div>{formatDate(currentGeneration.createdAt)}</div>
            </div>

            {currentGeneration.processingTime && (
              <div>
                <div className="text-gray-300">Processing Time:</div>
                <div>{(currentGeneration.processingTime / 1000).toFixed(1)}s</div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-600 text-xs text-gray-400">
            Press 'I' to toggle this panel, ESC to close, ← → to navigate
          </div>
        </div>
      )}
    </div>
  )
}