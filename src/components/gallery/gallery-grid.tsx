'use client'

import { useState, useEffect } from 'react'
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
  ZoomIn,
  Edit,
  Video,
  ChevronDown,
  Copy
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { ComparisonModal } from './comparison-modal'
import { ImageModal } from './image-modal'
import { VideoPlayerModal } from './video-player-modal'
import { CompactVideoButton } from '@/components/video/video-button'
import { InstagramIcon, TikTokIcon, WhatsAppIcon, TelegramIcon, GmailIcon } from '@/components/ui/social-icons'
import { sharePhoto, SharePlatform } from '@/lib/utils/social-share'

interface GalleryGridProps {
  generations: any[]
  bulkSelectMode: boolean
  selectedImages: string[]
  onImageSelect: (imageUrl: string) => void
  onImageClick: (imageUrl: string) => void
  onUpscale?: (imageUrl: string, generation: any) => void
  userPlan?: string
}

export function GalleryGrid({
  generations,
  bulkSelectMode,
  selectedImages,
  onImageSelect,
  onImageClick,
  onUpscale,
  userPlan
}: GalleryGridProps) {
  const [hoveredImage, setHoveredImage] = useState<string | null>(null)
  const [shareDropdown, setShareDropdown] = useState<string | null>(null)
  const [shareSubmenu, setShareSubmenu] = useState<string | null>(null)
  const [currentModal, setCurrentModal] = useState<{
    type: 'image' | 'comparison' | 'video' | null
    generation: any | null
    imageUrl?: string
    showSlider?: boolean
  }>({ type: null, generation: null })

  // Close share dropdown and submenu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShareDropdown(null)
      setShareSubmenu(null)
    }

    if (shareDropdown || shareSubmenu) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [shareDropdown, shareSubmenu])

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

  // Helper function to detect image operation type
  const getOperationType = (generation: any) => {
    if (generation.videoUrl) return 'video'
    if (generation.isUpscaled || generation.prompt?.includes('[UPSCALED]')) return 'upscaled'
    if (generation.isEdited || generation.originalImageUrl) return 'edited'
    return 'generated'
  }

  // Helper function to create MediaItem for modal
  const createMediaItem = (generation: any, imageUrl: string) => {
    const operationType = getOperationType(generation)
    return {
      id: generation.id,
      url: imageUrl,
      originalUrl: generation.originalImageUrl,
      thumbnailUrl: generation.thumbnailUrls?.[0] || imageUrl,
      operationType,
      status: generation.status,
      generation,
      metadata: {
        width: generation.width,
        height: generation.height
      }
    }
  }

  // Enhanced click handler for different media types
  const handleMediaClick = (imageUrl: string, generation: any) => {
    if (bulkSelectMode) {
      onImageSelect(imageUrl)
      return
    }

    const operationType = getOperationType(generation)

    switch (operationType) {
      case 'video':
        setCurrentModal({
          type: 'video',
          generation,
          imageUrl
        })
        break
      case 'edited':
        if (!generation.originalImageUrl) {
          console.warn('Edited image missing originalImageUrl, falling back to simple modal')
          onImageClick(imageUrl)
        } else {
          setCurrentModal({
            type: 'comparison',
            generation,
            imageUrl,
            showSlider: false
          })
        }
        break
      case 'upscaled':
        if (!generation.originalImageUrl) {
          console.warn('Upscaled image missing originalImageUrl, falling back to simple modal')
          onImageClick(imageUrl)
        } else {
          setCurrentModal({
            type: 'comparison',
            generation,
            imageUrl,
            showSlider: true
          })
        }
        break
      case 'generated':
      default:
        onImageClick(imageUrl)
        break
    }
  }

  const closeModal = () => {
    setCurrentModal({ type: null, generation: null })
  }

  // Social sharing functions
  // Nova função centralizada de compartilhamento
  const handleShare = async (platform: SharePlatform, imageUrl: string, generation: any) => {
    try {
      console.log(`🚀 [GALLERY] Sharing to ${platform}:`, { imageUrl, generation })

      const result = await sharePhoto({
        imageUrl,
        generation,
        platform
      })

      // Exibe feedback baseado no resultado
      showShareFeedback(result)

      return result.success

    } catch (error) {
      console.error('❌ [GALLERY] Share failed:', error)
      showShareFeedback({
        success: false,
        method: 'copy',
        message: 'Erro no compartilhamento',
        action: 'Tente novamente'
      })
      return false
    }
  }

  // Função para exibir feedback visual
  const showShareFeedback = (result: any) => {
    const toast = document.createElement('div')

    // Ícone baseado no sucesso
    const icon = result.success ? '✅' : '❌'

    // Cor baseada no sucesso
    const bgColor = result.success ? '#10b981' : '#ef4444'

    toast.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 16px;">${icon}</span>
        <div>
          <div style="font-weight: 600;">${result.message}</div>
          ${result.action ? `<div style="font-size: 12px; opacity: 0.9;">${result.action}</div>` : ''}
        </div>
      </div>
    `

    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${bgColor};
      color: white;
      padding: 16px 20px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 500;
      z-index: 1000;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      animation: slideIn 0.3s ease-out;
      max-width: 320px;
      min-width: 250px;
    `

    document.body.appendChild(toast)

    // Add animation keyframes if not exists
    if (!document.getElementById('share-toast-styles')) {
      const style = document.createElement('style')
      style.id = 'share-toast-styles'
      style.textContent = `
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `
      document.head.appendChild(style)
    }

    // Remove toast after delay
    setTimeout(() => {
      if (document.body.contains(toast)) {
        toast.style.animation = 'slideIn 0.3s ease-out reverse'
        setTimeout(() => {
          if (document.body.contains(toast)) {
            document.body.removeChild(toast)
          }
        }, 300)
      }
    }, 4000)
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
      case 'upscale':
        onUpscale?.(imageUrl, generation)
        break
      case 'edit':
        // Navigate to editor with image URL
        window.open(`/editor?image=${encodeURIComponent(imageUrl)}&generationId=${generation.id}`, '_blank')
        break
      case 'video':
        // Video creation is handled by the CompactVideoButton component
        break
      case 'share-dropdown':
        // Toggle share dropdown
        setShareDropdown(shareDropdown === imageUrl ? null : imageUrl)
        setShareSubmenu(null) // Close submenu when opening dropdown
        break
      case 'share-submenu':
        // Toggle share submenu
        setShareSubmenu(shareSubmenu === imageUrl ? null : imageUrl)
        break
      case 'share-email':
        handleShare('gmail', imageUrl, generation)
        break
      case 'share-copy':
        handleShare('copy', imageUrl, generation)
        break
      case 'share-whatsapp-direct':
        handleShare('whatsapp', imageUrl, generation)
        break
      case 'share-telegram':
        handleShare('telegram', imageUrl, generation)
        break
    }
  }

  return (
    <>
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
                      onClick={() => handleMediaClick(imageUrl, generation)}
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
                      <div className="flex space-x-1">
                        {/* 1. Ver imagem */}
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleMediaClick(imageUrl, generation)
                          }}
                          title="Ver imagem"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>

                        {/* 2. Baixar imagem */}
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleImageAction('download', imageUrl, generation)
                          }}
                          title="Baixar imagem"
                        >
                          <Download className="w-4 h-4" />
                        </Button>

                        {/* 3. Favoritar */}
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleImageAction('favorite', imageUrl, generation)
                          }}
                          title="Favoritar"
                        >
                          <Heart className="w-4 h-4" />
                        </Button>

                        {/* 4. Fazer upscale */}
                        {onUpscale && (
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-8 w-8 p-0"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleImageAction('upscale', imageUrl, generation)
                            }}
                            title="Fazer upscale"
                          >
                            <ZoomIn className="w-4 h-4" />
                          </Button>
                        )}

                        {/* 5. Editar imagem */}
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleImageAction('edit', imageUrl, generation)
                          }}
                          title="Editar imagem"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>

                        {/* 6. Criar vídeo */}
                        <CompactVideoButton
                          imageUrl={imageUrl}
                          mode="image-to-video"
                          generation={generation}
                          userPlan={userPlan || 'FREE'}
                        />

                        {/* 7. Compartilhar */}
                        <div className="relative">
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-8 w-8 p-0"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleImageAction('share-dropdown', imageUrl, generation)
                            }}
                            title="Compartilhar"
                          >
                            <Share2 className="w-4 h-4" />
                          </Button>

                          {/* Share Dropdown */}
                          {shareDropdown === imageUrl && (
                            <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border p-2 min-w-[180px] z-50">
                              <button
                                className="flex items-center space-x-2 w-full p-2 hover:bg-gray-100 rounded text-sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleShare('instagram', imageUrl, generation)
                                  setShareDropdown(null)
                                }}
                              >
                                <InstagramIcon size={20} />
                                <span className="text-gray-700">Instagram</span>
                              </button>

                              <button
                                className="flex items-center space-x-2 w-full p-2 hover:bg-gray-100 rounded text-sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleShare('tiktok', imageUrl, generation)
                                  setShareDropdown(null)
                                }}
                              >
                                <TikTokIcon size={20} />
                                <span className="text-gray-700">TikTok</span>
                              </button>

                              <button
                                className="flex items-center space-x-2 w-full p-2 hover:bg-gray-100 rounded text-sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleShare('whatsapp', imageUrl, generation)
                                  setShareDropdown(null)
                                }}
                              >
                                <WhatsAppIcon size={20} />
                                <span className="text-gray-700">WhatsApp</span>
                              </button>

                              <div className="border-t border-gray-200 my-1"></div>

                              {/* Outros Compartilhamentos Submenu */}
                              <div className="relative">
                                <button
                                  className="flex items-center justify-between w-full p-2 hover:bg-gray-100 rounded text-sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleImageAction('share-submenu', imageUrl, generation)
                                  }}
                                >
                                  <div className="flex items-center space-x-2">
                                    <MoreHorizontal size={20} />
                                    <span className="text-gray-700">Outros compartilhamentos</span>
                                  </div>
                                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${shareSubmenu === imageUrl ? 'rotate-0' : 'rotate-270'}`} />
                                </button>

                                {/* Submenu - appears on click */}
                                {shareSubmenu === imageUrl && (
                                  <div className="absolute left-full top-0 ml-1 bg-white rounded-lg shadow-lg border p-2 min-w-[160px] z-60">
                                    <button
                                      className="flex items-center space-x-2 w-full p-2 hover:bg-gray-100 rounded text-sm"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleImageAction('share-email', imageUrl, generation)
                                        setShareDropdown(null)
                                        setShareSubmenu(null)
                                      }}
                                    >
                                      <GmailIcon size={16} />
                                      <span className="text-gray-700">Gmail</span>
                                    </button>

                                    <button
                                      className="flex items-center space-x-2 w-full p-2 hover:bg-gray-100 rounded text-sm"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleImageAction('share-copy', imageUrl, generation)
                                        setShareDropdown(null)
                                        setShareSubmenu(null)
                                      }}
                                    >
                                      <Copy size={16} className="text-gray-600" />
                                      <span className="text-gray-700">Copiar Link</span>
                                    </button>

                                    <button
                                      className="flex items-center space-x-2 w-full p-2 hover:bg-gray-100 rounded text-sm"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleImageAction('share-telegram', imageUrl, generation)
                                        setShareDropdown(null)
                                        setShareSubmenu(null)
                                      }}
                                    >
                                      <TelegramIcon size={16} />
                                      <span className="text-gray-700">Telegram</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
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

      {/* Modals */}
      {currentModal.type === 'comparison' && currentModal.generation && currentModal.imageUrl && (
        <ComparisonModal
          mediaItem={createMediaItem(currentModal.generation, currentModal.imageUrl)}
          onClose={closeModal}
          showSlider={currentModal.showSlider || false}
        />
      )}

      {currentModal.type === 'video' && currentModal.generation && (
        <VideoPlayerModal
          mediaItem={createMediaItem(currentModal.generation, currentModal.generation.videoUrl)}
          onClose={closeModal}
        />
      )}
    </>
  )
}