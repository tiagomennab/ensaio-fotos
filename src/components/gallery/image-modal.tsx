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
  Info,
  Edit2,
  ChevronDown
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { MediaItem } from '@/types'
import Link from 'next/link'

interface ImageModalProps {
  mediaItem: MediaItem
  onClose: () => void
  allImages: MediaItem[]
}

export function ImageModal({ mediaItem, onClose, allImages }: ImageModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [showInfo, setShowInfo] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)

  useEffect(() => {
    // Find current image index in the array
    const currentIndex = allImages.findIndex(img => img.id === mediaItem.id)
    if (currentIndex >= 0) {
      setCurrentImageIndex(currentIndex)
    }
  }, [mediaItem.id, allImages])

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
    setZoom(1)
    setRotation(0)
  }

  const handleDownload = () => {
    const currentImage = allImages[currentImageIndex]
    if (!currentImage) return

    const link = document.createElement('a')
    link.href = currentImage.url
    link.download = `generated-${currentImage.id}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleShare = async (action?: string) => {
    const currentImage = allImages[currentImageIndex]
    if (!currentImage) return

    const promptText = currentImage.generation?.prompt || 'AI Generated Photo'

    switch (action) {
      case 'instagram':
        const instagramUrl = `https://www.instagram.com/create/story/?url=${encodeURIComponent(currentImage.url)}`
        window.open(instagramUrl, '_blank')
        break
      case 'tiktok':
        const tiktokUrl = `https://www.tiktok.com/upload?url=${encodeURIComponent(currentImage.url)}`
        window.open(tiktokUrl, '_blank')
        break
      case 'whatsapp':
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`Olha essa foto incrível gerada por IA! ${currentImage.url}`)}`
        window.open(whatsappUrl, '_blank')
        break
      default:
        if (navigator.share) {
          try {
            await navigator.share({
              title: 'AI Generated Photo',
              text: promptText,
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
    setShowShareMenu(false)
  }

  const handleCopyPrompt = () => {
    const currentImage = allImages[currentImageIndex]
    if (currentImage?.generation?.prompt) {
      navigator.clipboard.writeText(currentImage.generation.prompt)
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
            {currentImage.generation && (
              <Badge variant="secondary">
                {currentImage.generation.model?.name || 'Unknown Model'}
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
            {currentImage.operationType === 'generated' && (
              <Link href={`/editor?image=${encodeURIComponent(currentImage.url)}`}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white hover:bg-opacity-20"
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  Editar
                </Button>
              </Link>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => console.log('Toggle favorite')}
              className="text-white hover:bg-white hover:bg-opacity-20"
            >
              <Heart className="w-4 h-4 mr-1" />
              Save
            </Button>
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="text-white hover:bg-white hover:bg-opacity-20"
              >
                <Share2 className="w-4 h-4 mr-1" />
                Share
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>

              {showShareMenu && (
                <div className="absolute bottom-full left-0 mb-2 bg-black bg-opacity-90 border border-gray-600 rounded-lg shadow-lg min-w-48">
                  <div className="py-1">
                    <button
                      onClick={() => handleShare('instagram')}
                      className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white hover:bg-opacity-20 flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <defs>
                          <linearGradient id="instagram-gradient-modal" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#833ab4" />
                            <stop offset="50%" stopColor="#fd1d1d" />
                            <stop offset="100%" stopColor="#fcb045" />
                          </linearGradient>
                        </defs>
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="url(#instagram-gradient-modal)" />
                        <rect x="4" y="4" width="16" height="16" rx="3" ry="3" stroke="white" strokeWidth="2" fill="none" />
                        <circle cx="12" cy="12" r="3" stroke="white" strokeWidth="2" fill="none" />
                        <circle cx="17.5" cy="6.5" r="1.5" fill="white" />
                      </svg>
                      <span>Instagram</span>
                    </button>
                    <button
                      onClick={() => handleShare('tiktok')}
                      className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white hover:bg-opacity-20 flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="white">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-.88-.05A6.33 6.33 0 0 0 5.76 20.8a6.34 6.34 0 0 0 10.86-4.43V8.56a8.16 8.16 0 0 0 4.77 1.53v-3.4a4.85 4.85 0 0 1-1.8 0z"/>
                      </svg>
                      <span>TikTok</span>
                    </button>
                    <button
                      onClick={() => handleShare('whatsapp')}
                      className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white hover:bg-opacity-20 flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#25D366">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488"/>
                      </svg>
                      <span>WhatsApp</span>
                    </button>
                    <hr className="border-gray-600 my-1" />
                    <button
                      onClick={() => handleShare()}
                      className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white hover:bg-opacity-20 flex items-center space-x-2"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Compartilhar geral</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(currentImage.url, '_blank')}
              className="text-white hover:bg-white hover:bg-opacity-20"
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Open
            </Button>
            <Link href="/gallery">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white hover:bg-opacity-20"
              >
                Ver Galeria
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Info Panel */}
      {showInfo && currentImage && (
        <div className="absolute top-16 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg max-w-sm z-10">
          <h3 className="font-semibold mb-3">Image Details</h3>

          <div className="space-y-3 text-sm">
            {currentImage.generation?.prompt && (
              <div>
                <div className="text-gray-300">Prompt:</div>
                <div className="mt-1">
                  {currentImage.generation.prompt}
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
            )}

            {currentImage.generation?.negativePrompt && (
              <div>
                <div className="text-gray-300">Negative Prompt:</div>
                <div className="mt-1">{currentImage.generation.negativePrompt}</div>
              </div>
            )}

            <div>
              <div className="text-gray-300">Type:</div>
              <div className="capitalize">{currentImage.operationType}</div>
            </div>

            <div>
              <div className="text-gray-300">Status:</div>
              <div className="capitalize">{currentImage.status.toLowerCase()}</div>
            </div>

            {currentImage.metadata && (
              <>
                {currentImage.metadata.width && currentImage.metadata.height && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-gray-300">Dimensions:</div>
                      <div>{currentImage.metadata.width} × {currentImage.metadata.height}</div>
                    </div>
                    {currentImage.metadata.format && (
                      <div>
                        <div className="text-gray-300">Format:</div>
                        <div className="uppercase">{currentImage.metadata.format}</div>
                      </div>
                    )}
                  </div>
                )}

                {currentImage.metadata.sizeBytes && (
                  <div>
                    <div className="text-gray-300">Size:</div>
                    <div>{(currentImage.metadata.sizeBytes / 1024 / 1024).toFixed(1)} MB</div>
                  </div>
                )}
              </>
            )}

            {currentImage.generation && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-gray-300">Model:</div>
                    <div>{currentImage.generation.model?.name || 'Unknown'}</div>
                  </div>
                  {currentImage.generation.resolution && (
                    <div>
                      <div className="text-gray-300">Resolution:</div>
                      <div>{currentImage.generation.resolution}</div>
                    </div>
                  )}
                  {currentImage.generation.aspectRatio && (
                    <div>
                      <div className="text-gray-300">Aspect Ratio:</div>
                      <div>{currentImage.generation.aspectRatio}</div>
                    </div>
                  )}
                  {currentImage.generation.style && (
                    <div>
                      <div className="text-gray-300">Style:</div>
                      <div className="capitalize">{currentImage.generation.style}</div>
                    </div>
                  )}
                </div>

                {currentImage.generation.createdAt && (
                  <div>
                    <div className="text-gray-300">Created:</div>
                    <div>{formatDate(currentImage.generation.createdAt)}</div>
                  </div>
                )}

                {currentImage.generation.processingTime && (
                  <div>
                    <div className="text-gray-300">Processing Time:</div>
                    <div>{(currentImage.generation.processingTime / 1000).toFixed(1)}s</div>
                  </div>
                )}
              </>
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